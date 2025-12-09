import { css } from "core/UI.js"

export const styles = css`
    :host {
        footer {
            position: fixed;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: var(--space) 0;
        }
    }
`

export default styles
