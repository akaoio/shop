import { Chain } from "/core/IDB/Chain.js"
import { BROWSER, NODE } from "/core/Utils.js"

// Internal implementation
export async function $get(path) {
    await this.ready
    if (BROWSER) {
        const request = await this.execute({
            operation: store => store.get(path)
        })
        return request.result
    }
    if (NODE) {
        let current = this.data
        for (const key of path) {
            if (current === undefined || current === null) return undefined
            current = current[key]
        }
        return current
    }
}

// Public method
export function get(key) {
    return new Chain({ idb: this instanceof Chain ? this.idb : this, key, path: this?.path })
}