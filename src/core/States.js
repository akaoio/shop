/**
 * State management system with reactive updates.
 * Tracks state changes and notifies subscribers.
 * Supports nested property watching and multiple subscription types.
 */
export class States {
    /**
     * Initialize state manager with optional initial state.
     * @param {Object} states - Initial state object (default: empty object)
     */
    constructor(states = {}) {
        // Notifications as results of state changes
        this.notifications = []
        // Set of global subscribers notified on any state change
        this.SET = new Set()
        // Map of path-specific subscribers (key -> Set of subscribers)
        this.MAP = new Map()
        // Proxied state object that intercepts property assignments
        this.states = new Proxy(states, {
            // Intercept property assignments to trigger notifications
            set: (target, key, value, receiver) => {
                const last = target[key]
                if (!this.MAP.has(key)) this.MAP.set(key, new Set())
                const result = Reflect.set(target, key, value, receiver)
                // Only notify if value actually changed (deep equality check)
                if (!this.same(last, value)) this.notifications.push({ key, value, last, target, receiver })
                return result
            }
        })
    }

    /**
     * Deep equality comparison for values.
     * Handles primitives, arrays, and objects recursively.
     * @param {*} a - First value to compare
     * @param {*} b - Second value to compare
     * @returns {boolean} True if values are deeply equal
     */
    same(a, b) {
        if (a === b) return true
        if (!a || !b || typeof a !== typeof b || typeof a !== "object") return false
        // Recursively compare array elements
        if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => this.same(v, b[i]))
        // Recursively compare object properties
        const keys = Object.keys(a)
        return keys.length === Object.keys(b).length && keys.every((k) => this.same(a[k], b[k]))
    }

    /**
     * Notify all subscribers of a state change.
     * Calls global subscribers and path-specific subscribers.
     * @param {string} key - The state property that changed
     * @param {*} value - The new value
     * @param {*} last - The previous value
     * @param {Object} target - The state object
     * @param {Object} receiver - The proxy receiver
     */
    notify(data = {}) {
        const { key, value } = data
        // Notify all global subscribers
        this.SET.forEach((sub) => typeof sub === "function" && sub(data))

        // Notify path-specific subscribers
        for (const [path, subs] of this.MAP) {
            if (!subs.size) continue
            // Check if this path matches the changed key or is a nested path starting with key
            if (path === key || (Array.isArray(path) && path[0] === key)) {
                // Extract nested value if path is an array
                const val = Array.isArray(path) ? path.slice(1).reduce((acc, k) => acc && acc[k], value) : value
                if (val === undefined) continue
                subs.forEach((sub) => {
                    // Support function callbacks
                    if (typeof sub === "function") sub({ ...data, key: Array.isArray(path) ? path.at(-1) : key, value: val })
                    // Support direct property assignment [object, propertyName]
                    else if (Array.isArray(sub) && sub.length === 2 && sub[0]) sub[0][sub[1]] = val
                })
            }
        }
    }

    /**
     * Check if state properties exist.
     * @param {string|string[]|Object} data - Property name(s) to check
     * @returns {boolean} True if all specified properties exist
     */
    has(data) {
        if (!data) return false
        if (typeof data === "string") return data in this.states
        if (Array.isArray(data)) return data.every((k) => k in this.states)
        return Object.entries(data).every(([_, v]) => v in this.states)
    }

    /**
     * Retrieve state values.
     * @param {string|string[]|Object} data - Property name(s) to retrieve
     * @returns {*} State value(s) - returns value, array of values, or mapped object
     */
    get(data) {
        if (!data) return
        if (typeof data === "string") return this.states[data]
        if (Array.isArray(data)) return data.map((k) => this.states[k])
        // Map object values to their state counterparts
        return Object.entries(data).reduce((acc, [k, v]) => ({ ...acc, [k]: this.states[v] }), {})
    }

    /**
     * Set state values.
     * @param {string|string[]|Object} data - Property name(s) and value(s) to set
     */
    set(data) {
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

    /**
     * Subscribe to state changes.
     * Supports global subscriptions or path-specific subscriptions.
     * @param {...*} args - Variable arguments: [key], callback function, [target, property], boolean for immediate call
     * @returns {Function} Unsubscribe function
     */
    on(...args) {
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

    /**
     * Unsubscribe from state changes.
     * @param {string|null} key - State key to unsubscribe from (null for global)
     * @param {Function|Array} sub - Subscriber function or property assignment target
     */
    off(key, sub) {
        if (!key) this.SET.delete(sub)
        else if (this.MAP.has(key)) this.MAP.get(key).delete(sub)
    }

    /**
     * Clear all subscribers for a specific key.
     * @param {string} key - State key to clear subscribers for
     */
    clear(key) {
        if (this.MAP.has(key)) this.MAP.get(key).clear()
    }
}

export default States
