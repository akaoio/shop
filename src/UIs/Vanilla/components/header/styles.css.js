import { css } from "core/UI.js"

export const styles = css`
    :host {
        header {
            height: var(--header-height);
            position: fixed;
            top: 0;
            width: 100%;

            nav {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--space);
                & a,
                & div {
                    display: flex;
                    gap: var(--space);
                }
            }

            .brand {
                max-width: 10rem;
                color: var(--color);
                display: flex;
            }
        }
    }
`

export default styles
