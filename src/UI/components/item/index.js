import template from "./template.js"
import DB from "/core/DB.js"
import { Context } from "/core/Context.js"
import { States } from "/core/States.js"
import Router from "/core/Router.js"


export class ITEM extends HTMLElement {
    constructor() {
        super()
        this.states = new States()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.subscriptions = []
    }

    connectedCallback() {
        const name = this.shadowRoot.querySelector("#name")
        const description = this.shadowRoot.querySelector("#description")
        const price = this.shadowRoot.querySelector("#price")
        this.subscriptions.push(
            Context.on("locale", () => this.render()),
            this.states.on("name", [name, "textContent"]),
            this.states.on("description", [description, "textContent"]),
            this.states.on("price", [price, "textContent"])
        )
        DB.get(["statics", "items", this.getAttribute("key"), "meta.json"]).then(data => this.states.set(data))
        if (!this.states.has(["name", "price"])) this.render()
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }

    async render() {
        const locale = Context.get("locale").code
        const data = await DB.get(["statics", "items", this.getAttribute("key"), `${locale}.json`])
        const { path } = Router.process({ path: `/item/${this.getAttribute("key")}`, locale })
        this.shadowRoot.querySelector("a[is='ui-a']").setAttribute("href", path)
        this.states.set(data)
    }
}

customElements.define("ui-item", ITEM)

export default ITEM