import { fs } from "./shared.js"

/**
 * Ensure a directory exists, creating it recursively if needed
 * @param {string} path - Directory path to ensure exists
 * @returns {Promise<boolean>} True if directory exists or was created, false on error
 */
export async function ensure(path) {
    // Check if file system module is available (Node.js only)
    if (!fs) {
        console.error("File system not available in browser environment")
        return false
    }
    try {
        // Create directory recursively if it doesn't exist
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        return true
    } catch (error) {
        console.error("Error creating directory:", path, error)
        return false
    }
}
