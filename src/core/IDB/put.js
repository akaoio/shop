import { update } from "/core/IDB/update.js"
import { BROWSER, NODE } from "/core/Utils.js"

// Internal implementation
export async function $put(path, value) {
    await this.ready
    if (BROWSER)
        await this.execute({
            mode: "readwrite",
            operation: (store) => store.put(value, path)
        })
    if (NODE) {
        let current = this.data
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i]
            if (!(key in current)) current[key] = {}
            current = current[key]
        }
        current[path.at(-1)] = value
        await this.saveToDisk()
    }
    await update(this, path, value)
    return value
}

// Public method
export async function put(value) {
    return await this.idb.$put(this.path, value)
}
