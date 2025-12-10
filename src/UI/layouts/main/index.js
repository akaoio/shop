import template from "./template.js"

export class MAIN extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }
}

customElements.define("layout-main", MAIN)

export default MAIN
