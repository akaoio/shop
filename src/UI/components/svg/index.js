import { html, render } from "/core/UI.js"
import styles from "./styles.css.js"

export class SVG extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
    }

    static get observedAttributes() {
        return ["data-src"]
    }

    attributeChangedCallback(name, last, value) {
        if (name !== "data-src" || last === value) return
        const svg = this.shadowRoot.querySelector("svg")
        if (svg) this.shadowRoot.removeChild(svg)
        fetch(value)
            .then((res) => res.text())
            .then((svg) => render(html`${styles}${svg}`, this.shadowRoot))
    }
}

customElements.define("ui-svg", SVG)
