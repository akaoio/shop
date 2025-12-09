import template from "./template.js"

export class NAVIGATOR extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
    }

    connectedCallback() {
        const state = this.shadowRoot.querySelector("#state")
        const label = this.shadowRoot.querySelector("label")
        const icon = this.shadowRoot.querySelector("ui-icon")
        const vibrate = () => {
            if ("vibrate" in navigator) navigator.vibrate(20)
        }
        if (icon) {
            if (this.getAttribute("icon")) icon.setAttribute("icon", this.getAttribute("icon"))
            else icon.removeAttribute("icon")
        }

        label.addEventListener("click", vibrate)

        state.addEventListener("change", () => {
            let i = -1
            let el = this
            while (el.tagName === "UI-NAVIGATOR") {
                if (el.shadowRoot.querySelector("#state").checked) i++
                if (el.tagName !== el.parentElement.tagName) break
                el = el.parentElement
            }
            el.style.setProperty("--active", i)
        })

        // Count the number of children in slot
        // Set --total for parent, and --i for each child
        const slot = this.shadowRoot.querySelector("slot")
        const children = slot.assignedElements()
        const total = children.length
        this.style.setProperty("--total", total)
        children.forEach((child, i) => {
            child.style.setProperty("--i", i + 1)
            if (child.tagName !== "UI-NAVIGATOR") child.addEventListener("click", vibrate)
        })
    }
}

customElements.define("ui-navigator", NAVIGATOR)

export default NAVIGATOR
