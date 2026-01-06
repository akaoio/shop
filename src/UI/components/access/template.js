import "/UI/layouts/main/index.js"
import "/UI/components/context/index.js"
import "/UI/components/modal/index.js"
import "/UI/components/button/index.js"
import styles from "./styles.css.js"
import { html } from "/core/UI.js"

export const template = html`
    ${styles}
    <ui-modal header="authentication" class="center">
        <main id="unauthenticated-screen">
            <h3><ui-context key="dictionary.welcome" /></h3>
            <p><ui-context key="dictionary.pleaseCreateAnAccountOrSignin" /></p>
            <div class="buttons">
                <ui-button class="full" left="/images/icons/fingerprint.svg" id="signin"><ui-context key="dictionary.signin" /></ui-button>
                <ui-button class="full" left="/images/icons/person-add.svg" data-screen="signup-screen"><ui-context key="dictionary.signup" /></ui-button>
            </div>
        </main>
        <main id="signup-screen">
            <h3><ui-context key="dictionary.signup" /></h3>
            <form id="signup-form">
                <input type="text" name="name" />
                <input type="text" name="displayName" />
                <div class="buttons">
                    <ui-button class="full" left="/images/icons/check-lg.svg" id="signup"><ui-context key="dictionary.confirm" /></ui-button>
                    <ui-button class="full" left="/images/icons/arrow-left.svg" id="back"><ui-context key="dictionary.back" /></ui-button>
                </div>
            </form>
        </main>
        <main id="sign-screen">
            <div class="buttons">
                <ui-button class="full" id="sign"><ui-context key="dictionary.sign" /></ui-button>
            </div>
        </main>
    </ui-modal>
`
export default template
