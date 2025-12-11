import { css } from "/core/UI.js"

export const styles = css`
    :host {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--space);
        header {
            --icon: var(--icon-md);
            width: 100%;
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            text-transform: uppercase;
            nav {
                display: inline-flex;
                gap: var(--space);
            }
        }
        #wallets {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(var(--icon-md), 1fr));
            gap: var(--space);
            .item {
                width: var(--icon-md);
                max-width: var(--icon-md);
                aspect-ratio: 1 / 1;
                input[type="radio"] {
                    display: none;
                    &:checked + label {
                        color: var(--color-accent);
                    }
                }
                label {
                    display: block;
                    box-sizing: border-box;
                    cursor: pointer;
                    &:hover {
                        color: var(--color-accent);
                    }
                }
            }
        }
    }
`

export default styles
