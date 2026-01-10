import { html } from "/core/UI.js"
import styles from "./styles.js"
import "/UI/components/context/index.js"

export const template = html`
    ${styles}
    <header><ui-context /></header>
    <section id="options"></section>
    <slot></slot>
`

export default template
