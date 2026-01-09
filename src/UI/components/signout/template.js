import styles from "./styles.css.js"
import { html } from "/core/UI.js"
import "/UI/components/context/index.js"
import "/UI/components/icon/index.js"
import "/UI/components/identicon/index.js"
import "/UI/components/modal/index.js"
import "/UI/components/button/index.js"

export const template = html`
    ${styles}
    <ui-icon data-size="md" data-icon="/images/icons/box-arrow-right.svg" id="signout" />
    <ui-modal data-header="signout" class="center">
        <div class="buttons">
            <ui-button class="full" data-left="/images/icons/check-lg.svg" id="confirm"><ui-context data-key="dictionary.confirm" /></ui-button>
            <ui-button class="full" data-left="/images/icons/arrow-left.svg" id="back"><ui-context data-key="dictionary.back" /></ui-button>
        </div>
    </ui-modal>
`

export default template
