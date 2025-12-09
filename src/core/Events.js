import { NODE, BROWSER } from "./Utils/environments.js"

let EVENTS = null

if (BROWSER && !NODE) EVENTS = new EventTarget()
else if (NODE && !BROWSER) {
    const { EventEmitter } = await import("events")
    EVENTS = new EventEmitter()
}

export class Events {
    on = (event, listener) => {
        if (BROWSER && !NODE) EVENTS.addEventListener(event, listener)
        else if (NODE && !BROWSER) EVENTS.on(event, listener)
        const off = () => this.off(event, listener)
        off.off = off
        return off
    }

    off = (event, listener) => {
        if (BROWSER && !NODE) EVENTS.removeEventListener(event, listener)
        else if (NODE && !BROWSER) EVENTS.removeListener(event, listener)
    }

    emit = (event, detail) => {
        if (BROWSER && !NODE) {
            const e = new CustomEvent(event, { detail })
            EVENTS.dispatchEvent(e)
        } else if (NODE && !BROWSER) EVENTS.emit(event, { detail })
    }
}

export default Events

globalThis.events = globalThis.events || new Events()

export const events = globalThis.events
