import { css } from "core/UI.js"

export const styles = css`
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
