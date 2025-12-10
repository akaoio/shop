import template from "./template.js"

export class HEADER extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("ui-header", HEADER)
