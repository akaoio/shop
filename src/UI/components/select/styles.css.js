import icon from "/css/elements/icon.css.js"
import radioItem from "/css/elements/radio-item.css.js"
import { css } from "/core/UI.js"

export const styles = css`
    ${icon}
    ${radioItem}

    :host {
        input[type="radio"] {
            display: none;
            appearance: none;
            &:checked + label {
                background-color: var(--background-inverted);
                color: var(--color-inverted);
            }
        }

        label {
            display: block;
            color: var(--color);
            cursor: pointer;
            padding: var(--space);
            transition: var(--speed) ease-in-out;
            &:hover {
                background-color: var(--background-inverted);
                color: var(--color-inverted);
            }
        }
    }
`

export default styles
