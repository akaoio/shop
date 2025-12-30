import { same } from "./States/same.js"
import { notify } from "./States/notify.js"
import { has } from "./States/has.js"
import { get } from "./States/get.js"
import { set } from "./States/set.js"
import { on } from "./States/on.js"
import { off } from "./States/off.js"
import { clear } from "./States/clear.js"

/**
 * State management system with reactive updates.
 * Tracks state changes and notifies subscribers.
 * Supports nested property watching and multiple subscription types.
 */
export class States {
    /**
     * Initialize state manager with optional initial state.
     * @param {Object} states - Initial state object (default: empty object)
     */
    constructor(states = {}) {
        // Notifications as results of state changes
        this.notifications = []
        // Set of global subscribers notified on any state change
        this.SET = new Set()
        // Map of path-specific subscribers (key -> Set of subscribers)
        this.MAP = new Map()
        // Proxied state object that intercepts property assignments
        this.states = new Proxy(states, {
            // Intercept property assignments to trigger notifications
            set: (target, key, value, receiver) => {
                const last = target[key]
                if (!this.MAP.has(key)) this.MAP.set(key, new Set())
                const result = Reflect.set(target, key, value, receiver)
                // Only notify if value actually changed (deep equality check)
                if (!this.same(last, value)) this.notifications.push({ key, value, last, target, receiver })
                return result
            }
        })
    }

    same = same
    notify = notify
    has = has
    get = get
    set = set
    on = on
    off = off
    clear = clear
}

export default States
