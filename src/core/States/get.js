/**
 * Retrieve state values.
 * @param {string|string[]|Object} data - Property name(s) to retrieve
 * @returns {*} State value(s) - returns value, array of values, or mapped object
 */
export function get(data) {
    if (!data) return
    if (typeof data === "string") return this.states[data]
    if (Array.isArray(data)) return data.map((k) => this.states[k])
    // Map object values to their state counterparts
    return Object.entries(data).reduce((acc, [k, v]) => ({ ...acc, [k]: v ? this.states[v] : this.states[k] }), {})
}