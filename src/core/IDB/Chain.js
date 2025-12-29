export class Chain {
    constructor(db, key, path = []) {
        this.db = db
        this.key = key
        this.path = [...path, key]
    }

    get(key) {
        return new Chain(this.db, key, this.path)
    }

    async put(value) {
        return await this.db._put(this.path, value)
    }

    async once(callback) {
        const value = await this.db._get(this.path)
        if (callback) callback(value)
        return value
    }

    async on(callback) {
        const key = JSON.stringify(this.path)
        if (!this.db.callbacks.has(key)) this.db.callbacks.set(key, new Set())
        // Get and send initial value first
        const value = await this.db._get(this.path)
        callback(value)
        // Then add callback for future updates
        this.db.callbacks.get(key).add(callback)
        // Return unsubscribe function
        return () => this.off(callback)
    }

    off(callback) {
        const key = JSON.stringify(this.path)
        const callbacks = this.db.callbacks.get(key)
        if (!callbacks) return
        callbacks.delete(callback)
        if (callbacks.size === 0) this.db.callbacks.delete(key)
    }

    async map(callback) {
        const value = await this.db._get(this.path)
        if (value && typeof value === "object") Object.entries(value).forEach(([key, val]) => callback(val, key))
    }

    async del() {
        return this.db._del(this.path)
    }
}

export default Chain
