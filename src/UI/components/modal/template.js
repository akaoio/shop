import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "/UI/components/context/index.js"

export const template = html`
    ${styles}
    <dialog>
        <div class="container">
            <header>
                <ui-context id="header" />
                <slot name="header"></slot>
            </header>
            <section>
                <slot></slot>
            </section>
            <footer>
                <span class="icon close"></span>
                <slot name="footer"></slot>
            </footer>
        </div>
    </dialog>
`

export default template
