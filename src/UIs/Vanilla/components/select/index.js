import template from "./template.js"
import { States } from "core/States.js"
import { html } from "core/UI.js"

export class SELECT extends HTMLElement {
    constructor() {
        super()
        this.states = new States({ options: [], selected: null })
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.subscriptions = []
        this.subscriptions.push(this.states.on("options", this.render))
    }

    static get observedAttributes() {
        return ["name", "selected"]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return
        this.states.set({ [name]: newValue })
    }

    connectedCallback() {
        this.modal = this.shadowRoot.querySelector("ui-modal")
        this.modal.setAttribute("header", this.getAttribute("header"))
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }

    show = () => {
        this.modal.showModal()
    }

    close = () => {
        this.modal.close()
    }

    get name() {
        return this.states.get("name") || this.getAttribute("name")
    }

    get selected() {
        return this.states.get("selected") || this.getAttribute("selected")
    }

    select = (value) => {
        this.states.set({ selected: value })
        this.setAttribute("selected", value)
        if (typeof this.callback == "function") this.callback(value)
    }

    render = () => {
        const name = this.states.get("name") || this.getAttribute("name")
        const options = this.states
            .get("options")
            .filter((option) => {
                const exist = this.modal.querySelector(`input[type="radio"][id="${option.value}"]`)
                if (!exist) return true
                return false
            })
            .map((option) => {
                if (!option.value) return
                const template = html`<input id="${option.value}" type="radio" name=${name} value="${option.value}" /><label for="${option.value}">${option.label}</label>`
                return template.cloneNode(true)
            })
            .map((option) => {
                const radio = option.querySelector("input")
                const label = option.querySelector("label")
                if (radio.value === this.selected) radio.checked = true
                const select = () => {
                    this.select(radio.value)
                    this.modal.close()
                }
                label.addEventListener("click", select)
                this.subscriptions.push(() => label.removeEventListener("click", select))
                return option
            })
        this.modal.append(...options)
    }
}

customElements.define("ui-select", SELECT)

export default SELECT
