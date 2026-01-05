import { Elements } from "/core/Stores.js"
import { Access } from "/core/Access.js"
import template from "./template.js"

export class USER extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.subscriptions = []
    }

    get identicon() {
        return this.shadowRoot.querySelector("ui-identicon")
    }

    connectedCallback() {
        this.shadowRoot.querySelector(".user").addEventListener("click", this.toggle)
        this.subscriptions.push(
            () => this.shadowRoot.querySelector(".user").removeEventListener("click", this.toggle),
            Access.on("authenticated", () => {
                if (!Access.get("authenticated")) return this.identicon.removeAttribute("seed")
            }),
            Access.on("wallet", this.render.bind(this))
        )
        if (Access.get("authenticated")) this.render()
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }

    toggle() {
        const check = Elements.Access?.checkpoint()
        if (!check) return
        Elements.User.toggle()
    }

    async render() {
        if (Access.get("wallet")?.id == null) return
        const { sea } = globalThis
        if (!sea) return
        const seed = await sea.work(Access.get("id"), Access.get("wallet").id)
        this.identicon.setAttribute("seed", seed)
    }
}

customElements.define("ui-user", USER)

export default USER
