import "/UI/layouts/main/index.js"
import "/UI/components/context/index.js"
import "/UI/components/items/index.js"
import { html } from "/core/UI.js"

export const template = html`
    <layout-main>
        <h1><ui-context key="dictionary.home" /></h1>
        <ui-items start="1" end="3" />
    </layout-main>
`
export default template
