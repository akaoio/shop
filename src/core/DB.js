import { exist, load } from "./FS.js"
import { Indexes } from "./Stores.js"

export class DB {
    static async get(path = []) {
        let type = path.at?.(-1)?.endsWith?.(".hash") ? "hash" : "data"
        let hash = await Indexes.Hashes.get(path).once()
        if (hash) {
            const exists = await exist(["statics", "hashes", hash])
            if (exists) {
                if (type === "hash") return hash
                return await Indexes.Statics.get(path).once()
            }
        }
        hash = await load(path?.with?.(-1, path?.at?.(-1)?.replace?.(/\.\w+$/, ".hash")))
        if (hash) await Indexes.Hashes.get(path).put(hash)
        if (type === "hash") return hash
        const data = await load(path)
        if (typeof data !== "undefined") await Indexes.Statics.get(path).put(data)
        return data
    }
}

export default DB