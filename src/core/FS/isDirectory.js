import { fs } from "./shared.js"
import { join } from "./join.js"

/**
 * Check if a path is a directory
 * @param {string[]} items - Path segments to check
 * @returns {Promise<boolean>} True if path is a directory, false otherwise
 */
export async function isDirectory(items) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return false
    }
    try {
        const filePath = join(items)
        if (!fs.existsSync(filePath)) return false
        const stats = fs.statSync(filePath)
        return stats.isDirectory()
    } catch (error) {
        return false
    }
}
