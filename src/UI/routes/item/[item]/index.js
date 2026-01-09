import template from "./template.js"
import { Context } from "/core/Context.js"
import DB from "/core/DB.js"
import Router from "/core/Router.js"

export class ITEM extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.subscriptions = []
        this.render = this.render.bind(this)
    }

    connectedCallback() {
        this.subscriptions.push(Context.on("locale", this.render))
        this.render()
    }

    disconnectedCallback() {
        this.subscriptions.forEach(off => off())
    }

    async render() {
        const key = Context.get("params").item
        const meta = await DB.get(["statics", "items", key, "meta.json"])
        const data = await DB.get(["statics", "items", key, `${Context.get("locale").code}.json`])
        if (!data) return
        this.shadowRoot.querySelector("header").innerHTML = data.name
        this.shadowRoot.querySelector("section").innerHTML = JSON.stringify({ meta, data })
        Router.setHead({
            title: data.name,
            description: data.description || "",
        })
    }
}

customElements.define("route-item", ITEM)

export default ITEM
