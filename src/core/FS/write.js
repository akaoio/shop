import { fs, YAML } from "./shared.js"
import { join } from "./join.js"
import { ensure } from "./ensure.js"

/**
 * Write content to a file in JSON, YAML, or plain text format
 * @param {string[]} items - Path segments including filename
 * @param {*} content - Content to write (will be serialized based on file extension)
 * @returns {Promise<{success: boolean, path: string}|undefined>} Result object or undefined
 */
export async function write(items = [], content) {
    if (content === undefined || content === null) return
    const file = items.at(-1)
    const hasExtension = file.includes(".")

    // Smart detection: treat as file if:
    // 1. Has extension (explicit file like .json, .txt, etc.)
    // 2. Content is string/number/boolean (not object/array) - indicates text file
    // This prevents accidentally writing to directories while supporting extension-less files
    const isFile = hasExtension || (typeof content !== 'object' || content instanceof String)

    if (!isFile) {
        console.error("Attempted to write object/array to path without extension:", join(items))
        return
    }

    // If the last item is a file, remove it from items to make dir
    items.pop()
    const dir = join(items)
    const filePath = join([...items, file])
    // Ensure directory exists before writing
    if (!(await ensure(dir))) return

    try {
        let data
        // Serialize content based on file extension
        if (file.endsWith(".json")) data = JSON.stringify(content, null, 4)
        else if (file.endsWith(".yaml") || file.endsWith(".yml")) data = YAML.stringify(content)
        else data = content
        fs.writeFileSync(filePath, data, "utf8")
        return { success: true, path: filePath }
    } catch (error) {
        console.error("Error writing to", filePath)
    }
}
