import { Chain } from "./Chain.js"
import { BROWSER, NODE } from "/core/Utils.js"

// Internal implementation
export async function $get(path) {
    await this.ready
    if (BROWSER) {
        return new Promise((resolve, reject) => {
            const transaction = this.database.transaction(["data"], "readonly")
            const store = transaction.objectStore("data")
            const request = store.get(path)
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }
    if (NODE) {
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
    return new Chain({ db: this?.db || this, key, path: this?.path || [] })
}