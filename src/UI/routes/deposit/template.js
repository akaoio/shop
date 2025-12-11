import "../../layouts/main/index.js"
import "../../components/context/index.js"
import { html } from "/core/UI.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <layout-main>
        <h1><ui-context key="dictionary.deposit" /></h1>
    </layout-main>
`
export default template
