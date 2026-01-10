import template from "./template.js"
import { render } from "/core/UI.js"

export class ICON extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
    }

    static get observedAttributes() {
        return ["data-icon"]
    }

    connectedCallback() {
        if (!this.dataset.icon) return
        this.shadowRoot.querySelector("ui-svg").dataset.src = this.dataset.icon
    }

    attributeChangedCallback(name, last, value) {
        if (name !== "data-icon") return
        const svg = this.shadowRoot.querySelector("ui-svg")
        if (value) svg.dataset.src = value
        else delete svg.dataset.src
    }
}

customElements.define("ui-icon", ICON)

export default ICON
