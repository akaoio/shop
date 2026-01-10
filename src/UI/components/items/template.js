import { html } from "/core/UI.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <section id="items"></section>
    <slot></slot>
`

export default template
