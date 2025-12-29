import { exist, load } from "./FS.js"
import { Indexes } from "./Stores.js"

/**
 * DB class provides a two-tier caching system:
 * 1. Hash-based validation to check if content has changed
 * 2. Static data storage in IndexedDB for fast retrieval
 */
export class DB {
    /**
     * Get cached data for a given path
     * @param {Array} path - Array representing the file path (e.g., ['folder', 'file.txt'])
     * @returns {Promise} The cached or freshly loaded data
     */
    static async get(path = []) {
        // Get the current cached hash for the given path from IndexedDB
        const current = await Indexes.Hashes.get(path).once()

        // If there is no current hash, load the data from the source
        if (!current) return await this.load(path)

        // If the current hash exists in the official list of hashes, return the cached static data
        // This means the content hasn't changed and we can use the cached version
        if (await exist(["statics", "hashes", current])) return await Indexes.Statics.get(path).once()

        // Hash exists but is not in official list, reload from source
        return await this.load(path)
    }

    /**
     * Load data from source and update cache
     * @param {Array} path - Array representing the file path
     * @returns {Promise} The loaded data
     */
    static async load(path = []) {
        // Create a new path with the last element replaced with .hash extension
        // Uses .with(-1, ...) to immutably replace the last array element
        // Example: ['folder', 'file.txt'] becomes ['folder', 'file.hash']
        const hash = await load(path?.with?.(-1, path?.at?.(-1)?.replace?.(/\.\w+$/, ".hash")))

        // Load the actual data from the original path
        const data = await load(path)

        // If hash exists, store it in IndexedDB for future validation
        if (hash) await Indexes.Hashes.get(path).put(hash)

        // If data exists, cache it in IndexedDB for fast retrieval
        if (typeof data !== "undefined") await Indexes.Statics.get(path).put(data)

        return data
    }
}

export default DB