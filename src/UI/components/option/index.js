import template from "./template.js"
import ITEM from "./item.js"
import States from "/core/States.js"
import { Context } from "/core/Context.js"
import { html } from "/core/UI.js"

export class OPTION extends HTMLElement {
    constructor(props = {}) {
        super()
        this.states = new States(props)
        this.attachShadow({ mode: "open" }).innerHTML = template
        this.subscriptions = []
        this.render = this.render.bind(this)
    }

    connectedCallback() {
        this.subscriptions.push(this.states.on("data", this.render))
    }

    disconnectedCallback() {
        this.subscriptions.forEach(off => off())
    }

    render() {
        if (!this.states.has("data")) return
        const data = this.states.get("data")
        const header = this.shadowRoot.querySelector("header ui-context")
        if (Context.get("dictionary")?.[data?.name]) header.dataset.key = ["dictionary", data.name].join(".")
        const children = data.map(option => {
            const element = html`<span></span>`

        })
    }
}

customElements.define("ui-choice", OPTION)

export default OPTION