/**
 * Universal event system that works in both browser and Node.js environments.
 * Abstracts platform-specific event handling differences.
 */

import { NODE, BROWSER } from "./Utils/environments.js"

// Global event dispatcher that uses platform-appropriate API
let EVENTS = null

// Initialize with browser EventTarget in browser environment
if (BROWSER && !NODE) EVENTS = new EventTarget()
// Initialize with Node.js EventEmitter in Node environment
else if (NODE && !BROWSER) {
    const { EventEmitter } = await import("events")
    EVENTS = new EventEmitter()
}

export class Events {
    /**
     * Register an event listener with automatic unsubscribe capability.
     * Works across browser (addEventListener) and Node.js (on) environments.
     * 
     * @param {string} event - The event name to listen for
     * @param {Function} listener - Callback function to execute when event fires
     * @returns {Function} Unsubscribe function that removes the listener
     */
    on(event, listener) {
        if (BROWSER && !NODE) EVENTS.addEventListener(event, listener)
        else if (NODE && !BROWSER) EVENTS.on(event, listener)
        // Return unsubscribe function with self-reference for convenience
        const off = () => this.off(event, listener)
        off.off = off
        return off
    }

    /**
     * Unregister an event listener.
     * Handles platform differences between browser and Node.js APIs.
     * 
     * @param {string} event - The event name to stop listening for
     * @param {Function} listener - The callback function to remove
     */
    off(event, listener) {
        if (BROWSER && !NODE) EVENTS.removeEventListener(event, listener)
        else if (NODE && !BROWSER) EVENTS.removeListener(event, listener)
    }

    /**
     * Emit/dispatch an event to all registered listeners.
     * Automatically wraps detail in an object for consistency across platforms.
     * 
     * @param {string} event - The event name to emit
     * @param {*} detail - Event payload/data to pass to listeners
     */
    emit(event, detail) {
        // Browser: create and dispatch CustomEvent
        if (BROWSER && !NODE) {
            const e = new CustomEvent(event, { detail })
            EVENTS.dispatchEvent(e)
        }
        // Node.js: emit event with detail as argument
        else if (NODE && !BROWSER) EVENTS.emit(event, { detail })
    }
}

export default Events

// Create or reuse global Events singleton for app-wide event bus
globalThis.events = globalThis.events || new Events()

// Export the global event instance for convenient access throughout the app
export const events = globalThis.events
