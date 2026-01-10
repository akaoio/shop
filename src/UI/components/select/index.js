import template from "./template.js"
import States from "/core/States.js"
import { html, render } from "/core/UI.js"

export class SELECT extends HTMLElement {
    constructor() {
        super()
        this.states = new States({ options: [], selected: null })
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
        this.subscriptions = []
        this.show = this.show.bind(this)
        this.close = this.close.bind(this)
        this.select = this.select.bind(this)
        this.render = this.render.bind(this)
    }

    static get observedAttributes() {
        return ["data-name", "data-selected"]
    }

    attributeChangedCallback(name, last, value) {
        if (last === value) return
        this.states.set({ [name.replace("data-", "")]: value })
    }

    connectedCallback() {
        this.subscriptions.push(this.states.on("options", this.render))
        this.modal = this.shadowRoot.querySelector("ui-modal")
        this.modal.dataset.header = this.dataset.header
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }

    show() {
        this.modal.showModal()
    }

    close() {
        this.modal.close()
    }

    get name() {
        return this.states.get("name") || this.dataset.name
    }

    get selected() {
        return this.states.get("selected") || this.dataset.selected
    }

    select(value) {
        this.states.set({ selected: value })
        this.dataset.selected = value
        if (typeof this.callback == "function") this.callback(value)
    }

    render() {
        const name = this.states.get("name") || this.dataset.name
        const options = this.states
            .get("options")
            .filter((option) => {
                // Only process options that don't exist yet
                const exist = this.modal.querySelector(`input[type="radio"][id="${option.value}"]`)
                return !exist && option.value
            })
            .map((option) => {
                const select = () => {
                    this.select(option.value)
                    this.modal.close()
                }
                return render(html`
                    <input id="${option.value}" type="radio" name="${name}" value="${option.value}" ${option.value == this.selected ? "checked" : ""} />
                    <label for="${option.value}" ${({ element }) => {
                        element.addEventListener("click", select)
                        this.subscriptions.push(() => element.removeEventListener("click", select))
                    }}>${option.label}</label>
                `)
            })

        // Only append if there are new options
        if (options.length > 0) {
            this.modal.append(...options)
        }
    }
}

customElements.define("ui-select", SELECT)

export default SELECT
