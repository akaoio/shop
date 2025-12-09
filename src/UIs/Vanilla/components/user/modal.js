import { Elements } from "core/Stores.js"
import { Access } from "core/Access.js"
import { html, css } from "core/UI.js"
import "../modal/index.js"
import "../signout/index.js"
import "../wallets/index.js"

const styles = css`
    :host {
        ui-modal {
            section {
                display: flex;
                align-items: center;
                gap: var(--space);
                ui-identicon {
                    width: var(--icon-md);
                    min-width: var(--icon-md);
                }
            }
        }
    }
`

const template = html`
    ${styles}
    <ui-modal header="profile" class="center">
        <ui-signout slot="header" />
        <section>
            <ui-wallets />
        </section>
    </ui-modal>
`

export class USERMODAL extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        Elements.User = this
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.subscriptions = []
    }

    get modal() {
        return this.shadowRoot.querySelector("ui-modal")
    }

    connectedCallback() {
        this.subscriptions.push(Access.on("authenticated", ({ value }) => value === false && this.modal.close()))
    }

    disconnectedCallback = () => {
        this.subscriptions.forEach((off) => off())
    }

    toggle = () => {
        const check = Elements.Access?.checkpoint()
        if (!check) return
        this.modal.toggleModal()
    }
}

customElements.define("ui-user-modal", USERMODAL)

export default USERMODAL
