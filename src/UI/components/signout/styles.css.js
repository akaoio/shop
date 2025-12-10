import { css } from "core/UI.js"
import icon from "/css/elements/icon.css.js"
import buttons from "/css/elements/buttons.css.js"

export const styles = css`
    ${icon}
    ${buttons}
    :host {
        .user {
            width: var(--icon);
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            &:has(ui-identicon[seed]) {
                ui-icon {
                    display: none;
                }
                .icon.identicon {
                    display: flex;
                }
            }
            .icon.identicon {
                display: none;
            }
        }

        ui-identicon {
            display: none;
            &[seed] {
                display: flex;
            }
        }

        ui-modal {
            section {
                display: flex;
                align-items: center;
                gap: var(--space);
                ui-identicon {
                    width: var(--icon-md);
                    min-width: var(--icon-md);
                }
                ui-context {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }
    }
`

export default styles
