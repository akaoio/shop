/**
 * Access control and authentication module using WebAuthn passkeys.
 * Manages user authentication state, wallet information, and key pair generation.
 * Integrates with SEA (Simple End-to-End Cryptography) for encryption and Gun database.
 */

import { webauthn } from "./WebAuthn.js"
import { States } from "./States.js"

/**
 * Reactive state store for user authentication and access information.
 * @property {boolean} authenticated - Whether user is currently authenticated
 * @property {ArrayBuffer} id - Passkey credential ID (not user ID)
 * @property {string} pub - Public key of the passkey (stored encrypted in Gun)
 * @property {Object} pair - SEA key pair generated from user ID (used for encryption)
 * @property {Object} wallet - Current wallet information { id, total }
 */
export const Access = new States({
    authenticated: false,
    id: null, // This is the passkey's credential ID
    pub: null, // This is the public key of the passkey, not pub of the pair bellow
    pair: null, // This is the key pair generated from the user's ID
    wallet: null // This is only ID of the current wallet, not the wallet object itself, we use this to calculate wallet seed.
})

/**
 * Retrieve wallet information from local storage.
 * Returns cached wallet data or defaults to wallet ID 0.
 * Automatically fixes and re-saves malformed wallet data.
 * @returns {Object} Wallet object with id and total
 */
export function getWallet() {
    const memory = globalThis.localStorage ? globalThis.localStorage.getItem("wallet") : null
    let data = { id: 0 }
    let wallet
    try {
        if (memory) data = JSON.parse(memory)
        if (typeof data === "object") wallet = JSON.stringify(data)
    } catch (error) { }
    // Auto-correct and save if data was modified during parsing
    if (wallet && wallet !== memory && globalThis.localStorage) globalThis.localStorage.setItem("wallet", wallet)
    return data
}

/**
 * Save or update wallet information in local storage and Access state.
 * Only updates if user is authenticated.
 * @param {Object} options - Wallet update options
 * @param {number} options.id - Wallet ID (uses current wallet if not provided)
 * @param {number} options.total - Wallet total (uses current wallet if not provided)
 * @returns {Object} Updated wallet data
 */
export function setWallet({ id, total } = {}) {
    // Only proceed if user is authenticated and id is not null and id is different to the current wallet ID
    if (!Access.get("authenticated")) return
    const wallet = Access.get("wallet") ?? getWallet()
    let data = {
        id: id ?? wallet.id ?? 0,
        total: total ?? wallet.total
    }
    let json
    try {
        json = JSON.stringify(data)
    } catch (error) { }
    if (json && globalThis.localStorage) globalThis.localStorage.setItem("wallet", json)
    Access.set({ wallet: data })
    return data
}

/**
 * Internal handler for completing authentication after WebAuthn credential verification.
 * Generates SEA key pair from credential hash and updates Access state.
 * @param {Object} credential - WebAuthn credential from create() or authenticate()
 * @returns {Object} Credential object with authentication state updated
 */
async function next(credential) {
    if (!credential || !credential?.id) return { error: "Invalid credential" }
    const { sea } = globalThis
    // Generate deterministic hash from credential ID to seed key pair generation
    const hash = await sea.work(credential.id, "self") // "self" is the default salt
    // Generate SEA key pair for user (used for encrypting data in Gun)
    const pair = await sea.pair(null, { seed: hash })
    Access.set({
        authenticated: true,
        id: credential.id,
        credential,
        pair,
        wallet: getWallet() // Get the wallet ID from the local storage
    })
    return credential
}

/**
 * Encrypt and save the passkey public key to Gun database.
 * Stores encrypted public key under user's key pair pub.
 * Called after successful signup to save the passkey pub for later recovery.
 * @param {Object} credential - WebAuthn credential containing pub
 * @returns {Object} Encrypted public key data
 */
async function save(credential) {
    const { gun, sea } = globalThis
    const pair = Access.get("pair")
    if (!pair) return { error: "No pair found" }
    // Encrypt passkey pub with user's key pair
    const encrypted = await sea.encrypt(credential.pub, pair)
    // Store encrypted pub in Gun database under user's pub
    gun.get(`~${pair.pub}`)
        .get("@")
        .put(encrypted, null, { opt: { authenticator: pair } })
    return encrypted
}

/**
 * Restore the encrypted passkey public key from Gun database.
 * Decrypts and loads the previously saved public key into Access state.
 * Called after signin to recover the passkey pub.
 * @returns {Object} Decrypted public key or error
 */
async function restore() {
    const { gun, sea } = globalThis
    const pair = Access.get("pair")
    if (!pair) return { error: "No pair found" }
    // Retrieve encrypted pub from Gun database
    const encrypted = await gun.get(`~${pair.pub}`).get("@")
    if (!encrypted) return { error: "No encrypted public key found" }
    // Decrypt using user's key pair
    const decrypted = await sea.decrypt(encrypted, pair)
    if (!decrypted) return { error: "Unable to decrypt data" }
    Access.set({ pub: decrypted })
    return decrypted
}

/**
 * Sign up a new user with WebAuthn passkey.
 * Creates a new passkey credential, authenticates, and saves the public key.
 * @param {Object} data - WebAuthn credential creation options
 * @returns {Promise<Object>} Credential object or error
 */
export const signup = function (data) {
    return webauthn
        .create(data)
        .then(next)
        .then(async (credential) => {
            if (!Access.get("authenticated")) return { error: "Unauthenticated" }
            if (!credential?.pub) return { error: "No public key found" }
            save(pub)
            return credential
        })
}

/**
 * Sign in an existing user with WebAuthn passkey.
 * Authenticates with existing passkey and restores the public key from Gun.
 * @param {Object} data - WebAuthn authentication options
 * @returns {Promise<Object>} Credential object or error
 */
export const signin = function (data) {
    return webauthn
        .authenticate(data)
        .then(next)
        .then(async (credential) => {
            if (!Access.get("authenticated")) return { error: "Unauthenticated" }
            if (!Access.get("pub")) restore()
            return credential
        })
}

/**
 * Sign out the current user.
 * Clears all authentication state and user information from Access store.
 */
export const signout = function () {
    Access.set({ authenticated: false, id: null, pub: null, pair: null, wallet: null })
}
