import template from "./template.js"

export class WITHDRAW extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("route-withdraw", WITHDRAW)

export default WITHDRAW
