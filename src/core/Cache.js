import { exist, load, join } from "./FS.js"
import { Indexes } from "./Stores.js"

export class Cache {
    static async get(path = []) {
        const key = join(path)
        let check = false
        let hash = [...path]
        if (hash[hash.length - 1]) hash[hash.length - 1] = hash[hash.length - 1].replace(/\.\w+$/, ".hash")
        hash = await load(hash)
        let current = await Indexes.Hashes.get(key).once()
        if (current) check = await exist(["statics", "hashes", current])
        if (check || hash === current) return await Indexes.Statics.get(key).once()
        if (!current || current !== hash) {
            const data = await load(path)
            await Indexes.Statics.put(data, key)
            await Indexes.Hashes.put(hash, key)
            return data
        }
    }
}

export default Cache