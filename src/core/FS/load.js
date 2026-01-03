import { fs, YAML, NODE, BROWSER } from "./shared.js"
import { join } from "./join.js"

/**
 * Load content from files or directories (JSON, YAML, or plain text)
 * Supports loading single files, entire directories, or nested object structures
 * @param {string|string[]|object} path - Path segments, single path, or object of paths
 * @returns {Promise<*>} Loaded content (parsed for JSON/YAML, raw for others)
 */
export async function load(path) {
    const content = {}
    // Normalize single string to array
    if (typeof path == "string") path = [path]
    // Handle array of path segments (file or directory path)
    if (Array.isArray(path)) {
        const _path = join(path)
        let text
        // Browser environment - use fetch API to load files
        if (BROWSER) {
            try {
                const response = await fetch(_path)
                if (!response.ok) {
                    console.error("Path doesn't exist", _path)
                    return
                }
                text = await response.text()
            } catch (error) {
                console.error("Error loading from", _path)
                return
            }
        }
        // Node.js environment - use fs module for file operations
        else if (NODE) {
            try {
                if (!fs.existsSync(_path)) return console.error("Path doesn't exist", _path)
                // Check if _path is a directory
                const stats = fs.statSync(_path)
                if (stats.isDirectory()) {
                    // Load all files from the directory recursively
                    const files = {}
                    const entries = fs.readdirSync(_path, { withFileTypes: true })
                    // Iterate through directory entries
                    for (const entry of entries) {
                        const content = await load([...path, entry.name])
                        if (content) {
                            const base = entry.name.replace(/\.\w{2,4}$/, "")
                            files[base] = content
                        }
                    }
                    return files
                }
                text = fs.readFileSync(_path, "utf8")
            } catch (error) {
                console.error("Error reading from", _path)
                return
            }
        }
        if (typeof text === "string") text = text.trim()
        let ext = _path.match(/\.\w+$/)?.[0]?.slice(1).toLowerCase() || ""
        // Parse JSON or YAML files
        if (["json", "yaml", "yml"].includes(ext)) {
            try {
                let data
                if (ext === "json") data = JSON.parse(text)
                else if (YAML && ["yaml", "yml"].includes(ext)) data = YAML.parse(text)
                // Return ABI property if present, otherwise return full data
                return data?.abi || data
            } catch {
                // If parsing fails, return raw text
                return text
            }
        }

        // Return raw text for other file types
        return text
    }
    // Handle object input - load multiple paths as key-value pairs
    if (typeof path === "object" && path !== null && !Array.isArray(path)) {
        // Process all entries in parallel for better performance
        const promises = Object.entries(path).map(async ([key, value]) => {
            // Recursively handle nested objects
            if (typeof value === "object" && value !== null && !Array.isArray(value)) content[key] = await load(value)
            else content[key] = await load(value)
        })
        await Promise.all(promises)
    }
    return content
}
