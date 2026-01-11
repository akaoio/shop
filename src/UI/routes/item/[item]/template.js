import "/UI/layouts/main/index.js"
import "/UI/components/context/index.js"
import "/UI/components/button/index.js"
import { html } from "/core/UI.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <layout-main>
        <section id="item">
            <div id="image" style="grid-area: image;">image</div>
            <header style="grid-area: header;"><ui-context data-key="item.name" /></header>
            <main style="grid-area: main;">
                <section id="description"><ui-context data-key="item.description" /></section>
                <section id="price"><ui-context data-key="item.price" /></section>
                <section id="attributes"></section>
            </main>
            <footer style="grid-area: footer;">
                <ui-button><ui-context data-key="dictionary.addToCart" /></ui-button>
            </footer>
        </section>
    </layout-main>
`
export default template
