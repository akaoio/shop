/**
 * Set state values.
 * @param {string|string[]|Object} data - Property name(s) and value(s) to set
 */
export function set(data) {
    if (!data) return
    // String: set to true
    if (typeof data === "string") this.states[data] = true
    // Array: set each key to true
    else if (Array.isArray(data)) data.forEach((k) => this.states[k] = true)
    // Object: set each key-value pair
    else Object.entries(data).forEach(([k, v]) => this.states[k] = v)
    // Notify changes after all sets are done
    while (this.notifications.length) {
        const { key, value, last, target, receiver } = this.notifications.shift()
        this.notify({ key, value, last, target, receiver })
    }
}