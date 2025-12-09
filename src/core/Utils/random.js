export const randomInt = (min, max) => {
    min = Math.ceil(min || 0)
    max = Math.floor(max || 10000)
    return Math.floor(Math.random() * (max - min) + min)
}

export const randomText = (l, c) => {
    var s = ""
    l = l || 24
    c = c || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz"
    while (l > 0) {
        s += c.charAt(Math.floor(Math.random() * c.length))
        l--
    }
    return s
}

export const randomKey = (int) => (int || Date.now()).toString(36) + randomText(7)

export const randomItem = (data) => (Array.isArray(data) ? data[Math.floor(Math.random() * data.length)] : null)

export const sortStrings = (...strings) =>
    strings
        .map((str) => ({
            original: str,
            lowercase: str.toLowerCase()
        }))
        .sort((a, b) => (a.lowercase < b.lowercase ? -1 : a.lowercase > b.lowercase ? 1 : 0))
        .map((pair) => pair.original)
