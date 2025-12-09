export function notify(callbacks, path, value) {
    const pathString = path.join(".")
    if (callbacks.has(pathString)) {
        callbacks.get(pathString).forEach((cb) => cb(value))
    }
}
