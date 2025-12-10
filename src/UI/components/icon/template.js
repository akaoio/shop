import styles from "./styles.css.js"
import { html } from "core/UI.js"
import "../svg/index.js"

export const template = html`
    ${styles}
    <button type="button" class="icon">
        <ui-svg />
    </button>
`

export default template
