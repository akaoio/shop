import template from "./template.js"
import { render } from "/core/UI.js"

export class MODAL extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
        this.show = this.show.bind(this)
        this.showModal = this.showModal.bind(this)
        this.close = this.close.bind(this)
        this.toggle = this.toggle.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
    }

    static get observedAttributes() {
        return ["data-header"]
    }

    attributeChangedCallback(name, last, value) {
        if (name !== "data-header" || last === value) return
        this.shadowRoot.querySelector("#header").dataset.key = `dictionary.${this.dataset.header}`
    }

    connectedCallback() {
        this.dialog = this.shadowRoot.querySelector("dialog")
        this.shadowRoot.querySelectorAll("dialog, .close, footer").forEach((el) => el.addEventListener("click", this.click))
        this.shadowRoot.querySelector("#header").dataset.key = `dictionary.${this.dataset.header}`
    }

    disconnectedCallback() {
        this.shadowRoot.querySelectorAll("dialog, .close, footer").forEach((el) => el.removeEventListener("click", this.click))
    }

    click = (event) => {
        if ([...this.shadowRoot.querySelectorAll("dialog, .close, footer")].includes(event.composedPath?.()?.[0])) this.dialog.close()
    }

    show() {
        this.dialog.show()
    }

    showModal() {
        this.dialog.showModal()
    }

    close() {
        this.dialog.close()
    }

    toggle() {
        this.dialog.open ? this.dialog.close() : this.dialog.show()
    }

    toggleModal() {
        this.dialog.open ? this.dialog.close() : this.dialog.showModal()
    }
}

customElements.define("ui-modal", MODAL)

export default MODAL
