import { Context } from "/core/Context.js"
import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "/UI/components/icon/index.js"
import "/UI/components/modal/index.js"

export const template = html`
    ${styles}
    <ui-icon data-icon="/images/icons/bag.svg" />
    <ui-modal data-header="cart">Cart modal content goes here.</ui-modal>
`

export default template
