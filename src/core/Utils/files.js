// Import environment detection flags to determine runtime context
import { NODE, BROWSER, WIN } from "./environments.js"
import { sha256 } from "./crypto.js"

// Lazy-loaded modules that are only available in Node.js environment
let fs = null
let YAML = null

// Dynamically import Node.js-specific modules when running in Node.js
if (NODE) {
    fs = await import("fs")
    YAML = await import("yaml")
}

/**
 * Get the root path/URL based on the current environment
 * @returns {string} The origin URL in browser, or current working directory in Node.js
 */
export function root() {
    // On NodeJS, return the root directory path
    // On browser, return the root URL
    // Use globalThis
    if (BROWSER) return globalThis.location.origin
    return process.cwd() // Default to cwd for Node.js and testing environments
}

/**
 * Join path segments into a complete path/URL
 * @param {string|string[]} slugs - Path segments to join
 * @returns {string} Complete path or URL
 */
export function join(slugs) {
    // Convert single string to array for consistent handling
    if (typeof slugs === "string") slugs = [slugs]
    // Filter out empty strings and undefined values
    slugs = slugs.filter((slug) => slug)
    // Use backslash for Windows file paths, forward slash for URLs and Unix paths
    const seperator = WIN && !BROWSER ? "\\" : "/"

    // Handle browser URLs - always use forward slashes
    if (BROWSER) return root() + "/" + slugs.join("/")

    // Handle Node.js paths - use appropriate separator for OS
    return root() + seperator + slugs.join(seperator)
}

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

/**
 * Remove a file or directory recursively
 * @param {string|string[]} items - Path segments to remove
 * @returns {Promise<boolean>} True if removed successfully, false on error
 */
export async function remove(items) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return false
    }

    const path = join(items)
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

/**
 * Write content to a file in JSON, YAML, or plain text format
 * @param {string[]} items - Path segments including filename
 * @param {*} content - Content to write (will be serialized based on file extension)
 * @returns {Promise<{success: boolean, path: string}|undefined>} Result object or undefined
 */
export async function write(items = [], content) {
    if (!content) return
    const file = items[items.length - 1]
    // If the last item of items is a file, remove it from items to make dir
    if (file.includes(".")) items.pop()

    const dir = join(items)
    const filePath = join([...items, file])

    // Ensure directory exists before writing
    if (!(await ensure(dir))) return

    if (file.includes(".")) {
        try {
            let data
            // Serialize content based on file extension
            if (file.endsWith(".json")) {
                data = JSON.stringify(content, null, 4)
            } else if (file.endsWith(".yaml") || file.endsWith(".yml")) {
                data = YAML.stringify(content)
            } else {
                // Plain text or other format - write as-is
                data = content
            }
            fs.writeFileSync(filePath, data, "utf8")
            return { success: true, path: filePath }
        } catch (error) {
            console.error("Error writing to", filePath)
        }
    }
}

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

        // Browser environment - use fetch API to load files
        if (BROWSER) {
            try {
                const response = await fetch(filePath)
                if (!response.ok) {
                    console.error("Path doesn't exist", filePath)
                    return
                }
                const text = await response.text()
                // Parse JSON or YAML if possible else return raw data
                try {
                    let data
                    if (filePath.endsWith(".json")) {
                        data = JSON.parse(text)
                    } else if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
                        // In browser, we'd need to load YAML parser dynamically
                        // For now, return raw text or implement YAML browser support
                        data = text
                    } else {
                        data = text
                    }
                    // Return ABI property if present, otherwise return full data
                    return data?.abi || data
                } catch {
                    // If parsing fails, return raw text
                    return text
                }
            } catch (error) {
                console.error("Error loading from", filePath)
                return
            }
        }

        // Node.js environment - use fs module for file operations
        if (!NODE) return

        try {
            if (!fs.existsSync(filePath)) {
                return console.error("Path doesn't exist", filePath)
            }

            // Check if filePath is a directory
            const stats = fs.statSync(filePath)
            if (stats.isDirectory()) {
                // Load all files from the directory recursively
                const files = {}
                const entries = fs.readdirSync(filePath, { withFileTypes: true })

                // Iterate through directory entries
                for (const entry of entries) {
                    const entryName = entry.name
                    if (entry.isDirectory()) {
                        // For directories, recursively load their contents
                        const dirContent = await load([...items, entryName])
                        if (Object.keys(dirContent).length > 0) {
                            files[entryName] = dirContent
                        }
                    } else if (entry.isFile() && (entryName.endsWith(".json") || entryName.endsWith(".yaml") || entryName.endsWith(".yml"))) {
                        // For JSON/YAML files, load them directly and strip extension from key
                        let baseName
                        if (entryName.endsWith(".json")) {
                            baseName = entryName.substring(0, entryName.length - 5) // Remove .json
                        } else if (entryName.endsWith(".yaml")) {
                            baseName = entryName.substring(0, entryName.length - 5) // Remove .yaml
                        } else if (entryName.endsWith(".yml")) {
                            baseName = entryName.substring(0, entryName.length - 4) // Remove .yml
                        }
                        const fileContent = await load([...items, entryName])
                        if (fileContent) {
                            files[baseName] = fileContent
                        }
                    }
                }
                return files
            }

            // Read file as text
            const raw = fs.readFileSync(filePath, "utf8")
            // Parse JSON or YAML if possible else return raw data
            let data
            if (filePath.endsWith(".json")) {
                data = JSON.parse(raw)
            } else if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
                data = YAML.parse(raw)
            } else {
                data = raw
            }
            // Return ABI if data has key "abi", else return the whole data object
            if (data) return data?.abi || data
        } catch (error) {
            console.error("Error reading from", filePath)
            return
        }
    }
    // Handle object input - load multiple paths as key-value pairs
    if (typeof items === "object" && items !== null) {
        if (!Array.isArray(items)) {
            // Process all entries in parallel for better performance
            const promises = Object.entries(items).map(async ([key, value]) => {
                // Recursively handle nested objects
                if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    content[key] = await load(value)
                } else {
                    content[key] = await load(value)
                }
            })
            await Promise.all(promises)
        }
    }
    return content
}

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

