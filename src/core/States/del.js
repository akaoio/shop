/**
 * Delete state properties and notify subscribers.
 * @param {string|string[]|Object} data - Property name(s) to delete
 *   - String: delete top-level property
 *   - Array: nested path to property (deletes deepest property only)
 *   - Object: delete all keys listed in object
 */
export function del(data) {
    if (!data) return
    // String: delete single property
    if (typeof data === "string") {
        const last = this.states[data]
        delete this.states[data]
        this.notify({ key: data, value: undefined, last })
    }
    // Array: nested path - navigate to parent and delete final key
    else if (Array.isArray(data)) {
        const keys = [...data]
        const lastKey = keys.pop()
        const parent = keys.reduce((acc, key) => acc?.[key], this.states)
        if (parent && lastKey in parent) {
            const last = parent[lastKey]
            delete parent[lastKey]
            this.notify({ key: data, value: undefined, last })
        }
    }
    // Object: delete all keys from object
    else if (typeof data === "object") {
        Object.keys(data).forEach((key) => {
            const last = this.states[key]
            delete this.states[key]
            this.notify({ key, value: undefined, last })
        })
    }
}
