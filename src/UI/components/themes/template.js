import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "/UI/components/svg/index.js"

export const template = html`
    ${styles}
    <button type="button" class="icon">
        <ui-svg class="moon" src="/images/icons/moon-fill.svg" />
        <ui-svg class="sun" src="/images/icons/sun-fill.svg" />
    </button>
`

export default template
