import { css } from "core/UI.js"

export const styles = css`
    :host {
        form {
            display: flex;
            flex-direction: column;
            gap: var(--space);
            margin: var(--space) 0;
            & > * {
                outline: none;
            }
        }
    }
`

export default styles
