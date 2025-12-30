import { join, ensure, load, exist, write } from "/core/FS.js"
import { NODE } from "/core/Utils.js"

export async function initDisk() {
    // Create indexed directory if it doesn't exist
    await ensure(join(["indexed"]))
    // Load initial data from filesystem
    await this.loadFromDisk()
}

export async function loadFromDisk() {
    const fileExists = await exist(["indexed", this.name + ".json"])
    if (fileExists) {
        try {
            const data = await load(["indexed", this.name + ".json"])
            if (data) this.data = data
        } catch (error) {
            console.error("Error loading from disk:", error)
        }
    }
}

export async function saveToDisk() {
    if (NODE) {
        try {
            await write(["indexed", this.name + ".json"], this.data)
        } catch (error) {
            console.error("Error saving to disk:", error)
        }
    }
}
