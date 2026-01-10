import { css } from "/core/UI.js"

export const styles = css`
    :host {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas:
            "image"
            "header"
            "section"
            "footer";
        gap: var(--space, 1rem);

        @media (min-width: 768px) {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
                "image header"
                "image section"
                "image footer";
        }
    }
`
