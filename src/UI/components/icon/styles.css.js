import icon from "/css/elements/icon.css.js"
import { css } from "/core/UI.js"

export const styles = css`
    ${icon}
    :host {
        border-radius: 50%;
    }
    :host([data-size="sm"]) {
        --icon: var(--icon-sm);
    }
    :host([data-size="md"]) {
        --icon: var(--icon-md);
    }
    :host([data-size="lg"]) {
        --icon: var(--icon-lg);
    }
`

export default styles
