import { html } from "/core/UI.js"
import "/UI/components/navigator/index.js"
import "/UI/components/icon/index.js"
import "/UI/components/a/index.js"
import "/UI/components/locales/index.js"
import "/UI/components/themes/index.js"
import "/UI/components/user/index.js"
import "/UI/components/fiats/index.js"
import "/UI/components/access/index.js"
import "/UI/components/user/modal.js"
import styles from "./styles.css.js"

export const template = html`
    ${styles}
    <footer>
        <ui-navigator>
            <a is="ui-a" to="/"><ui-icon icon="/images/icons/house.svg" /></a>
            <a is="ui-a" to="/deposit"><ui-icon icon="/images/icons/download.svg" /></a>
            <a is="ui-a" to="/withdraw"><ui-icon icon="/images/icons/upload.svg" /></a>
            <ui-user />
            <ui-navigator icon="/images/icons/sliders.svg">
                <ui-locales />
                <ui-fiats />
                <ui-themes />
            </ui-navigator>
        </ui-navigator>
    </footer>
    <ui-access />
    <ui-user-modal />
`

export default template
