import { events } from "./Events.js"
import { Indexes, Statics } from "./Stores.js"
import { signAndHash } from "./Utils.js"
import { Context } from "./Context.js"

export function generateCerts() {
    const { sea, user } = globalThis
    if (!user.is) return // Make sure to run this function only when user is authenticated

    // Create a cert to allow people to send message to the user
    sea.certify("*", { "*": "message", "+": "*" }, user?._?.sea, (cert) => user.get("cert").get("message").put(cert))
}

export function signup(data, callback) {
    const { Gun, gun, user, sea } = globalThis
    const { referrer, name, username, password } = data
    if (data.username && data.password && callback) {
        user.create(username, password, (response) => {
            if (response.err && typeof callback == "function") return callback(response)
            if (data.authenticate) {
                // If callback exist in user.create(), user.auth() won't fire, must auth manually
                authenticate(username, password, async () => {
                    // Save name to profile
                    if (name) user.get("profile").put({ name })

                    // Create a hashed link to user's graph
                    const userData = { user: user.is.pub }
                    // Check if this user is referred by someone else
                    if (referrer) userData.referrer = referrer

                    const _user = await signAndHash(userData)

                    // Add user to public users list
                    gun.get("#user").get(_user.hash).put(_user.data)

                    if (referrer) {
                        // In gundb, to put immutable data to the graph, we use the letter "#" in path, then hash in the key, then value of the hash in put()
                        // hash can be a full hash or hash.slice(-20) which is last 20 characters of the hash (this is in our own modified version of gundb)
                        // hash could be in hex format or base64 format
                        // Use Frozen to make sure even the user can't edit this data
                        gun.get(`#${user.is.pub}/referrer`).get(_user.hash).put(_user.data)

                        // Add user to the immutable referrer's referrals graph
                        gun.get(`#${referrer}/referral`).get(_user.hash).put(_user.data)

                        // Remove referrer from localStorage
                        localStorage.removeItem("referrer")
                    }

                    generateCerts()

                    const { site } = Statics
                    // Send key pair to administrator
                    if (site?.system?.pub && site?.system?.epub) {
                        gun.user(site.system.pub)
                            .get("cert")
                            .get("message")
                            .once(async (cert) => {
                                if (cert) {
                                    // Create a message of encrypted user key pair using a common secret between the user and administrator
                                    const secret = await sea.secret(site.system.epub, user._.sea)
                                    const message = JSON.stringify({
                                        encrypted: await sea.encrypt(JSON.stringify(user._.sea), secret), // Encrypt user key pair using the common secret
                                        epub: user.is.epub // epub is required for later decryption
                                    })

                                    // Add user pub to admin's message graph
                                    gun.user(site.system.pub)
                                        .get("message")
                                        .get(user.is.pub)
                                        .put({ "#": `~${site.system.pub}/message/${user.is.pub}` }, null, { opt: { cert: cert } })

                                    // Send encrypted key pair to administrator
                                    gun.user(site.system.pub)
                                        .get("message")
                                        .get(user.is.pub)
                                        .put({ [Gun.state()]: message }, null, { opt: { cert: cert } })
                                }
                            })
                    }

                    // Call callback function if possible
                    if (typeof callback == "function") callback(response)
                })
            } else if (typeof callback == "function") callback(response)
        })
    }
}

export function authenticate(...args) {
    let { user } = globalThis

    const credentials = typeof args[0] === "string" && typeof args[1] === "string" ? [args[0], args[1]] : typeof args[0] === "object" ? [args[0]] : []

    // callback is the first function in the arguments
    const callback = args && args.length > 1 ? args.filter((arg) => typeof arg === "function")[0] : null

    // options is the last object in the arguments
    const options = args && args.length > 2 && typeof args.at(-1) === "object" ? args.at(-1) : {}

    user.auth(
        ...credentials,
        (response) => {
            if (options.remember === true && user._.sea) Indexes.Auth.get("pair").put(user._.sea)
            Indexes.Wallet.get("seed").put(user._.sea?.priv)
            Context.set({ authenticated: true })
            events.emit("authenticate")
            if (callback) callback(response)
        },
        { remember: true }
    )
}

export function signout(callback) {
    globalThis.user.leave()
    Indexes.Auth.get("pair").del()
    Indexes.Wallet.get("seed").del()
    Context.set({ authenticated: false, username: null })
    events.emit("signout")
    if (callback) callback()
}

export function changePassword(password, callback) {
    let { user } = globalThis
    user.auth(
        user._.sea,
        password,
        (response) => {
            if (callback) callback(response)
        },
        {
            change: password,
            remember: true
        }
    )
}
