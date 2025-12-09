import { Statics } from "./Stores.js"
import { bufferToBase64Url } from "./Utils/crypto.js"

export class WebAuthn {
    constructor(configs = {}) {
        this.configs = { configs }
        this.configs.rp = this.configs?.rp || {}
        this.configs.rp.id = this.configs.rp?.id || Statics.site.domain
        this.configs.rp.name = this.configs.rp?.name || Statics.site.name
    }

    create = ({ id, name, displayName, attachment } = {}) => {
        id = id ? new TextEncoder().encode(id) : crypto.getRandomValues(new Uint8Array(32))
        name = name || ""
        displayName = displayName || ""

        // Generate a random challenge (important)
        const challenge = crypto.getRandomValues(new Uint8Array(32))

        const user = { id, name, displayName }

        const options = {
            publicKey: {
                challenge,
                rp: this.configs.rp,
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 }, // ECDSA, P-256 curve - widely supported
                    { type: "public-key", alg: -257 }, // RSASSA-PKCS1-v1_5 with SHA-256 - widely supported
                    { type: "public-key", alg: -25 } // ECDH, P-256 curve, SEA compatible
                ],
                timeout: 60000,
                attestation: "none",
                user
            }
        }

        const authenticatorSelection = {
            userVerification: "preferred",
            residentKey: "required",
            requireResidentKey: true
        }

        if (attachment) authenticatorSelection.authenticatorAttachment = attachment
        if (Object.entries(authenticatorSelection).length > 0) options.publicKey.authenticatorSelection = authenticatorSelection
        return navigator.credentials
            .create(options)
            .then((attestation) => {
                if (!attestation?.rawId || !attestation?.response || !attestation?.response?.getPublicKey) return
                // pub is the passkey's public key in the format x.y, it should be stored in the database
                // signatures don't have public key, and P-256 is inrecovarable, so we must store the public key somewhere
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

    authenticate = ({ id } = {}) => {
        const challenge = crypto.getRandomValues(new Uint8Array(32))

        const options = {
            challenge,
            timeout: 60000,
            userVerification: "preferred",
            rpId: this.configs.rp.id
        }

        // Add specific credential if provided
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

    sign = ({ data, id } = {}) => {
        // Convert data to challenge bytes
        const challenge = new TextEncoder().encode(data)

        const options = {
            challenge: challenge,
            userVerification: "preferred",
            rpId: this.configs.rp.id
        }

        // Add specific credential if provided
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

export const webauthn = new WebAuthn()
