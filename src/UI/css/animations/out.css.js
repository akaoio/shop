import { css } from "core/UI.js"

export const styles = css`
    @keyframes out {
        to {
            opacity: 0;
            filter: blur(1rem);
            transform: translateY(-5rem);
            scale: 0.75;
        }
    }
`

export default styles
