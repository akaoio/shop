/**
 * Cached loader with hash-based validation.
 * Loads JSON files with intelligent caching using IndexedDB and hash verification.
 * Only fetches from network if data is missing or hash has changed.
 */

import { load } from "./Utils/files.js"
import { Indexes } from "./Stores.js"

export class Cache {
    /**
     * Load JSON file with hash-based caching.
     * Checks hash in IDB first, only fetches if missing or changed.
     * @param {Array<string>|string} path - Path to JSON file
     * @returns {Promise<Object|null>} Parsed JSON data or null if failed
     */
    static async load(path) {
        // Normalize path to string
        const filePath = Array.isArray(path) ? path.join("/") : path
        const jsonPath = filePath.endsWith(".json") ? filePath : `${filePath}.json`

        try {
            // Get current hash from hash database
            const hashPath = jsonPath.replace(/\.json$/, ".hash.json")
            const hashData = await load(hashPath)
            const currentHash = hashData?.hash

            if (!currentHash) {
                // No hash file, just load normally
                return await load(jsonPath)
            }

            // Check cached data in IDB
            const cached = await Indexes.Hashes.get(jsonPath)

            // If cached exists and hash matches, return cached data
            if (cached && cached.hash === currentHash) {
                return cached.data
            }

            // Hash mismatch or no cache, load from network
            const data = await load(jsonPath)

            if (data) {
                // Save to IDB with new hash
                await Indexes.Hashes.set(jsonPath, {
                    hash: currentHash,
                    data: data,
                    updatedAt: Date.now()
                })
            }

            return data

        } catch (error) {
            console.error(`Error loading cached file ${jsonPath}:`, error)
            return null
        }
    }

    /**
     * Clear cached data for a specific file or all files.
     * @param {Array<string>|string|undefined} path - Path to clear, or undefined to clear all
     * @returns {Promise<void>}
     */
    static async clear(path) {
        if (path) {
            const filePath = Array.isArray(path) ? path.join("/") : path
            const jsonPath = filePath.endsWith(".json") ? filePath : `${filePath}.json`
            await Indexes.Hashes.delete(jsonPath)
        } else {
            // Clear all cached data
            await Indexes.Hashes.clear()
        }
    }

    /**
     * Preload multiple files with caching.
     * Useful for preloading critical resources.
     * @param {Array<Array<string>|string>} paths - Array of file paths
     * @returns {Promise<Array<Object|null>>}
     */
    static async batch(paths) {
        return Promise.all(paths.map(path => Cache.load(path)))
    }
}

export default Cache
