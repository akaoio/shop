/**
 * Deep equality comparison for values.
 * Handles primitives, arrays, and objects recursively.
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} True if values are deeply equal
 */
export function same(a, b) {
    if (a === b) return true
    if (!a || !b || typeof a !== typeof b || typeof a !== "object") return false
    // Recursively compare array elements
    if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => this.same(v, b[i]))
    // Recursively compare object properties
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every((k) => this.same(a[k], b[k]))
}
