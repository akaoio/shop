import { css } from "/core/UI.js"
import icon from "/css/elements/icon.css.js"

export const styles = css`
    ${icon}
    :host {
        .user {
            width: var(--icon);
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            &:has(ui-identicon[data-seed]) {
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
    }
`

export default styles
