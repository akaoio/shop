import { Context } from "core/Context.js"

export class CONTEXT extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        const key = this.getAttribute("key").split(".")
        this.subscription = Context.on(key, [this, "innerText"])
    }

    disconnectedCallback() {
        this.subscription.off()
    }
}

customElements.define("ui-context", CONTEXT)

export default CONTEXT
