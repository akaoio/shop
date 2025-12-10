import styles from "./styles.css.js"
import { html } from "core/UI.js"
import "../svg/index.js"

const template = html`
    ${styles}
    <button>
        <ui-svg class="icon" id="left" />
        <slot></slot>
        <ui-svg class="icon" id="right" />
    </button>
`

export default template
