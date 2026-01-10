import template from "./template.js"
import { render } from "/core/UI.js"

export class MAIN extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
    }
}

customElements.define("layout-main", MAIN)

export default MAIN
