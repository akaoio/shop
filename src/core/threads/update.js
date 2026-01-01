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
        ["statics", "items"]
    ]

    loop({
        process: async () => {
            const stables = []
            for (const path of paths) {
                // Check if path is in stables by comparing it to the items of stables
                // For example, if path is ["statics", "items", "item1"] and stables contains ["statics", "items"], then we can skip this path
                // This requires that stables are always parent paths of the paths we check later
                if (stables.length && stables.some(stable => {
                    for (let i = 0; i < stable.length; i++) {
                        if (stable[i] !== path[i]) return false
                    }
                    return true
                })) {
                    continue
                }

                // Get existing hash
                let hash = await Indexes.Hashes.get([...path, "_.hash"]).once()
                if (hash && await exist(["statics", "hashes", hash])) {
                    stables.push(path)
                    continue
                }

                // Load new hash
                hash = await load(path)
                await Indexes.Hashes.get([...path, "_.hash"]).put(hash)

                // Now look for all IDB keys start with this path and check their hashes
                const range = IDBKeyRange.bound(path, [...path, []], false, true)
                const cursor = await Indexes.Hashes.execute({
                    operation: store => store.openCursor(range)
                })
                cursor.onsuccess = async event => {
                    const result = event.target.result
                    if (result) {
                        await DB.get(result.key)
                        result.continue()
                    }
                }
            }
        },
        delay: 10000
    })

}