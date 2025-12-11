import { Elements } from "/core/Stores.js"
import { signout } from "/core/Access.js"
import template from "./template.js"

export class SIGNOUT extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.subscriptions = []
    }

    connectedCallback() {
        this.shadowRoot.querySelector("#signout").addEventListener("click", this.toggle)
        this.shadowRoot.querySelector("#confirm").addEventListener("click", this.signout)
        this.shadowRoot.querySelector("#back").addEventListener("click", this.toggle)
        this.subscriptions.push(
            () => this.shadowRoot.querySelector("#signout").removeEventListener("click", this.toggle),
            () => this.shadowRoot.querySelector("#confirm").removeEventListener("click", this.signout),
            () => this.shadowRoot.querySelector("#back").removeEventListener("click", this.toggle)
        )
    }

    disconnectedCallback = () => {
        this.subscriptions.forEach((off) => off())
    }

    signout = () => {
        signout()
        this.shadowRoot.querySelector("ui-modal").close()
    }

    toggle = () => {
        const check = Elements.Access?.checkpoint()
        if (!check) return
        this.shadowRoot.querySelector("ui-modal").toggleModal()
    }
}

customElements.define("ui-signout", SIGNOUT)

export default SIGNOUT
