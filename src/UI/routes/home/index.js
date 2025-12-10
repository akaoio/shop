import template from "./template.js"

export class HOME extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("route-home", HOME)

export default HOME
