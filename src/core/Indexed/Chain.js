export class Chain {
    constructor(db, key, parentPath = []) {
        this.db = db
        this.key = key
        this.path = [...parentPath, key]
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
        const pathString = this.path.join(".")
        if (!this.db.callbacks.has(pathString)) {
            this.db.callbacks.set(pathString, new Set())
        }

        // Get and send initial value first
        const initialValue = await this.db._get(this.path)
        callback(initialValue)

        // Then add callback for future updates
        this.db.callbacks.get(pathString).add(callback)

        // Return unsubscribe function
        return () => this.off(callback)
    }

    off(callback) {
        const pathString = this.path.join(".")
        const callbacks = this.db.callbacks.get(pathString)
        if (callbacks) {
            callbacks.delete(callback)
            if (callbacks.size === 0) {
                this.db.callbacks.delete(pathString)
            }
        }
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
