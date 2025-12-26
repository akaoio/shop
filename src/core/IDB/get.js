import { Chain } from "./Chain.js"

// Internal implementation
async function _get(path) {
    await this.ready
    if (this.BROWSER) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["data"], "readonly")
            const objectStore = transaction.objectStore("data")
            const request = objectStore.get(path.join("."))

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    } else {
        let current = this.data
        for (const key of path) {
            if (current === undefined || current === null) return undefined
            current = current[key]
        }
        return current
    }
}

// Public method
export function get(key) {
    return new Chain(this, key)
}

export { _get }
