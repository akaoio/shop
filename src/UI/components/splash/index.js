import { Statics } from "/core/Stores.js"
import "/UI/components/svg/index.js"
import { Progress } from "/core/Progress.js"
import styles from "./styles.css.js"
import { html } from "/core/UI.js"

export class SPLASH extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        const template = html`
            ${styles}
            <div class="container">
                <ui-svg class="brand symbol" src="${Statics?.site?.brand?.symbol}" />
                <ui-svg class="brand text" src="${Statics?.site?.brand?.text}" />
                <div class="progress"></div>
            </div>
        `
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        this.setAttribute("id", "splash")
        this.subscription = Progress.on(() => {
            const progress = this.shadowRoot.querySelector(".progress")
            // Set the total number of modules to load
            progress.style.setProperty("--max", Object.keys(Progress.states).length)
            // Update the number of loaded modules
            progress.style.setProperty("--value", Object.entries(Progress.states).filter(([key, value]) => value).length)
        })
    }

    disconnectedCallback() {
        this.subscription.off()
    }

    switch = (state = false) => {
        const container = this.shadowRoot.querySelector(".container")
        if (state) container.classList.add("active")
        else {
            container.classList.remove("active")
            const hide = () => {
                if (!container.classList.contains("active")) this.style.display = "none"
                container.removeEventListener("animationend", hide)
            }
            container.addEventListener("animationend", hide)
        }
    }
}

customElements.define("ui-splash", SPLASH)
