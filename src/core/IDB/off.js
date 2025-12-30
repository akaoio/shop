export function off(callback) {
    const key = JSON.stringify(this.path)
    const callbacks = this.db.callbacks.get(key)
    if (!callbacks) return
    callbacks.delete(callback)
    if (callbacks.size === 0) this.db.callbacks.delete(key)
}