import template from "./template.js"
import { Statics } from "/core/Stores.js"
import { Context, setFiat } from "/core/Context.js"

export class FIATS extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        const span = this.shadowRoot.querySelector("span")
        const select = this.shadowRoot.querySelector("ui-select")

        // Set initial fiat symbol
        this.subscription = Context.on(["fiat", "symbol"], [span, "innerText"])

        span.addEventListener("click", () => select.show())

        const options = Statics.fiats.map((fiat) => {
            return {
                value: fiat.code,
                label: `${fiat.name} (${fiat.symbol})`
            }
        })
        select.states.set({ options, selected: Context.get("fiat")?.code })
        select.callback = setFiat
    }

    disconnectedCallback() {
        this.subscription.off()
    }
}

customElements.define("ui-fiats", FIATS)

export default FIATS
