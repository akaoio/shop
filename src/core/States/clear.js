/**
 * Clear all subscribers for a specific key.
 * @param {string} key - State key to clear subscribers for
 */
export function clear(key) {
    if (this.MAP.has(key)) this.MAP.get(key).clear()
}