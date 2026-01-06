import template, { item } from "./template.js"
import { Access, setWallet } from "/core/Access.js"

export class WALLETS extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" }).appendChild(template.cloneNode(true))
        this.subscriptions = []
        this.step = 5
        this.increase = this.increase.bind(this)
        this.decrease = this.decrease.bind(this)
        this.render = this.render.bind(this)
    }

    get id() {
        return Number(Access.get("wallet")?.id || 0)
    }

    set id(value) {
        value = Number(value)
        const total = value >= this.total ? Math.ceil((value + 1) / this.step) * this.step : this.total
        setWallet({ id: value, total: total !== this.total ? total : undefined })
        return value
    }

    get total() {
        return Number(this.hasAttribute("total") ? this.getAttribute("total") : Access.get("wallet")?.total || this.step)
    }

    set total(value) {
        return setWallet({ total: Number(value) })
    }

    connectedCallback() {
        this.wallets = this.shadowRoot.querySelector("#wallets")
        this.shadowRoot.querySelector("#increase").addEventListener("click", this.increase)
        this.shadowRoot.querySelector("#decrease").addEventListener("click", this.decrease)
        this.subscriptions.push(
            Access.on("authenticated", ({ value }) => {
                this.style.display = value ? "flex" : "none"
                if (!value) while (this.wallets.firstChild) this.wallets.removeChild(this.wallets.firstChild)
            }),
            Access.on("wallet", this.render),
            () => this.shadowRoot.querySelector("#increase").removeEventListener("click", this.increase),
            () => this.shadowRoot.querySelector("#decrease").removeEventListener("click", this.decrease)
        )
        if (Access.get("authenticated")) this.render()
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }

    increase() { (this.total += this.step) }

    decrease() {
        if (this.total - this.step > this.id) this.total -= this.step
    }

    async create() {
        if (this.wallets.children.length >= this.total) return
        const fragment = document.createDocumentFragment()
        const currentId = this.id
        for (let id = this.wallets.children.length; id < this.total; id++) {
            const el = item.cloneNode(true)
            const radio = el.querySelector('input[type="radio"]')
            const label = el.querySelector("label")
            radio.id = `i${id}`
            radio.value = id
            if (id === currentId) radio.setAttribute("checked", true)
            label.setAttribute("for", `i${id}`)
            const select = () => this.select({ id })
            label.addEventListener("click", select)
            this.subscriptions.push(() => label.removeEventListener("click", select))
            el.querySelector("ui-identicon").setAttribute("seed", await globalThis.sea.work(Access.get("id"), id))
            fragment.appendChild(el)
        }
        this.wallets.appendChild(fragment)
    }

    remove() {
        const count = this.wallets.children.length
        const min = Math.max(this.step, this.id + 1)
        if (count <= min) return
        for (let i = 0; i < Math.min(this.step, count - this.total); i++) this.wallets.removeChild(this.wallets.lastChild)
        if (this.wallets.children.length > this.total) this.remove()
    }

    async select({ id }) {
        if (!this.wallets.querySelector(`input#i${id}`)) await this.create()
        this.id = id
    }

    async render() {
        if (!Access.get("authenticated")) return
        if (this.wallets.children.length < this.total) await this.create()
        if (this.wallets.children.length > this.total) this.remove()
    }
}

customElements.define("ui-wallets", WALLETS)
export default WALLETS
