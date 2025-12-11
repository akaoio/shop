import { html } from "/core/UI.js"
import "../navigator/index.js"
import "../icon/index.js"
import "../a/index.js"
import "../locales/index.js"
import "../themes/index.js"
import "../user/index.js"
import "../fiats/index.js"
import "../access/index.js"
import "../user/modal.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <footer>
        <ui-navigator>
            <a is="ui-a" href="home"><ui-icon icon="/images/icons/house.svg" /></a>
            <a is="ui-a" href="deposit"><ui-icon icon="/images/icons/download.svg" /></a>
            <a is="ui-a" href="withdraw"><ui-icon icon="/images/icons/upload.svg" /></a>
            <ui-user />
            <ui-navigator icon="/images/icons/sliders.svg">
                <ui-locales />
                <ui-fiats />
                <ui-themes />
            </ui-navigator>
        </ui-navigator>
    </footer>
    <ui-access />
    <ui-user-modal />
`

export default template
