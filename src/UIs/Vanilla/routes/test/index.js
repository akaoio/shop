import template from "./template.js"

export class TEST extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("route-test", TEST)

export default TEST
