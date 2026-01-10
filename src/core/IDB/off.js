export function off(callback) {
    const key = JSON.stringify(this.path)
    const callbacks = this.idb.callbacks.get(key)
    if (!callbacks) return
    callbacks.delete(callback)
    if (callbacks.size === 0) this.idb.callbacks.delete(key)
}
