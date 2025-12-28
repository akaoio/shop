import { fs, NODE, BROWSER } from "./shared.js"
import { join } from "./join.js"

/**
 * Check if a file or directory exists at the given path
 * @param {string[]} items - Path segments to check
 * @returns {Promise<boolean>} True if path exists, false otherwise
 */
export async function exist(path = []) {
    path = join(path)
    try {
        if (BROWSER) {
            const response = await fetch(path)
            return response.ok
        }
        if (NODE) return fs.existsSync(path)
    } catch (error) {
        console.error("Error checking file existence:", error)
        return false
    }
}
