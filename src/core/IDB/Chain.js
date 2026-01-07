import { get } from "/core/IDB/get.js"
import { put } from "/core/IDB/put.js"
import { del } from "/core/IDB/del.js"
import { once } from "/core/IDB/once.js"
import { on } from "/core/IDB/on.js"
import { off } from "/core/IDB/off.js"
import { map } from "/core/IDB/map.js"

export class Chain {
    constructor({ idb, key, path = [] } = {}) {
        this.idb = idb
        this.key = key
        this.path = [...path, key]
    }

    get = get
    put = put
    del = del
    once = once
    on = on
    off = off
    map = map
}

export default Chain
