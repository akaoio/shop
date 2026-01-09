import template from "./template.js"

export class BUTTON extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        this.shadowRoot.querySelector("button").classList = this.classList
        if (this.dataset.left) this.shadowRoot.querySelector("#left").dataset.src = this.dataset.left
        if (this.dataset.right) this.shadowRoot.querySelector("#right").dataset.src = this.dataset.right
    }
}

customElements.define("ui-button", BUTTON)
