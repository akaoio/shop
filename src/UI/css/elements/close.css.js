import icon from "./icon.css.js"
import { css } from "core/UI.js"

export const styles = css`
    ${icon}
    :host {
        .close {
            &::before,
            &::after {
                content: "";
                position: absolute;
                width: 75%;
                height: 1px;
                background: var(--color);
            }
            &::before {
                transform: rotate(45deg);
            }
            &::after {
                transform: rotate(-45deg);
            }
            &:hover {
                &::before,
                &::after {
                    background: var(--color-inverted);
                }
            }
        }
    }
`

export default styles
