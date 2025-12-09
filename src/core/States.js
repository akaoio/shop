export class States {
    constructor(states = {}) {
        this.SET = new Set()
        this.MAP = new Map()
        this.states = new Proxy(states, {
            set: (target, key, value, receiver) => {
                const last = target[key]
                if (!this.MAP.has(key)) this.MAP.set(key, new Set())
                const result = Reflect.set(target, key, value, receiver)
                if (!this.same(last, value)) this.notify(key, value, last, target, receiver)
                return result
            }
        })
    }

    same = (a, b) => {
        if (a === b) return true
        if (!a || !b || typeof a !== typeof b || typeof a !== "object") return false
        if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => this.same(v, b[i]))
        const keys = Object.keys(a)
        return keys.length === Object.keys(b).length && keys.every((k) => this.same(a[k], b[k]))
    }

    notify = (key, value, last, target, receiver) => {
        const data = { target, key, value, last, receiver }
        this.SET.forEach((sub) => typeof sub === "function" && sub(data))

        for (const [path, subs] of this.MAP) {
            if (!subs.size) continue
            if (path === key || (Array.isArray(path) && path[0] === key)) {
                const val = Array.isArray(path) ? path.slice(1).reduce((acc, k) => acc && acc[k], value) : value
                if (val === undefined) continue
                subs.forEach((sub) => {
                    if (typeof sub === "function") sub({ ...data, key: Array.isArray(path) ? path.at(-1) : key, value: val })
                    else if (Array.isArray(sub) && sub.length === 2 && sub[0]) sub[0][sub[1]] = val
                })
            }
        }
    }

    has = (data) => {
        if (!data) return false
        if (typeof data === "string") return data in this.states
        if (Array.isArray(data)) return data.every((k) => k in this.states)
        return Object.entries(data).every(([_, v]) => v in this.states)
    }

    get = (data) => {
        if (!data) return
        if (typeof data === "string") return this.states[data]
        if (Array.isArray(data)) return data.map((k) => this.states[k])
        return Object.entries(data).reduce((acc, [k, v]) => ({ ...acc, [k]: this.states[v] }), {})
    }

    set = (data) => {
        if (!data) return
        if (typeof data === "string") this.states[data] = true
        else if (Array.isArray(data)) data.forEach((k) => (this.states[k] = true))
        else Object.entries(data).forEach(([k, v]) => (this.states[k] = v))
    }

    on = (...args) => {
        const [first, ...rest] = args
        const key = typeof first === "string" || Array.isArray(first) ? first : null
        const fn = rest.find((arg) => typeof arg === "function") || (typeof first === "function" ? first : null)
        const arr = rest.find((arg) => Array.isArray(arg) && arg.length === 2)
        const sub = fn || arr
        const call = rest.find((arg) => typeof arg === "boolean")

        if (!key && fn) {
            this.SET.add(fn)
            const off = () => this.SET.delete(fn)
            off.off = off
            return off
        }
        if (key && sub) {
            if (!this.MAP.has(key)) this.MAP.set(key, new Set())
            this.MAP.get(key).add(sub)
            const value = Array.isArray(key) ? key.reduce((acc, k) => acc && acc[k], this.states) : this.states[key]
            if (Array.isArray(sub)) sub.reduce((acc, k) => (typeof acc[k] === "object" ? acc[k] : (acc[k] = value)))
            if (call && typeof sub === "function") sub({ key, value })
            const off = () => this.MAP.get(key)?.delete(sub)
            off.off = off
            return off
        }
    }

    off = (key, sub) => {
        if (!key) this.SET.delete(sub)
        else if (this.MAP.has(key)) this.MAP.get(key).delete(sub)
    }

    clear = (key) => {
        if (this.MAP.has(key)) this.MAP.get(key).clear()
    }
}

export default States
