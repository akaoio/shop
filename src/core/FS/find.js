import { fs } from "./shared.js"
import { join } from "./join.js"

/**
 * Find the first existing path from a list of possible paths
 * @param {string|string[]} paths - Path or array of paths to check
 * @returns {Promise<string|null>} First existing path, or throws error if none found
 * @throws {Error} If no path exists
 */
export async function find(paths) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return null
    }

    // Normalize single string to array
    if (typeof paths === "string") paths = [paths]

    // Check each path in order and return first match
    for (const path of paths) {
        if (fs.existsSync(join(path))) {
            return path
        }
    }
    throw new Error(`Could not find path in: ${paths.join(", ")}`)
}
