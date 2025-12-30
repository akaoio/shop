export async function map(callback) {
    const value = await this.db._get(this.path)
    if (value && typeof value === "object") Object.entries(value).forEach(([key, val]) => callback(val, key))
}