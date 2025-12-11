import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "../context/index.js"
import "../icon/index.js"
import "../identicon/index.js"
import "../modal/index.js"
import "../button/index.js"

export const template = html`
    ${styles}
    <ui-icon size="md" icon="/images/icons/box-arrow-right.svg" id="signout" />
    <ui-modal header="signout" class="center">
        <div class="buttons">
            <ui-button class="full" left="/images/icons/check-lg.svg" id="confirm"><ui-context key="dictionary.confirm" /></ui-button>
            <ui-button class="full" left="/images/icons/arrow-left.svg" id="back"><ui-context key="dictionary.back" /></ui-button>
        </div>
    </ui-modal>
`

export default template
