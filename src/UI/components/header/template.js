import "../a/index.js"
import "../user/index.js"
import "../svg/index.js"
import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import { Statics } from "/core/Stores.js"

export const template = html`
    ${styles}
    <header>
        <nav>
            <a is="ui-a" to="/">
                <ui-svg class="brand" src="${Statics?.site?.brand?.text}" />
            </a>
            <div>
                <ui-user />
            </div>
        </nav>
    </header>
`

export default template
