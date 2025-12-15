import { navigate } from "/core/Context.js"

export class A extends HTMLAnchorElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.addEventListener("click", this.click)
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.click)
    }

    click = (e) => {
        e.preventDefault()
        const path = this.getAttribute("to") || this.getAttribute("href")
        if (path) navigate(path)
    }
}

customElements.define("ui-a", A, { extends: "a" })
