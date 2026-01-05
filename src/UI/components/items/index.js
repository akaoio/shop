import template from "./template.js"
import { States } from "/core/States.js"
import ITEM from "/UI/components/item/index.js"
import DB from "/core/DB.js"

export class ITEMS extends HTMLElement {
    constructor() {
        super()
        this.states = new States()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        DB.get(["statics", "items", "meta.json"]).then(data => this.states.set(data))
        this.states.on("pages", this.render.bind(this))
    }

    async render() {
        const pages = this.states.get("pages")
        const start = this.getAttribute("start") ? parseInt(this.getAttribute("start")) : 1
        let end = this.getAttribute("end") ? parseInt(this.getAttribute("end")) : pages
        if (end < start) end = start
        if (end > pages) end = pages
        const data = []
        for (let i = start; i <= end; i++) {
            const page = await DB.get(["statics", "items", `${i}.json`])
            data.push(...page)
        }
        const children = data.map(item => {
            const element = new ITEM()
            element.setAttribute("key", item)
            return element
        })
        this.shadowRoot.querySelector("#items").replaceChildren(...children)
    }
}

customElements.define("ui-items", ITEMS)

export default ITEMS