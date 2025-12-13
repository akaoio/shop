/**
 * WebAuthn (Web Authentication) API wrapper for passkey-based authentication.
 * Provides methods for credential creation, authentication, and signing using WebAuthn/FIDO2.
 * Supports both resident keys and server-side credential storage.
 */

import { Statics } from "./Stores.js"
import { bufferToBase64Url } from "./Utils/crypto.js"

export class WebAuthn {
    /**
     * Initialize WebAuthn with configuration.
     * Sets up relying party (RP) information from static site config.
     * @param {Object} configs - Configuration object for WebAuthn
     */
    constructor(configs = {}) {
        this.configs = { configs }
        // Set relying party (RP) information - identifies the website to the authenticator
        this.configs.rp = this.configs?.rp || {}
        this.configs.rp.id = this.configs.rp?.id || Statics.site.domain
        this.configs.rp.name = this.configs.rp?.name || Statics.site.name
    }

    /**
     * Create a new passkey credential.
     * Generates a random challenge and prompts user to create a passkey (e.g., fingerprint, face recognition).
     * @param {Object} options - Credential creation options
     * @param {string|undefined} options.id - User ID (generated randomly if not provided)
     * @param {string} options.name - User name/username
     * @param {string} options.displayName - User display name
     * @param {string} options.attachment - Authenticator attachment (e.g., 'platform', 'cross-platform')
     * @returns {Promise<Object>} Credential object with id, pub (public key), and other metadata
     */
    create({ id, name, displayName, attachment } = {}) {
        // Convert user ID to bytes or generate random ID
        id = id ? new TextEncoder().encode(id) : crypto.getRandomValues(new Uint8Array(32))
        name = name || ""
        displayName = displayName || ""

        // Generate a random challenge (important for security)
        const challenge = crypto.getRandomValues(new Uint8Array(32))

        const user = { id, name, displayName }

        const options = {
            publicKey: {
                challenge,
                rp: this.configs.rp,
                // Supported public key algorithms (in order of preference)
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 }, // ECDSA, P-256 curve - widely supported
                    { type: "public-key", alg: -257 }, // RSASSA-PKCS1-v1_5 with SHA-256 - widely supported
                    { type: "public-key", alg: -25 } // ECDH, P-256 curve, SEA compatible
                ],
                timeout: 60000, // 60 second timeout for user interaction
                attestation: "none", // Don't require attestation statement
                user
            }
        }

        // Authenticator selection criteria
        const authenticatorSelection = {
            userVerification: "preferred", // Prefer user verification (PIN, biometric)
            residentKey: "required", // Require resident key (passkey stored on authenticator)
            requireResidentKey: true
        }

        // Add authenticator attachment preference if specified
        if (attachment) authenticatorSelection.authenticatorAttachment = attachment
        if (Object.entries(authenticatorSelection).length > 0) options.publicKey.authenticatorSelection = authenticatorSelection

        return navigator.credentials
            .create(options)
            .then((attestation) => {
                if (!attestation?.rawId || !attestation?.response || !attestation?.response?.getPublicKey) return
                // Extract public key from attestation response
                // pub is the passkey's public key in the format x.y, it should be stored in the database
                // signatures don't have public key, and P-256 is irrecoverable, so we must store the public key somewhere
                const raw = new Uint8Array(attestation.response.getPublicKey())
                const credential = {
                    id: attestation.rawId, // attestation.id is NOT RELIABLE, so we must use rawId instead. This is passkey's id, not user id from the inputs
                    attachment: attestation.authenticatorAttachment,
                    type: attestation.type,
                    response: attestation.response,
                    pub: `${bufferToBase64Url(raw.slice(27, 59))}.${bufferToBase64Url(raw.slice(59, 91))}`, // This is the passkey's public key, not the user's public key
                    user // This is the user object from the inputs, including id, name, and displayName
                }
                return credential
            })
            .catch((error) => {
                if (error.name === "NotAllowedError") {
                    console.log("User cancelled passkey creation")
                    return null // Don't re-throw user cancellation
                } else {
                    console.log("Error creating passkey:", error)
                    throw error // Only re-throw unexpected errors
                }
            })
    }

    /**
     * Authenticate with an existing passkey.
     * Prompts user to authenticate using a previously registered passkey.
     * @param {Object} options - Authentication options
     * @param {ArrayBuffer|undefined} options.id - Specific credential ID to authenticate with (optional)
     * @returns {Promise<Object>} Assertion object with credential information
     */
    authenticate({ id } = {}) {
        // Generate a random challenge for this authentication
        const challenge = crypto.getRandomValues(new Uint8Array(32))

        const options = {
            challenge,
            timeout: 60000, // 60 second timeout
            userVerification: "preferred",
            rpId: this.configs.rp.id
        }

        // Add specific credential if provided (for targeted authentication)
        if (id) options.allowCredentials = [{ id, type: "public-key" }]

        return navigator.credentials
            .get({ publicKey: options })
            .then((assertion) => {
                if (!assertion?.rawId || !assertion?.response) return
                const credential = {
                    id: assertion.rawId,
                    attachment: assertion.authenticatorAttachment,
                    type: assertion.type,
                    response: assertion.response
                }
                return credential
            })
            .catch((error) => {
                if (error.name === "NotAllowedError") {
                    console.log("User cancelled authentication")
                    return null
                } else {
                    console.log("Error during authentication:", error)
                    throw error
                }
            })
    }

    /**
     * Sign data with a passkey.
     * Uses the authenticator to create a cryptographic signature of the provided data.
     * @param {Object} options - Signing options
     * @param {string} options.data - Data to sign
     * @param {ArrayBuffer|undefined} options.id - Specific credential ID to use for signing (optional)
     * @returns {Promise<Object>} Signature object with data, signature, and authenticator data
     */
    sign({ data, id } = {}) {
        // Convert data to challenge bytes (used by the authenticator)
        const challenge = new TextEncoder().encode(data)

        const options = {
            challenge: challenge,
            userVerification: "preferred",
            rpId: this.configs.rp.id
        }

        // Add specific credential if provided (for targeted signing)
        if (id) options.allowCredentials = [{ id, type: "public-key" }]

        return navigator.credentials
            .get({ publicKey: options })
            .then((assertion) => {
                if (!assertion) return
                // Parse the clientDataJSON to get the original data
                const decoder = new TextDecoder()
                const clientDataJSON = JSON.parse(decoder.decode(assertion.response.clientDataJSON))
                const origin = decoder.decode(Uint8Array.from(atob(clientDataJSON.challenge), (c) => c.charCodeAt(0)))

                // Convert ArrayBuffers to Uint8Arrays and include the original data
                return {
                    data: origin, // Original data in text
                    response: assertion.response,
                    signature: new Uint8Array(assertion.response.signature),
                    authenticatorData: new Uint8Array(assertion.response.authenticatorData),
                    clientDataJSON: new Uint8Array(assertion.response.clientDataJSON)
                }
            })
            .catch((error) => {
                if (error.name === "NotAllowedError") {
                    console.log("User cancelled signing")
                    return null
                } else {
                    console.error("Error signing with passkey:", error)
                    throw error
                }
            })
    }
}

export default WebAuthn

// Create or reuse global WebAuthn singleton instance
export const webauthn = new WebAuthn()
