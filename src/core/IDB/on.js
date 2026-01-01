export async function on(callback) {
    const key = JSON.stringify(this.path)
    if (!this.idb.callbacks.has(key)) this.idb.callbacks.set(key, new Set())
    // Get and send initial value first
    const value = await this.idb.$get(this.path)
    callback(value)
    // Then add callback for future updates
    this.idb.callbacks.get(key).add(callback)
    // Return unsubscribe function
    return () => this.off(callback)
}