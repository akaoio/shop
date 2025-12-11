import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "../icon/index.js"
import "../identicon/index.js"

export const template = html`
    ${styles}
    <div class="user">
        <ui-icon icon="/images/icons/person.svg" />
        <button class="icon identicon"><ui-identicon size="7" /></button>
    </div>
`

export default template
