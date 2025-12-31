import Thread from "/core/Thread.js"
import { loop, load, exist } from "/core/Utils.js"
import { Indexes, Statics } from "/core/Stores.js"
import DB from "/core/DB.js"

const thread = new Thread()

thread.init = async function () {
    const paths = [
        [],
        ["statics"],
        ["statics", "locales"],
        ["statics", "themes"],
        ["statics", "items"]
    ].map(path => [...path, "_.hash"])

    loop({
        process: async () => {
            for (const path of paths) {
                let hash = await Indexes.Hashes.get(path).once()
                if (hash && !await exist(["statics", "hashes", hash])) continue
                hash = await load(path)
                await Indexes.Hashes.get(path).put(hash)
                // Now look for all IDB keys start with this path and check their hashes
                
            }
            // try {
            //     const currency = await loadContract({ chain: chain.id, address })
            //     if (!currency) return

            //     // Get balance directly
            //     const balance = await wallet.balance({ currency })
            //     if (balance === null || balance === undefined) {
            //         console.error(`Failed to get balance for ${currency.name} on chain ${chain.id}`)
            //         return null
            //     }

            //     // Return minimal object structure
            //     return { balances: { [currency.chain]: { [address]: balance } } }
            // } catch (error) {
            //     console.error(`Error fetching balance for ${address} on chain ${id}:`, error)
            //     return null
            // }
        },
        // callback: (result) => thread.send({ Lives: clone(result) }),
        delay: [0, 10000]
    })

}