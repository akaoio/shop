export async function on(callback) {
    const key = JSON.stringify(this.path)
    if (!this.db.callbacks.has(key)) this.db.callbacks.set(key, new Set())
    // Get and send initial value first
    const value = await this.db.$get(this.path)
    callback(value)
    // Then add callback for future updates
    this.db.callbacks.get(key).add(callback)
    // Return unsubscribe function
    return () => this.off(callback)
}