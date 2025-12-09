import { update } from "./update.js"

// Internal implementation
async function _del(path) {
    await this.ready
    if (this.BROWSER) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["data"], "readwrite")
            const objectStore = transaction.objectStore("data")
            const request = objectStore.delete(path.join("."))

            request.onerror = () => reject(request.error)
            request.onsuccess = async () => {
                await update(this, path, undefined)
                resolve()
            }
        })
    } else {
        const key = path.join(".")
        let current = this.data
        const parts = key.split(".")

        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) return
            current = current[parts[i]]
        }

        const lastKey = parts[parts.length - 1]
        if (lastKey in current) {
            delete current[lastKey]
            // Notify all subscribers in the path hierarchy
            for (let i = 1; i <= parts.length; i++) {
                const subPath = parts.slice(0, i)
                await update(this, subPath, i === parts.length ? undefined : current[parts[i - 1]])
            }
            await this.saveToDisk()
        }
    }
}

// Public method
export async function del() {
    return this.db._del(this.path)
}

export { _del }
