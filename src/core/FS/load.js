import { fs, YAML, NODE, BROWSER } from "./shared.js"
import { join } from "./join.js"

/**
 * Load content from files or directories (JSON, YAML, or plain text)
 * Supports loading single files, entire directories, or nested object structures
 * @param {string|string[]|object} items - Path segments, single path, or object of paths
 * @returns {Promise<*>} Loaded content (parsed for JSON/YAML, raw for others)
 */
export async function load(items) {
    const content = {}
    // Normalize single string to array
    if (typeof items == "string") items = [items]
    // Handle array of path segments (file or directory path)
    if (Array.isArray(items)) {
        const filePath = join(items)
        let text
        // Browser environment - use fetch API to load files
        if (BROWSER) {
            try {
                const response = await fetch(filePath)
                if (!response.ok) {
                    console.error("Path doesn't exist", filePath)
                    return
                }
                text = await response.text()
            } catch (error) {
                console.error("Error loading from", filePath)
                return
            }
        }
        // Node.js environment - use fs module for file operations
        else if (NODE) {
            try {
                if (!fs.existsSync(filePath)) return console.error("Path doesn't exist", filePath)
                // Check if filePath is a directory
                const stats = fs.statSync(filePath)
                if (stats.isDirectory()) {
                    // Load all files from the directory recursively
                    const files = {}
                    const entries = fs.readdirSync(filePath, { withFileTypes: true })
                    // Iterate through directory entries
                    for (const entry of entries) {
                        const content = await load([...items, entry.name])
                        if (content) {
                            const base = entry.name.replace(/\.\w{2,4}$/, "")
                            files[base] = content
                        }
                    }
                    return files
                }
                text = fs.readFileSync(filePath, "utf8")
            } catch (error) {
                console.error("Error reading from", filePath)
                return
            }
        }
        if (typeof text === "string") text = text.trim()
        let ext = filePath.match(/\.\w+$/)?.[0]?.slice(1).toLowerCase() || ""
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
    if (typeof items === "object" && items !== null && !Array.isArray(items)) {
        // Process all entries in parallel for better performance
        const promises = Object.entries(items).map(async ([key, value]) => {
            // Recursively handle nested objects
            if (typeof value === "object" && value !== null && !Array.isArray(value)) content[key] = await load(value)
            else content[key] = await load(value)
        })
        await Promise.all(promises)
    }
    return content
}
