import "../../components/header/index.js"
import "../../components/footer/index.js"
import styles from "./styles.css.js"
import { html } from "core/UI.js"

export const template = html`
    ${styles}
    <ui-header />
    <main><slot></slot></main>
    <ui-footer />
`

export default template
