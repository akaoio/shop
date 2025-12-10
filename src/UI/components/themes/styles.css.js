import icon from "/css/elements/icon.css.js"
import bloom from "/css/animations/bloom.css.js"
import { css } from "core/UI.js"

export const styles = css`
    ${icon}
    ${bloom}

    :host {
        .icon {
            &::before,
            &::after,
            .moon,
            .sun {
                display: none;
            }

            &:focus {
                &::before,
                &::after {
                    opacity: 1;
                }
            }

            &::before,
            &::after {
                content: "";
                position: absolute;
                background: var(--background);
                opacity: 0;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }

            &::before {
                z-index: -1;
            }

            &::after {
                z-index: -2;
            }

            &.light {
                &::before {
                    display: flex;
                    animation: bloom var(--speed) ease-in-out none;
                }

                .sun {
                    display: flex;
                }
            }

            &.dark {
                &::after {
                    display: flex;
                    animation: bloom var(--speed) ease-in-out none;
                }

                .moon {
                    display: flex;
                }
            }
        }
    }
`

export default styles
