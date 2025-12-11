import template from "./template.js"
import { Statics } from "/core/Stores.js"
import { Context, setLocale } from "/core/Context.js"

export class LOCALES extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        const button = this.shadowRoot.querySelector("ui-icon")
        const select = this.shadowRoot.querySelector("ui-select")

        button.addEventListener("click", () => select.show())

        const options = Statics.locales.map((locale) => {
            return {
                value: locale.code,
                label: `${locale.name}`
            }
        })
        select.states.set({ options, selected: Context.get("locale")?.code })
        select.callback = setLocale
    }
}

customElements.define("ui-locales", LOCALES)

export default LOCALES
