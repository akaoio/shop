import "../../components/header/index.js"
import "../../components/footer/index.js"
import "../../layouts/main/index.js"
import "../../components/context/index.js"
import { html } from "/core/UI.js"

export const template = html`
    <layout-main>
        <h1><ui-context key="dictionary.home" /></h1>
    </layout-main>
`
export default template
