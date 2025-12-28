import { BROWSER } from "./shared.js"

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
