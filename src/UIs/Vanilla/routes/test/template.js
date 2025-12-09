import "../../components/header/index.js"
import "../../components/footer/index.js"
import "../../components/button/index.js"
import "../../layouts/main/index.js"
import { html } from "core/UI.js"

export const template = html`
    <layout-main>
        <h1>UI Elements Showroom for testing</h1>
        <section>
            <h2>Buttons</h2>
            <div>
                <ui-button>Normal Button</ui-button>
                <ui-button class="big">Big Button</ui-button>
                <ui-button class="full">Full Button</ui-button>
                <ui-button class="full big">Full Big Button</ui-button>
            </div>
        </section>
    </layout-main>
`

export default template
