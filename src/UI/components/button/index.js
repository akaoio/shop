import template from "./template.js"

export class BUTTON extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        this.shadowRoot.querySelector("button").classList = this.classList
        if (this.hasAttribute("left")) this.shadowRoot.querySelector("#left").setAttribute("src", this.getAttribute("left"))
        if (this.hasAttribute("right")) this.shadowRoot.querySelector("#right").setAttribute("src", this.getAttribute("right"))
    }
}

customElements.define("ui-button", BUTTON)
