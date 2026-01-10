import { css, html } from "/core/UI.js"
import icon from "/UI/css/elements/icon.css.js"

const styles = css`
    ${icon}
    :host {
        display: flex;
        justify-content: center;
        align-items: center;
    }
`

export const template = html`
    ${styles}
    <span class="icon"></span>
    <slot></slot>
`

export class ITEM extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" }).innerHTML = template
    }

    connectedCallback() {
        this.shadowRoot.querySelector("span").innerHTML = this.dataset.value
    }
}

customElements.define("ui-option-item", ITEM)

export default ITEM
