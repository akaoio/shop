import { css } from "core/UI.js"

export const styles = css`
    :host {
        .container {
            margin: auto;
            overflow: hidden;
            height: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        @media screen and (max-width: 480px) {
            .container {
                width: 100%;
            }
        }

        @media screen and (min-width: 481px) and (max-width: 768px) {
            .container {
                width: 75%;
            }
        }

        @media screen and (min-width: 769px) and (max-width: 1024px) {
            .container {
                width: 50%;
            }
        }

        @media screen and (min-width: 1025px) {
            .container {
                width: 50%;
            }
        }
    }
`

export default styles
