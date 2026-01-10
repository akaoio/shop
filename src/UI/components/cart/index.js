import template from "./template.js"
import { Statics } from "/core/Stores.js"
import { Context } from "/core/Context.js"
import { render } from "/core/UI.js"

export class CART extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
        this.subscriptions = []
    }

    connectedCallback() {
        const button = this.shadowRoot.querySelector("ui-icon")
        const modal = this.shadowRoot.querySelector("ui-modal")

        button.addEventListener("click", modal.toggleModal)
        this.subscriptions.push(
            () => button.removeEventListener("click", modal.toggleModal)
        )
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }
}

customElements.define("ui-cart", CART)

export default CART
