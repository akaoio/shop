import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "/UI/components/icon/index.js"
import "/UI/components/identicon/index.js"

export const template = html`
    ${styles}
    <div class="user">
        <ui-icon data-icon="/images/icons/person.svg" />
        <button class="icon identicon"><ui-identicon data-size="7" /></button>
    </div>
`

export default template
