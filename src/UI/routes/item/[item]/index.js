import template from "./template.js"
import { Context } from "/core/Context.js"
import DB from "/core/DB.js"
import Router from "/core/Router.js"
import { html, render } from "/core/UI.js"

export class ITEM extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
        this.subscriptions = []
        this.render = this.render.bind(this)
    }

    connectedCallback() {
        this.subscriptions.push(Context.on("locale", this.render))
        this.render()
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
        Context.del("item")
    }

    async render() {
        const key = Context.get("params").item || globalThis.history.state?.params?.item
        const meta = await DB.get(["statics", "items", key, "meta.json"])
        const data = await DB.get(["statics", "items", key, `${Context.get("locale").code}.json`])
        if (!data) return
        Router.setHead({
            title: data.name,
            description: data.description || ""
        })
        Context.set({ item: { ...meta, ...data } })
        const attributes = meta.attributes.map(attr => html`<div>
            <strong><ui-context data-key="dictionary.${attr.name}" /></strong>
            ${attr.values.map(value => html`<div><ui-context data-key="dictionary.${value}" /></div>`)}
        </div>`)

        render(attributes, this.shadowRoot.querySelector("#attributes"))
    }
}

customElements.define("route-item", ITEM)

export default ITEM
