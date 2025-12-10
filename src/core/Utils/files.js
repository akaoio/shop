import { NODE, BROWSER, WIN } from "./environments.js"

let fs = null
let YAML = null

if (NODE) {
    fs = await import("fs")
    YAML = await import("yaml")
}

export const root = () => {
    // On NodeJS, return the root directory path
    // On browser, return the root URL
    // Use globalThis
    if (BROWSER) return globalThis.location.origin
    return process.cwd() // Default to cwd for Node.js and testing environments
}

export const join = (slugs) => {
    if (typeof slugs === "string") slugs = [slugs]
    // Filter out empty strings and undefined values
    slugs = slugs.filter((slug) => slug)
    const seperator = WIN && !BROWSER ? "\\" : "/"

    // Handle browser URLs
    if (BROWSER) return root() + "/" + slugs.join("/")

    // Handle Node.js paths
    return root() + seperator + slugs.join(seperator)
}

// Helper function to ensure directory exists
export const ensure = async (path) => {
    if (!fs) {
        console.error("File system not available in browser environment")
        return false
    }
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        return true
    } catch (error) {
        console.error("Error creating directory:", path, error)
        return false
    }
}

// Function to write JSON or YAML content to a specified path
export const write = async (items = [], content) => {
    if (!content) return
    const file = items[items.length - 1]
    // If the last item of items is a file, remove it from items to make dir
    if (file.includes(".")) items.pop()

    const dir = join(items)
    const filePath = join([...items, file])

    // Ensure directory exists
    if (!(await ensure(dir))) return

    if (file.includes(".")) {
        try {
            let data
            if (file.endsWith(".json")) {
                data = JSON.stringify(content, null, 4)
            } else if (file.endsWith(".yaml") || file.endsWith(".yml")) {
                data = YAML.stringify(content)
            } else {
                data = content
            }
            fs.writeFileSync(filePath, data, "utf8")
            return { success: true, path: filePath }
        } catch (error) {
            console.error("Error writing to", filePath)
        }
    }
}

// Function to load JSON content from a specified path
export const load = async (items) => {
    const content = {}
    if (typeof items == "string") items = [items]
    if (Array.isArray(items)) {
        const filePath = join(items)

        // Browser environment
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
                    return data?.abi || data
                } catch {
                    return text
                }
            } catch (error) {
                console.error("Error loading from", filePath)
                return
            }
        }

        // Node.js environment
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

                for (const entry of entries) {
                    const entryName = entry.name
                    if (entry.isDirectory()) {
                        // For directories, recursively load their contents
                        const dirContent = await load([...items, entryName])
                        if (Object.keys(dirContent).length > 0) {
                            files[entryName] = dirContent
                        }
                    } else if (entry.isFile() && (entryName.endsWith(".json") || entryName.endsWith(".yaml") || entryName.endsWith(".yml"))) {
                        // For JSON/YAML files, load them directly
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
    if (typeof items === "object" && items !== null) {
        if (!Array.isArray(items)) {
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

// Function to find a path from a list of possible paths
export const find = async (paths) => {
    if (!fs) {
        console.error("File system not available in browser environment")
        return null
    }

    if (typeof paths === "string") paths = [paths]

    for (const path of paths) {
        if (fs.existsSync(join(path))) {
            return path
        }
    }
    throw new Error(`Could not find path in: ${paths.join(", ")}`)
}

// Function to copy files or directories
export const copy = async (src, dest) => {
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

            // Convert YAML to JSON if source is YAML
            const srcFileName = src[src.length - 1]
            if (srcFileName.endsWith('.yaml') || srcFileName.endsWith('.yml')) {
                // Load YAML content
                const raw = fs.readFileSync(srcPath, "utf8")
                const data = YAML.parse(raw)

                // Change destination to .json
                const destFileName = dest[dest.length - 1].replace(/\.(yaml|yml)$/, '.json')
                const newDest = [...dest.slice(0, -1), destFileName]
                const newDestPath = join(newDest)

                // Write as JSON
                fs.writeFileSync(newDestPath, JSON.stringify(data, null, 4), "utf8")
                return { success: true, path: newDestPath }
            } else {
                fs.copyFileSync(srcPath, destPath)
                return { success: true, path: destPath }
            }
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
                let newDest = [...dest, entry.name]

                // Convert YAML extensions to JSON for destination
                if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
                    const jsonName = entry.name.replace(/\.(yaml|yml)$/, '.json')
                    newDest = [...dest, jsonName]
                }

                if (entry.isDirectory()) {
                    // Recursively copy subdirectory
                    await copy(newSrc, newDest)
                } else {
                    // Copy file (will convert YAML to JSON if needed)
                    await copy(newSrc, newDest)
                }
            }
            return { success: true, path: destPath }
        }
    } catch (error) {
        console.error("Error copying:", error)
    }
}

// Function to read directory contents
export const dir = async (items) => {
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

        return fs.readdirSync(dirPath)
    } catch (error) {
        console.error("Error reading directory:", dirPath, error)
        return []
    }
}

// Function to check if a file exists
export const exist = async (items) => {
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
