import inAnimation from "/css/animations/in.css.js"
import outAnimation from "/css/animations/out.css.js"
import { css } from "/core/UI.js"

export const styles = css`
    ${inAnimation}
    ${outAnimation}
    
    :host {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
        display: block;

        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            width: 100vw;
            height: 100vh;

            &.active {
                animation: in var(--speed) ease-in forwards;
            }

            &:not(.active) {
                animation: out var(--speed) ease-out forwards;
            }

            .symbol {
                min-width: 25vmin;
                max-height: 25vmin;
            }

            .text {
                min-width: 30vmin;
                max-height: 25vmin;
                margin: var(--space-5);
            }

            .progress {
                --border-radius: 0.25rem;
                height: 0.25rem;
                width: 10rem;
                display: flex;
                position: relative;
                align-content: center;
                align-items: center;
                justify-content: center;
                border-radius: var(--border-radius);
                border: var(--border);

                &::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    filter: blur(0.25rem);
                    background-color: var(--color);
                    z-index: -1;
                    scale: 1.025;
                }

                &::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: calc((var(--value) * 100 / var(--max)) * 1%);
                    height: 100%;
                    background-color: var(--color);
                    border-radius: var(--border-radius);
                    transition: width var(--speed) ease-in-out;
                }
            }
        }
    }
`

export default styles
