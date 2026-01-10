import { Context } from "/core/Context.js"
import States from "/core/States.js"

export class CONTEXT extends HTMLElement {
    constructor(props = {}) {
        super()
        this.states = new States({ key: props.key || null })
        this.subscriptions = []
        this.render = this.render.bind(this)
        this.on = this.on.bind(this)
        this.off = this.off.bind(this)
    }

    static get observedAttributes() {
        return ["data-key"]
    }

    attributeChangedCallback(name, last, value) {
        if (name !== "data-key" || last === value) return
        this.off()
        this.on()
        this.states.set({ key: value })
    }

    connectedCallback() {
        this.on()
    }

    disconnectedCallback() {
        this.off()
    }

    on() {
        if (!this.dataset.key) return
        const key = this.dataset.key.split(".")
        this.subscriptions.push(Context.on(key, this.render), this.states.on("key", this.render))
    }

    off() {
        this.subscriptions.forEach((off) => off())
    }

    render() {
        let key = this.states.get("key") || this.dataset.key
        if (!key) return
        if (typeof key === "string") key = key.split(".")
        this.innerText = Context.get(key) || key.at(-1)
    }
}

customElements.define("ui-context", CONTEXT)

export default CONTEXT