/**
 * Copy files or directories from source to destination
 * Pure copy - preserves original files without any transformation
 * @param {string[]} src - Source path segments
 * @param {string[]} dest - Destination path segments
 * @returns {Promise<{success: boolean, path: string}|undefined>} Result object or undefined
 */
export async function copy(src, dest) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return
    }

    try {
        const srcPath = join(src)
        const destPath = join(dest)

        // Check if source exists
        if (!fs.existsSync(srcPath)) {
            console.error("Source path doesn't exist:", srcPath)
            return
        }

        const stats = fs.statSync(srcPath)

        // If source is a file, copy it directly
        if (stats.isFile()) {
            const destDir = dest.slice(0, -1).join(WIN ? "\\" : "/")
            // Ensure destination directory exists
            await ensure(destDir)

            // Copy file as-is without any transformation
            fs.copyFileSync(srcPath, destPath)
            return { success: true, path: destPath }
        }

        // If source is a directory, copy recursively
        if (stats.isDirectory()) {
            // Ensure destination directory exists
            await ensure(destPath)

            // Read all files and subdirectories in the source directory
            const entries = fs.readdirSync(srcPath, { withFileTypes: true })

            // Copy each entry recursively
            for (const entry of entries) {
                const newSrc = [...src, entry.name]
                const newDest = [...dest, entry.name]

                await copy(newSrc, newDest)
            }
            return { success: true, path: destPath }
        }
    } catch (error) {
        console.error("Error copying:", error)
    }
}

/**
 * Read directory contents and return list of file/folder names
 * @param {string[]} items - Path segments to the directory
 * @returns {Promise<string[]>} Array of file and directory names, or empty array on error
 */
export async function dir(items) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return []
    }

    const dirPath = join(items)
    try {
        if (!fs.existsSync(dirPath)) {
            console.error("Directory doesn't exist:", dirPath)
            return []
        }

        const stats = fs.statSync(dirPath)
        if (!stats.isDirectory()) {
            console.error("Path is not a directory:", dirPath)
            return []
        }

        // Return array of entry names (files and directories)
        return fs.readdirSync(dirPath)
    } catch (error) {
        console.error("Error reading directory:", dirPath, error)
        return []
    }
}

/**
 * Check if a file or directory exists at the given path
 * @param {string[]} items - Path segments to check
 * @returns {Promise<boolean>} True if path exists, false otherwise
 */
export async function exist(items) {
    if (!fs) {
        console.error("File system not available in browser environment")
        return false
    }
    try {
        const filePath = join(items)
        return fs.existsSync(filePath)
    } catch (error) {
        console.error("Error checking file existence:", error)
        return false
    }
}

/**
 * Calculate hash of a directory by hashing all files recursively
 * @param {string[]} items - Path segments to the directory
 * @param {string[]} exclude - Array of file paths to exclude from hashing (relative to directory)
 * @returns {Promise<string>} Hash of the directory contents
 */
export async function hash(items, exclude = []) {
    if (!fs) {
        console.error("File system not available")
        return ""
    }

    const dirPath = join(items)
    let combinedContent = ""

    async function processDirectory(path, relativePath = "") {
        const entries = fs.readdirSync(path, { withFileTypes: true })

        // Sort entries to ensure consistent hashing
        entries.sort((a, b) => a.name.localeCompare(b.name))

        for (const entry of entries) {
            const fullPath = WIN && !BROWSER ? `${path}\\${entry.name}` : `${path}/${entry.name}`
            const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name

            // Skip excluded files/directories
            if (exclude.some(ex => relPath === ex || relPath.startsWith(ex + "/"))) {
                continue
            }

            if (entry.isDirectory()) {
                combinedContent += entry.name
                await processDirectory(fullPath, relPath)
            } else if (entry.isFile()) {
                combinedContent += entry.name
                const content = fs.readFileSync(fullPath, 'utf8')
                combinedContent += content
            }
        }
    }

    try {
        await processDirectory(dirPath)
        return sha256(combinedContent)
    } catch (error) {
        console.error("Error hashing directory:", error)
        return ""
    }
}
