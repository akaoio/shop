import { NODE } from "./Utils/environments.js"
import { events } from "./Events.js"
import { Lives } from "./Stores.js"
import { merge, diff } from "./Utils/data.js"
import { randomKey } from "./Utils/random.js"
import { join } from "./Utils/files.js"

export class Threads {
    threads = {}

    queues = {} // Use object so it's easier to find queue in case we have callbacks

    // Register a new thread
    register = async (name, configs = {}) => {
        // If thread already exists, return it
        if (this.threads[name]) return this.threads[name]

        // Create path to thread file
        const path = join([NODE && "src", "threads", `${name}.js`].filter(Boolean))
        if (configs?.main) this.threads[name] = import(`../threads/${name}.js`)
        else if (configs?.worker) {
            let _Worker = typeof Worker !== "undefined" ? Worker : NODE && typeof Worker === "undefined" ? (await import("worker_threads"))?.Worker : undefined
            if (typeof _Worker === "undefined") throw new Error("Worker class not found")
            this.threads[name] = new _Worker(path, configs)

            // Set up error handlers for the worker
            if (NODE) {
                this.threads[name].on("error", (error) => {
                    console.error(`Worker ${name} error:`, error)
                })
                this.threads[name].on("exit", (code) => {
                    if (code !== 0) {
                        console.error(`Worker ${name} stopped with exit code ${code}`)
                    }
                })
                this.threads[name].on("message", (data) => this.process(data))
            } else {
                this.threads[name].onerror = (error) => {
                    console.error(`Worker ${name} error:`, error)
                }
                this.threads[name].onmessage = (event) => this.process(event?.data)
            }
        }
        console.log(`Thread registered: ${name}`)
        return this.threads[name]
    }

    // Process incoming response from thread
    process = (data) => {
        if (typeof data !== "object") return
        // data is an object that contains { queue, response } or { data }

        // If this is a Lives, it's a one way message from the thread to main thread,
        // Update the Lives
        // "Lives" is just an object to hold Lives updates from thread
        if (data?.Lives) {
            // Update global data
            this.update(data?.Lives)
            return
        }

        const queue = data?.queue
        // queue and response are used for managing queues
        if (!queue || !this.queues?.[queue]) return
        // Find the callback for this queue
        if (typeof this.queues[queue] == "function") this.queues[queue](data?.response)
        // Delete task from the queues list
        delete this.queues[queue]
    }

    // Add a new queue to this.queues
    queue = ({ thread, method, params, callback }) => {
        if (!thread || !this.threads?.[thread]) return
        const queue = randomKey()
        if (this.queues?.[queue]) return this.queues[queue]
        if (typeof callback == "function") this.queues[queue] = callback
        this.threads[thread].postMessage({ queue, method, params })
    }

    // Call a method on a thread without managing queues
    call = ({ thread, method, params }) => {
        if (!thread || !method || !this.threads?.[thread]) return
        this.threads[thread].postMessage({ method, params })
    }

    // Update global Lives
    // Deep merge each key of data into Lives
    update = (data) => {
        if (typeof data !== "object") return

        // Reduce the data to only the keys that are different
        data = diff(Lives, data)

        // Merge "data" into Lives for data updates
        merge(Lives, data)

        for (const key in data) {
            const event = "Lives." + key // Other components can listen to events like "Lives.balances"
            events.emit(event, data[key])
        }
    }
}

export default Threads

globalThis.threads = globalThis.threads || new Threads()

export const threads = globalThis.threads
