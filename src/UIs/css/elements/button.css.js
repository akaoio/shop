import { css } from "core/UI.js"

export const styles = css`
    :host {
        button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--space);
            background: var(--background);
            border: var(--border);
            padding: var(--space);
            color: var(--color);
            cursor: pointer;
            white-space: nowrap;
            box-sizing: border-box;
            font-family: var(--font);
            &.full {
                width: 100%;
            }
            &:has(.icon[src]) {
                justify-content: stretch;
            }
            .icon:not([src]) {
                display: none;
            }
            .icon {
                width: var(--icon);
                aspect-ratio: 1;
            }
        }

        button:hover {
            background: var(--background-inverted);
            color: var(--color-inverted);
        }
    }
`

export default styles
