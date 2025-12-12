import { events } from "../Events.js"

export function notify({ content, callback, className, autoClose, onClose }) {
    events.emit("notify", {
        content,
        callback,
        className,
        autoClose,
        onClose
    })
}

export function prompt({ content, callback, className, autoClose, onClose }) {
    events.emit("prompt", {
        content,
        callback,
        className,
        autoClose,
        onClose
    })
}
