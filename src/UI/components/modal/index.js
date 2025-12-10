import { Context } from "core/Context.js"
import template from "./template.js"

export class MODAL extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    static get observedAttributes() {
        return ["header"]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "header" && oldValue !== newValue) this.header({ value: newValue })
    }

    header = ({ value } = {}) => {
        if (typeof this.subscription === "function") this.subscription()
        this.subscription = Context.on(["dictionary", value], [this.shadowRoot.querySelector("#header"), "innerText"])
    }

    connectedCallback() {
        this.dialog = this.shadowRoot.querySelector("dialog")
        this.shadowRoot.querySelectorAll("dialog, .close, footer").forEach((el) => el.addEventListener("click", this.click))
    }

    disconnectedCallback() {
        this.subscription.off()
        this.querySelectorAll("dialog, .close, footer").forEach((el) => el.removeEventListener("click", this.click))
    }

    click = (event) => {
        if ([...this.shadowRoot.querySelectorAll("dialog, .close, footer")].includes(event.composedPath?.()?.[0])) this.dialog.close()
    }

    show = () => {
        this.dialog.show()
    }

    showModal = () => {
        this.dialog.showModal()
    }

    close = () => {
        this.dialog.close()
    }

    toggle = () => {
        this.dialog.open ? this.dialog.close() : this.dialog.show()
    }

    toggleModal = () => {
        this.dialog.open ? this.dialog.close() : this.dialog.showModal()
    }
}

customElements.define("ui-modal", MODAL)

export default MODAL
