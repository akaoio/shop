import { css } from "/core/UI.js"

export const styles = css`
    :host {
        --columns: attr(columns type(<number>), 3);
        #items {
            display: grid;
            grid-template-columns: repeat(
                auto-fit,
                minmax(calc(100% / var(--columns) - 1em), 1fr)
            );
            grid-template-rows: auto;
            gap: var(--space);
        }
    }
`
export default styles