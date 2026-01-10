import template from "./template.js"
import { Context, setTheme } from "/core/Context.js"
import { render } from "/core/UI.js"

export class THEMES extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
    }

    connectedCallback() {
        const button = this.shadowRoot.querySelector("button")
        button.classList.add(Context.get("theme"))
        button.addEventListener("click", () => setTheme(Context.get("theme") === "dark" ? "light" : "dark"))
        this.subscription = Context.on("theme", ({ value, last }) => {
            button.classList.remove(last)
            button.classList.add(value)
        })
    }

    disconnectedCallback() {
        this.subscription.off()
    }
}

customElements.define("ui-themes", THEMES)

export default THEMES
