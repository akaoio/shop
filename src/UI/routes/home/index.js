import template from "./template.js"
import { render } from "/core/UI.js"

export class HOME extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
    }
}

customElements.define("route-home", HOME)

export default HOME
