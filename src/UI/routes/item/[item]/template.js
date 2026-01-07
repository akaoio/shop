import "/UI/layouts/main/index.js"
import "/UI/components/context/index.js"
import "/UI/components/button/index.js"
import { html } from "/core/UI.js"

export const template = html`
    <layout-main>
        <h1><ui-context key="dictionary.item" /></h1>
        <header></header>
        <section></section>
        <footer>
            <ui-button><ui-context key="dictionary.buy" /></ui-button>
        </footer>
    </layout-main>
`
export default template
