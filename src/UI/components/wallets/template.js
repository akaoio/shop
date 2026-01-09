import "/UI/components/modal/index.js"
import "/UI/components/identicon/index.js"
import "/UI/components/context/index.js"
import styles from "./styles.css.js"
import { html } from "/core/UI.js"

export const item = html`
    <span class="item">
        <input type="radio" name="wallet" />
        <label><ui-identicon data-size="7" /></label>
    </span>
`

export const template = html`
    ${styles}
    <header>
        <ui-context data-key="dictionary.wallet" />
        <nav>
            <ui-icon id="increase" data-icon="/images/icons/plus-lg.svg" />
            <ui-icon id="decrease" data-icon="/images/icons/dash-lg.svg" />
        </nav>
    </header>
    <div id="wallets"></div>
`

export default template
