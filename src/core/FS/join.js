import { BROWSER, WIN } from "./shared.js"
import { root } from "./root.js"

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
