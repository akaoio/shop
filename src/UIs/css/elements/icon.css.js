import inAnimation from "../animations/in.css.js"
import { css } from "core/UI.js"

export const styles = css`
    ${inAnimation}

    :host {
        .icon {
            display: flex;
            position: relative;
            align-content: center;
            align-items: center;
            justify-content: center;
            width: var(--icon);
            aspect-ratio: 1 / 1;
            border: none;
            border-radius: 50%;
            background: var(--background);
            color: var(--color);
            font-size: calc(var(--icon) * 0.5);
            line-height: calc(var(--icon) * 0.75);
            cursor: pointer;
            transition: var(--speed) ease-in-out;

            &:hover {
                background: var(--background-inverted);
                color: var(--color-inverted);
            }

            &:focus * {
                animation: in var(--speed) ease-in-out none;
            }

            > * {
                width: 75%;
                aspect-ratio: 1 / 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
`

export default styles
