import "/UI/layouts/main/index.js"
import "/UI/components/context/index.js"
import { html } from "/core/UI.js"

export const template = html`
    <layout-main>
        <h1><ui-context key="dictionary.item" /></h1>
    </layout-main>
`
export default template
