import { Indexes, Statics } from "../core/Stores.js"
import Thread from "../core/Thread.js"
import { clone } from "../core/Utils.js"
import { Construct } from "../core/Construct.js"

const thread = new Thread()

// This object is used to access global variables in web workers
const forex = {}

thread.init = async () => {
    await Construct.DB()
    await thread.forex()
}

thread.forex = async () => {
    const pub = Statics?.site?.market?.pub
    if (!pub) return
    // Initialize forex store
    globalThis.gun
        .user(pub)
        .get("forex")
        .map()
        .on((quotes, base) => {
            forex[base] = {}
            for (const [quote, value] of Object.entries(quotes)) {
                if (quote == "_") continue // Ignore gun metadata
                forex[base][quote] = value
                // Save forex rates to IndexedDB
                Indexes.Lives.get("forex").get(base).get(quote).put(value)
            }
            const chunk = { forex: { [base]: forex[base] } }
            thread.send({ Lives: clone(chunk) })
        })
}
