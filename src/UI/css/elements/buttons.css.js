import { css } from "core/UI.js"

export const styles = css`
    :host {
        .buttons {
            display: flex;
            justify-content: center;
            align-items: auto;
            gap: var(--space);
            & > * {
                flex-grow: 1;
                box-sizing: border-box;
                width: 50%;
                text-align: center;
            }
        }
    }
`

export default styles
