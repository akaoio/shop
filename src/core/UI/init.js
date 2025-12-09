import { BROWSER } from "core/Utils/environments.js"
import styles from "css/global.css.js"

export function init() {
    if (!BROWSER) return
    document.head.appendChild(styles)
}

export default init
