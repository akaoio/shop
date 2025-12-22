import template from "./template.js"

export class ITEM extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("route-item", ITEM)

export default ITEM
