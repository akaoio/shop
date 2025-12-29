import { update } from "./update.js"

// Internal implementation
async function _put(path, value) {
    await this.ready
    if (this.BROWSER) {
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
    } else {
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
    return await this.db._put(this.path, value)
}

export { _put }
