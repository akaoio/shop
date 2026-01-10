import "/UI/layouts/main/index.js"
import "/UI/components/context/index.js"
import "/UI/components/button/index.js"
import { html } from "/core/UI.js"

export const template = html`
    <layout-main>
        <div id="image" style="grid-area: image;"></div>
        <header style="grid-area: header;"></header>
        <section style="grid-area: section;"></section>
        <footer style="grid-area: footer;">
            <ui-button><ui-context data-key="dictionary.addToCart" /></ui-button>
        </footer>
    </layout-main>
`
export default template
