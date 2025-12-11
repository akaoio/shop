import "../modal/index.js"
import "../identicon/index.js"
import "../context/index.js"
import styles from "./styles.css.js"
import { html } from "/core/UI.js"

export const item = html`
    <span class="item">
        <input type="radio" name="wallet" />
        <label><ui-identicon size="7" /></label>
    </span>
`

export const template = html`
    ${styles}
    <header>
        <ui-context key="dictionary.wallet" />
        <nav>
            <ui-icon id="increase" icon="/images/icons/plus-lg.svg" />
            <ui-icon id="decrease" icon="/images/icons/dash-lg.svg" />
        </nav>
    </header>
    <div id="wallets"></div>
`

export default template
