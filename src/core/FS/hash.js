import { fs, WIN, BROWSER } from "./shared.js"
import { join } from "./join.js"
import { sha256 } from "../Utils/crypto.js"

/**
 * Calculate hash of a file, directory, or multiple paths
 * @param {string[]|string[][]} path - Path segments (1D array for single path, 2D array for multiple paths)
 * @param {string[]} exclude - Array of file paths to exclude from hashing (relative to directory, only used for directories)
 * @returns {Promise<string>} SHA-256 hash of the file/directory/multiple paths contents
 */
export async function hash(path, exclude = []) {
    if (!fs) {
        console.error("File system not available")
        return ""
    }

    // Detect if path is a 2D array (multiple paths) or 1D array (single path)
    const isMultiplePaths = Array.isArray(path[0])

    // If multiple paths, hash each path and combine the results
    if (isMultiplePaths) {
        let combined = ""

        // Sort paths to ensure consistent hashing
        const sorted = [...path].sort((a, b) => {
            const pathA = join(a)
            const pathB = join(b)
            return pathA.localeCompare(pathB)
        })

        for (const segments of sorted) {
            const item = join(segments)

            try {
                if (!fs.existsSync(item)) {
                    console.error("Path doesn't exist:", item)
                    continue
                }

                const stats = fs.statSync(item)

                // If it's a file, add its content
                if (stats.isFile()) {
                    combined += item // Include path for uniqueness
                    const content = fs.readFileSync(item, "utf8")
                    combined += content
                }
                // If it's a directory, process it recursively
                else if (stats.isDirectory()) {
                    combined += item // Include path for uniqueness
                    combined += await hashDirectory(item, exclude)
                }
            } catch (error) {
                console.error("Error hashing path:", item, error)
            }
        }

        return sha256(combined)
    }

    // Single path processing (1D array)
    const item = join(path)

    try {
        if (!fs.existsSync(item)) {
            console.error("Path doesn't exist:", item)
            return ""
        }

        const stats = fs.statSync(item)

        // If it's a file, hash its content directly
        if (stats.isFile()) {
            const content = fs.readFileSync(item, "utf8")
            return sha256(content)
        }

        // If it's a directory, hash all files recursively
        if (stats.isDirectory()) {
            const directoryContent = await hashDirectory(item, exclude)
            return sha256(directoryContent)
        }

        return ""
    } catch (error) {
        console.error("Error hashing:", error)
        return ""
    }
}

/**
 * Helper function to hash a directory's contents recursively
 * @param {string} path - Full path to the directory
 * @param {string[]} exclude - Array of file paths to exclude
 * @returns {Promise<string>} Combined content of all files in the directory
 */
async function hashDirectory(path, exclude = []) {
    let combined = ""

    async function processDirectory(dirPath, relativePath = "") {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true })

        // Sort entries to ensure consistent hashing
        entries.sort((a, b) => a.name.localeCompare(b.name))

        for (const entry of entries) {
            const fullPath = WIN && !BROWSER ? `${dirPath}\\${entry.name}` : `${dirPath}/${entry.name}`
            const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name

            // Skip excluded files/directories
            if (exclude.some((ex) => relPath === ex || relPath.startsWith(ex + "/"))) {
                continue
            }

            if (entry.isDirectory()) {
                combined += entry.name
                await processDirectory(fullPath, relPath)
            } else if (entry.isFile()) {
                combined += entry.name
                const content = fs.readFileSync(fullPath, "utf8")
                combined += content
            }
        }
    }

    await processDirectory(path)
    return combined
}
