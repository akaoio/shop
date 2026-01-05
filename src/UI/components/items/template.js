import { html } from "/core/UI.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <div id="items"></div>
    <slot></slot>
`

export default template