import { events } from "../Events.js"

export const notify = ({ content, callback, className, autoClose, onClose }) => {
    events.emit("notify", {
        content,
        callback,
        className,
        autoClose,
        onClose
    })
}

export const prompt = ({ content, callback, className, autoClose, onClose }) => {
    events.emit("prompt", {
        content,
        callback,
        className,
        autoClose,
        onClose
    })
}
