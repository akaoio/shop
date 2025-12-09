import "../modal/index.js"
import "../context/index.js"
import styles from "./styles.css.js"
import { html } from "core/UI.js"

export const template = html`
    ${styles}
    <ui-modal />
`

export default template
