import { fs } from "./shared.js"
import { join } from "./join.js"
import { ensure } from "./ensure.js"

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
            const destDir = join(dest.slice(0, -1))
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
