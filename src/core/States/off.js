/**
 * Unsubscribe from state changes.
 * @param {string|null} key - State key to unsubscribe from (null for global)
 * @param {Function|Array} sub - Subscriber function or property assignment target
 */
export function off(key, sub) {
    if (!key) this.SET.delete(sub)
    else if (this.MAP.has(key)) this.MAP.get(key).delete(sub)
}