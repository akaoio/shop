import { css } from "core/UI.js"

export const styles = css`
    :host {
        input {
            padding: var(--space);
            box-sizing: border-box;
            border: var(--border);
            background: var(--background);
            color: var(--color);
            width: 100%;
            &::placeholder {
                color: var(--color);
                opacity: 0.25;
            }
            &:hover {
                &::placeholder {
                    opacity: 0.75;
                }
                border: var(--border);
            }
            &:focus {
                &::placeholder {
                    opacity: 0.5;
                }
                border: var(--border-accent);
            }
        }
    }
`

export default styles
