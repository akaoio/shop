import { NODE, BROWSER } from "./Utils/environment.js"
import { get, $get } from "./IDB/get.js"
import { put, $put } from "./IDB/put.js"
import { del, $del } from "./IDB/del.js"
import { execute } from "./IDB/execute.js"
import { loadFromDisk, saveToDisk, initDisk } from "./IDB/disk.js"

class IDB {
    constructor({ name = "system" } = {}) {
        this.name = name
        this.data = {}
        this.callbacks = new Map()
        this.idb = null

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
                    if (!db.objectStoreNames.contains("data")) db.createObjectStore("data")
                }
                request.onsuccess = (event) => {
                    this.idb = event.target.result
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
    $get = $get
    $put = $put
    $del = $del
    execute = execute
    loadFromDisk = loadFromDisk
    saveToDisk = saveToDisk
}

export default IDB
