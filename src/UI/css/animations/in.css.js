import { css } from "core/UI.js"

export const styles = css`
    @keyframes in {
        from {
            opacity: 0;
            filter: blur(1rem);
            transform: translateY(1rem);
            scale: 0.75;
        }

        to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
            scale: 1;
        }
    }
`

export default styles
