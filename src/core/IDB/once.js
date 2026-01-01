export async function once(callback) {
    const value = await this.idb.$get(this.path)
    if (callback) callback(value)
    return value
}