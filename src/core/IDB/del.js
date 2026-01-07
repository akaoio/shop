import { update } from "/core/IDB/update.js"
import { BROWSER, NODE } from "/core/Utils.js"

// Internal implementation
export async function $del(path) {
    await this.ready
    if (BROWSER) {
        const request = await this.execute({
            mode: "readwrite",
            operation: store => store.delete(path)
        })
        await update(this, path, undefined)
        return request.result
    }
    if (NODE) {
        const key = path.join(".")
        let current = this.data
        const parts = key.split(".")

        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) return
            current = current[parts[i]]
        }

        const lastKey = parts.at(-1)
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
    return this.idb.$del(this.path)
}