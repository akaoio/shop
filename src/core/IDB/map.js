export async function map(callback) {
    const value = await this.idb.$get(this.path)
    if (value && typeof value === "object") Object.entries(value).forEach(([key, val]) => callback(val, key))
}