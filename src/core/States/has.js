/**
 * Check if state properties exist.
 * @param {string|string[]|Object} data - Property name(s) to check
 * @returns {boolean} True if all specified properties exist
 */
export function has(data) {
    if (!data) return false
    if (typeof data === "string") return data in this.states
    if (Array.isArray(data)) return data.every((k) => k in this.states)
    return Object.entries(data).every(([_, v]) => v in this.states)
}
