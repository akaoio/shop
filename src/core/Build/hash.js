import { write, load, dir, exist, isDirectory, join } from "../Utils/files.js"
import { sha256 } from "../Utils/crypto.js"

// ============ Hash Generation ============

/**
 * Generate hash files recursively from deepest level up
 * Following the spec:
 * - Each .json file gets a .hash.json file with { hash }
 * - Each directory gets a hash.json file that is hash of all direct child hashes
 */
async function generateHashesRecursive(pathSegments) {
    const entries = await dir(pathSegments)
    if (!entries || entries.length === 0) return 0

    const jsonFiles = []
    const subDirs = []
    let hashCount = 0

    // Separate JSON files and directories using fs.statSync
    for (const entry of entries) {
        const entryPath = [...pathSegments, entry]

        if (await isDirectory(entryPath)) {
            subDirs.push(entry)
        } else if (entry.endsWith('.json') && !entry.endsWith('.hash.json') && entry !== 'hash.json') {
            jsonFiles.push(entry)
        }
    }

    // First, process subdirectories recursively (deepest first)
    for (const subDir of subDirs) {
        const count = await generateHashesRecursive([...pathSegments, subDir])
        hashCount += count
    }

    // Now generate hash files for all JSON files in current directory
    const childHashes = []

    for (const jsonFile of jsonFiles) {
        // Read file content and hash it
        const fileContent = await load([...pathSegments, jsonFile])
        if (!fileContent) continue

        const fileHash = sha256(JSON.stringify(fileContent))
        const hashFileName = jsonFile.replace('.json', '.hash.json')
        await write([...pathSegments, hashFileName], { hash: fileHash })
        hashCount++
        childHashes.push(fileHash)
    }

    // Add subdirectory hashes
    for (const subDir of subDirs) {
        const subDirHashPath = [...pathSegments, subDir, 'hash.json']
        if (await exist(subDirHashPath)) {
            const hashData = await load(subDirHashPath)
            if (hashData?.hash) {
                childHashes.push(hashData.hash)
            }
        }
    }

    // Generate directory hash.json if there are any hashes to combine
    if (childHashes.length > 0) {
        const combinedHash = sha256(childHashes.sort().join(''))
        await write([...pathSegments, 'hash.json'], { hash: combinedHash })
        hashCount++
    }

    return hashCount
}

/**
 * Generate hash files for all JSON files in build directory
 */
export async function generateHashFiles(pathArray) {
    if (!(await exist(pathArray))) {
        throw new Error(`Build directory not found: ${join(pathArray)}`)
    }

    const count = await generateHashesRecursive(pathArray)
    return count
}
