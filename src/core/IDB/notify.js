export function notify(callbacks, path, value) {
    const key = JSON.stringify(path)
    if (callbacks.has(key)) callbacks.get(key).forEach((cb) => cb(value))
}
