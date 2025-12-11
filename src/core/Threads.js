/**
 * Thread manager for coordinating multiple threads (main thread, worker threads).
 * Handles thread registration, message routing, queue management, and global state updates.
 * Provides API for calling methods on threads and receiving responses via callbacks.
 */

import { NODE } from "./Utils/environments.js"
import { events } from "./Events.js"
import { Lives } from "./Stores.js"
import { merge, diff } from "./Utils/data.js"
import { randomKey } from "./Utils/random.js"
import { join } from "./Utils/files.js"

export class Threads {
    // Map of registered threads by name
    threads = {}

    // Use object so it's easier to find queue in case we have callbacks
    // Maps queue IDs to callback functions for async responses
    queues = {}

    /**
     * Register a new thread (main or worker).
     * Creates Web Workers for browser or worker_threads for Node.js.
     * @param {string} name - Unique identifier for the thread
     * @param {Object} configs - Configuration object { main: boolean, worker: boolean }
     * @returns {Promise} Thread object or module
     */
    register = async (name, configs = {}) => {
        // If thread already exists, return it
        if (this.threads[name]) return this.threads[name]

        // Create path to thread file
        const path = join([NODE && "src", "threads", `${name}.js`].filter(Boolean))
        // If main thread, import the module directly
        if (configs?.main) this.threads[name] = import(`./threads/${name}.js`)
        // If worker thread, create a new Worker
        else if (configs?.worker) {
            // Get Worker class (Web Worker for browser, worker_threads.Worker for Node.js)
            let _Worker = typeof Worker !== "undefined" ? Worker : NODE && typeof Worker === "undefined" ? (await import("worker_threads"))?.Worker : undefined
            if (typeof _Worker === "undefined") throw new Error("Worker class not found")
            this.threads[name] = new _Worker(path, configs)

            // Set up error and message handlers for the worker
            if (NODE) {
                // Node.js: Handle worker errors
                this.threads[name].on("error", (error) => {
                    console.error(`Worker ${name} error:`, error)
                })
                // Node.js: Handle worker exit
                this.threads[name].on("exit", (code) => {
                    if (code !== 0) {
                        console.error(`Worker ${name} stopped with exit code ${code}`)
                    }
                })
                // Node.js: Handle incoming messages from worker
                this.threads[name].on("message", (data) => this.process(data))
            } else {
                // Browser: Handle worker errors
                this.threads[name].onerror = (error) => {
                    console.error(`Worker ${name} error:`, error)
                }
                // Browser: Handle incoming messages from worker
                this.threads[name].onmessage = (event) => this.process(event?.data)
            }
        }
        console.log(`Thread registered: ${name}`)
        return this.threads[name]
    }

    /**
     * Process incoming responses from worker threads.
     * Routes messages to appropriate handlers based on message type.
     * @param {Object} data - Message data from worker (contains queue, response, or Lives)
     */
    process = (data) => {
        if (typeof data !== "object") return
        // data is an object that contains { queue, response } or { Lives }

        // If this is a Lives, it's a one way message from the thread to main thread,
        // Update the Lives
        // "Lives" is just an object to hold Lives updates from thread
        if (data?.Lives) {
            // Update global data
            this.update(data?.Lives)
            return
        }

        const queue = data?.queue
        // queue and response are used for managing queues (responses to method calls)
        if (!queue || !this.queues?.[queue]) return
        // Find the callback for this queue and invoke it
        if (typeof this.queues[queue] == "function") this.queues[queue](data?.response)
        // Delete task from the queues list
        delete this.queues[queue]
    }

    /**
     * Queue a method call on a thread with a callback for the response.
     * Creates a unique queue ID and stores the callback for when response arrives.
     * @param {Object} options - { thread, method, params, callback }
     */
    queue = ({ thread, method, params, callback }) => {
        if (!thread || !this.threads?.[thread]) return
        const queue = randomKey()
        if (this.queues?.[queue]) return this.queues[queue]
        // Store callback to be invoked when response arrives
        if (typeof callback == "function") this.queues[queue] = callback
        // Send message to thread with queue ID for correlation
        this.threads[thread].postMessage({ queue, method, params })
    }

    /**
     * Call a method on a thread without waiting for a response (fire and forget).
     * Used for one-way messages or updates that don't require callbacks.
     * @param {Object} options - { thread, method, params }
     */
    call = ({ thread, method, params }) => {
        if (!thread || !method || !this.threads?.[thread]) return
        // Send message without queue ID (no response expected)
        this.threads[thread].postMessage({ method, params })
    }

    /**
     * Update global Lives state with changes from threads.
     * Deep merges data, emits events for each changed key, and filters to only changed values.
     * @param {Object} data - Data updates to merge into Lives
     */
    update = (data) => {
        if (typeof data !== "object") return

        // Reduce the data to only the keys that are different
        data = diff(Lives, data)

        // Merge "data" into Lives for data updates
        merge(Lives, data)

        // Emit events for each key that changed (components can listen to "Lives.keyName")
        for (const key in data) {
            const event = "Lives." + key // Other components can listen to events like "Lives.balances"
            events.emit(event, data[key])
        }
    }
}

export default Threads

// Create or reuse global Threads singleton for app-wide thread management
globalThis.threads = globalThis.threads || new Threads()

// Export the global threads instance for convenient access throughout the app
export const threads = globalThis.threads
