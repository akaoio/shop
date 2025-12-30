export async function once(callback) {
    const value = await this.db.$get(this.path)
    if (callback) callback(value)
    return value
}