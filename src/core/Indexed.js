import { NODE, BROWSER } from "./Utils/environment.js"
import { get, _get } from "./Indexed/get.js"
import { put, _put } from "./Indexed/put.js"
import { del, _del } from "./Indexed/del.js"
import { loadFromDisk, saveToDisk, initDisk } from "./Indexed/disk.js"

class Indexed {
    constructor({ name = "system" } = {}) {
        this.name = name
        this.data = {}
        this.callbacks = new Map()
        this.db = null
        this.NODE = NODE
        this.BROWSER = BROWSER

        this.ready = new Promise(async (resolve) => {
            if (BROWSER) {
                // Initialize IndexedDB
                const request = indexedDB.open(name, 1)
                request.onerror = (event) => {
                    console.error("IndexedDB error:", event.target.error)
                    resolve()
                }
                request.onupgradeneeded = (event) => {
                    const db = event.target.result
                    if (!db.objectStoreNames.contains("data")) {
                        db.createObjectStore("data")
                    }
                }
                request.onsuccess = (event) => {
                    this.db = event.target.result
                    resolve()
                }
            } else if (NODE) {
                await initDisk.call(this)
                resolve()
            }
        })
    }

    // Public methods
    get = get
    put = put
    del = del

    // Internal methods
    _get = _get
    _put = _put
    _del = _del
    loadFromDisk = loadFromDisk
    saveToDisk = saveToDisk
}

export default Indexed
