import template from "./template.js"

export class ICON extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    static get observedAttributes() {
        return ["data-icon"]
    }

    connectedCallback() {
        if (!this.dataset.icon) return
        this.shadowRoot.querySelector("ui-svg").dataset.src = this.dataset.icon
    }

    attributeChangedCallback(name, last, value) {
        if (name === "data-icon") {
            const svg = this.shadowRoot.querySelector("ui-svg")
            if (value) svg.dataset.src = value
            else delete svg.dataset.src
        }
    }
}

customElements.define("ui-icon", ICON)

export default ICON
