import { get } from "./get.js"
import { put } from "./put.js"
import { del } from "./del.js"
import { once } from "./once.js"
import { on } from "./on.js"
import { off } from "./off.js"
import { map } from "./map.js"

export class Chain {
    constructor({ db, key, path = [] } = {}) {
        this.db = db instanceof Chain ? db.db : db
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
