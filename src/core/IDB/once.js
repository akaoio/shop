export async function once(callback) {
    const value = await this.db._get(this.path)
    if (callback) callback(value)
    return value
}