import Router from "/core/Router.js"
import { Context } from "/core/Context.js"

export class A extends HTMLAnchorElement {
    constructor() {
        super()
    }

    static get observedAttributes() {
        return ["to", "locale"]
    }

    attributeChangedCallback(name, last, value) {
        if (last === value) return
        this.render()
    }

    connectedCallback() {
        this.addEventListener("click", this.click.bind(this))
        this.subscription = Context.on("locale", this.render.bind(this))
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.click.bind(this))
        this.subscription.off()
    }

    click(e) {
        e.preventDefault()
        Router.navigate(this.getAttribute("href"))
    }

    render() {
        // Calculate path
        const router = Router.process({
            path: this.getAttribute("to") || this.getAttribute("href"),
            locale: this.getAttribute("locale") || Context.get("locale").code
        })
        if (this.getAttribute("href") !== router.path) this.setAttribute("href", router.path)
    }
}

customElements.define("ui-a", A, { extends: "a" })
