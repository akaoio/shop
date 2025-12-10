import { css } from "core/UI.js"

export const styles = css`
    body {
        background: var(--background);
        color: var(--color);
        font-family: var(--font);
        font-size: var(--text);
        line-height: 1.5;
        margin: 0;
        padding: var(--header-height) 0 var(--footer-height) 0;
        transition: var(--speed) ease-in-out;
    }
`

export default styles
