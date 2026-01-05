import template from "./template.js"

export class ICON extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    static get observedAttributes() {
        return ["icon"]
    }

    connectedCallback() {
        if (!this.getAttribute("icon")) return
        this.shadowRoot.querySelector("ui-svg").setAttribute("src", this.getAttribute("icon"))
    }

    attributeChangedCallback(name, last, value) {
        if (name === "icon") {
            const svg = this.shadowRoot.querySelector("ui-svg")
            if (value) svg.setAttribute("src", value)
            else svg.removeAttribute("src")
        }
    }
}

customElements.define("ui-icon", ICON)

export default ICON
