import { webauthn } from "./WebAuthn.js"
import { States } from "./States.js"

export const Access = new States({
    authenticated: false,
    id: null, // This is the passkey's credential ID
    pub: null, // This is the public key of the passkey, not pub of the pair bellow
    pair: null, // This is the key pair generated from the user's ID
    wallet: null // This is only ID of the current wallet, not the wallet object itself, we use this to calculate wallet seed.
})

export function getWallet() {
    const memory = globalThis.localStorage ? globalThis.localStorage.getItem("wallet") : null
    let data = { id: 0 }
    let wallet
    try {
        if (memory) data = JSON.parse(memory)
        if (typeof data === "object") wallet = JSON.stringify(data)
    } catch (error) {}
    if (wallet && wallet !== memory && globalThis.localStorage) globalThis.localStorage.setItem("wallet", wallet)
    return data
}

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
    } catch (error) {}
    if (json && globalThis.localStorage) globalThis.localStorage.setItem("wallet", json)
    Access.set({ wallet: data })
    return data
}

const next = async (credential) => {
    if (!credential || !credential?.id) return { error: "Invalid credential" }
    const { sea } = globalThis
    const hash = await sea.work(credential.id, "self") // "self" is the default salt
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

// Encrypt passkey pub and save it, we might use it later
const save = async (credential) => {
    const { gun, sea } = globalThis
    const pair = Access.get("pair")
    if (!pair) return { error: "No pair found" }
    const encrypted = await sea.encrypt(credential.pub, pair)
    gun.get(`~${pair.pub}`)
        .get("@")
        .put(encrypted, null, { opt: { authenticator: pair } })
    return encrypted
}

// Try to restore the passkey pub
const restore = async () => {
    const { gun, sea } = globalThis
    const pair = Access.get("pair")
    if (!pair) return { error: "No pair found" }
    const encrypted = await gun.get(`~${pair.pub}`).get("@")
    if (!encrypted) return { error: "No encrypted public key found" }
    const decrypted = await sea.decrypt(encrypted, pair)
    if (!decrypted) return { error: "Unable to decrypt data" }
    Access.set({ pub: decrypted })
    return decrypted
}

export const signup = (data) => {
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

export const signin = (data) => {
    return webauthn
        .authenticate(data)
        .then(next)
        .then(async (credential) => {
            if (!Access.get("authenticated")) return { error: "Unauthenticated" }
            if (!Access.get("pub")) restore()
            return credential
        })
}

export const signout = () => {
    Access.set({ authenticated: false, id: null, pub: null, pair: null, wallet: null })
}
