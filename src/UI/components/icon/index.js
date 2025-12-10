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

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "icon") {
            const svg = this.shadowRoot.querySelector("ui-svg")
            if (newValue) {
                svg.setAttribute("src", newValue)
            } else {
                svg.removeAttribute("src")
            }
        }
    }
}

customElements.define("ui-icon", ICON)

export default ICON
