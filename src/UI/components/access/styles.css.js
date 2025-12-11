import { css } from "/core/UI.js"
import form from "/css/elements/form.css.js"
import input from "/css/elements/input.css.js"
import buttons from "/css/elements/buttons.css.js"

export const styles = css`
    ${form}
    ${input}
    ${buttons}
    :host {
        main {
            display: none;
            &.active {
                display: block;
            }
        }
    }
`

export default styles
