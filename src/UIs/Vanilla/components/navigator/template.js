import { html } from "core/UI.js"
import "../icon/index.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <nav>
        <div id="orbit"></div>
        <input type="checkbox" id="state" />
        <section>
            <slot></slot>
        </section>
        <label for="state" id="toggle">
            <div>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ui-icon />
        </label>
    </nav>
`

export default template
