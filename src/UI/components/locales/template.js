import "/UI/components/select/index.js"
import "/UI/components/icon/index.js"
import styles from "./styles.css.js"
import { Context } from "/core/Context.js"
import { html } from "/core/UI.js"

export const template = html`
    ${styles}
    <ui-icon icon="/images/icons/translate.svg" />
    <ui-select name="locale" header="locales" selected="${Context.get("locale")?.code}" />
`

export default template
