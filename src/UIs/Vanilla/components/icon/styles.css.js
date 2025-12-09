import icon from "css/elements/icon.css.js"
import { css } from "core/UI.js"

export const styles = css`
    ${icon}
    :host {
        border-radius: 50%;
    }
    :host([size="sm"]) {
        --icon: var(--icon-sm);
    }
    :host([size="md"]) {
        --icon: var(--icon-md);
    }
    :host([size="lg"]) {
        --icon: var(--icon-lg);
    }
`

export default styles
