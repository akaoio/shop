export function execute({ name = "data", mode = "readonly", operation } = {}) {
    if (typeof operation !== "function") return Promise.reject(new Error("Operation must be a function"))
    return new Promise((resolve, reject) => {
        const transaction = this.idb.transaction([name], mode)
        const store = transaction.objectStore(name)
        const request = operation(store)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request)
    })
}
