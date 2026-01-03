import { fs } from "./shared.js"
import { join } from "./join.js"

/**
 * Remove a file or directory recursively
 * @param {string|string[]} path - Path segments to remove
 * @returns {Promise<boolean>} True if removed successfully, false on error
 */
export async function remove(path) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return false
    }

    path = join(path)
    try {
        if (!fs.existsSync(path)) {
            return true // Already doesn't exist
        }

        const stats = fs.statSync(path)
        if (stats.isDirectory()) {
            fs.rmSync(path, { recursive: true, force: true })
        } else {
            fs.unlinkSync(path)
        }
        return true
    } catch (error) {
        console.error("Error removing path:", path, error)
        return false
    }
}
