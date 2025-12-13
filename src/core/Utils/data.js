export function encodeQuery(data) {
    return Object.entries(data)
        .map((_) => _.map((__) => (typeof __ === "object" ? encodeURIComponent(JSON.stringify(__)) : encodeURIComponent(__))).join("="))
        .join("&")
}

export function spintax(text) {
    let matches, options, random
    while ((matches = /{([^{}]+?)}/.exec(text)) !== null) {
        options = matches[1].split("|")
        random = Math.floor(Math.random() * options.length)
        text = text.replace(matches[0], options[random])
    }
    return text
}

export function schemaToDisplay(schema = []) {
    var result = schema
        .filter((field) => (field.area && field.area.indexOf("title") > -1) || (field.type === "data" && field.schema))
        .map((field) => {
            if (field.type !== "data" && field.name) return field.name
            if (field.type === "data" && field.schema) return schemaToDisplay(field.schema)
        })

    return result
}

export function objectToArray(obj = {}) {
    let data = {},
        keys = [],
        tmp

    while (typeof obj === "object") {
        if (obj.data && obj.keys) {
            try {
                keys = JSON.parse(obj.keys)
            } catch (error) {
                console.error(error)
            }
            Object.entries(obj.data).filter((_) => {
                if (keys.indexOf(_[0]) > -1) data[_[0]] = _[1]
            })
            tmp = data
        } else tmp = obj

        return Object.entries(tmp).map((item) => {
            if (typeof item[1] === "object") return objectToArray(item[1])
            return item[1]
        })
    }
    return tmp
}

export function arrayToString(data) {
    const separator = (_) => {
        return Array.isArray(_) && _.length === 2 && typeof _[0] === "string" && Array.isArray(_[1]) ? ": " : ", "
    }

    return data.map((item) => (Array.isArray(item) ? item.join(separator(item)) : item)).join(separator(data))
}

export function filterData(data = {}, prefix = "") {
    return Object.entries(data).filter((item) => typeof item[0] === "string" && item[0].indexOf(prefix) > -1)
}

export function logic(exp, data) {
    const isLogic = (_) => typeof _ === "object" && _ !== null && (_["AND"] || _["OR"] || _["&&"] || _["||"]) && !Array.isArray(_) && Object.keys(_).length === 1

    const ops = {
        AND: (arr) => {
            for (let item of arr) {
                if (isLogic(item)) item = logic(item)
                if (item == false) return false
            }
            return true
        },
        "&&": (arr) => ops["AND"](arr),
        OR: (arr) => {
            for (let item of arr) {
                if (isLogic(item)) item = logic(item)
                if (item == true) return true
            }
            return false
        },
        "||": (arr) => ops["OR"](arr)
    }

    if (isLogic(exp)) {
        const op = Object.keys(exp)[0]
        const data = exp[op]
        return ops[op](data)
    }
    return !!exp
}

export function clone(data, seen = new WeakMap()) {
    if (typeof data !== "object" || data === null) return data
    if (seen.has(data)) return seen.get(data)

    const copy = Array.isArray(data) ? [] : {}
    seen.set(data, copy)

    Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== "function") {
            copy[key] = clone(value, seen)
        }
    })

    return copy
}

// Compare two objects and output a new object with keys and values of the b object that are different from the a object
// This function compares deep nested objects and arrays at any level
export function diff(a = {}, b = {}) {
    const result = {}

    for (const k in b) {
        if (b.hasOwnProperty(k)) {
            if (Array.isArray(b[k]) && Array.isArray(a[k])) {
                // Compare arrays
                if (b[k].length !== a[k].length || !b[k].every((val, index) => val === a[k][index])) {
                    result[k] = b[k]
                }
            } else if (typeof b[k] === "object" && b[k] !== null && !Array.isArray(b[k])) {
                // If the property is an object, perform a recursive diff
                const nest = diff(a[k] || {}, b[k])
                if (Object.keys(nest).length > 0) {
                    result[k] = nest
                }
            } else if (b[k] !== a[k]) {
                // If the property is not an object or is different, add to result
                result[k] = b[k]
            }
        }
    }

    return result
}

export function merge(a, b) {
    if (typeof a !== "object" || typeof b !== "object") return
    for (const key in b) {
        if (b.hasOwnProperty(key)) {
            if (typeof b[key] === "object" && b[key] !== null && !Array.isArray(b[key])) {
                a[key] = merge(a[key] || {}, b[key])
            } else {
                a[key] = b[key]
            }
        }
    }
    return a
}

export function isPromise(item) {
    return !!item && (typeof item === "object" || typeof item === "function") && typeof item.then === "function"
}
