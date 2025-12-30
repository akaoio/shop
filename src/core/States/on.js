/**
 * Subscribe to state changes.
 * Supports global subscriptions or path-specific subscriptions.
 * @param {...*} args - Variable arguments: [key], callback function, [target, property], boolean for immediate call
 * @returns {Function} Unsubscribe function
 */
export function on(...args) {
    const [first, ...rest] = args
    // Determine if subscription is for a specific key/path
    const key = typeof first === "string" || Array.isArray(first) ? first : null
    // Extract callback function from arguments
    const cb = rest.find((arg) => typeof arg === "function") || (typeof first === "function" ? first : null)
    // Extract property assignment target [object, propertyName]
    const arr = rest.find((arg) => Array.isArray(arg) && arg.length === 2)
    const sub = cb || arr
    // Check if immediate call is requested
    const call = rest.find((arg) => typeof arg === "boolean")

    // Global subscription: no specific key
    if (!key && cb) {
        this.SET.add(cb)
        const off = () => this.SET.delete(cb)
        off.off = off
        return off
    }
    // Path-specific subscription
    if (key && sub) {
        if (!this.MAP.has(key)) this.MAP.set(key, new Set())
        this.MAP.get(key).add(sub)
        // Get current value for the key/path
        const value = Array.isArray(key) ? key.reduce((acc, k) => acc && acc[k], this.states) : this.states[key]
        // If subscriber is property assignment target, set initial value
        if (Array.isArray(sub)) sub.reduce((acc, k) => (typeof acc[k] === "object" ? acc[k] : (acc[k] = value)))
        // Call immediately if requested
        if (call && typeof sub === "function") sub({ key, value })
        const off = () => this.MAP.get(key)?.delete(sub)
        off.off = off
        return off
    }
}