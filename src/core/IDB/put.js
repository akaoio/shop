import { update } from "./update.js"
import { BROWSER, NODE } from "/core/Utils.js"

// Internal implementation
export async function $put(path, value) {
    await this.ready
    if (BROWSER) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["data"], "readwrite")
            const store = transaction.objectStore("data")
            const request = store.put(value, path)
            request.onerror = () => reject(request.error)
            request.onsuccess = async () => {
                await update(this, path, value)
                resolve(value)
            }
        })
    }
    if (NODE) {
        let current = this.data
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i]
            if (!(key in current)) current[key] = {}
            current = current[key]
        }
        current[path.at(-1)] = value

        await update(this, path, value)
        await this.saveToDisk()
        return value
    }
}

// Public method
export async function put(value) {
    return await this.db.$put(this.path, value)
}