import template from "./template.js"

export class DEPOSIT extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("route-deposit", DEPOSIT)

export default DEPOSIT
