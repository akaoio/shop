import { css } from "/core/UI.js"

export const styles = css`
    #item {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
            "image header"
            "image main"
            "image footer";
        gap: var(--space, 1rem);
    }
`

export default styles