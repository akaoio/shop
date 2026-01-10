import { Elements } from "/core/Stores.js"
import { Context } from "/core/Context.js"
import { Access, signup, signin } from "/core/Access.js"
import template from "./template.js"
import { render } from "/core/UI.js"

export class ACCESS extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
        this.subscriptions = []
        this.signupScreen = this.signupScreen.bind(this)
        this.unauthenticated = this.unauthenticated.bind(this)
        this.signup = this.signup.bind(this)
        this.signin = this.signin.bind(this)
    }

    connectedCallback() {
        // Assign to Elements only after component is fully connected and modal is initialized
        Elements.Access = this
        this.modal = this.shadowRoot.querySelector("ui-modal")
        this.form = this.shadowRoot.querySelector("#signup-form")
        this.shadowRoot.querySelector("#signup-screen").addEventListener("click", this.signupScreen)
        this.shadowRoot.querySelector("#back").addEventListener("click", this.unauthenticated)
        this.shadowRoot.querySelector("#signup").addEventListener("click", this.signup)
        this.shadowRoot.querySelector("#signin").addEventListener("click", this.signin)
        this.subscriptions.push(
            () => this.shadowRoot.querySelector("#signup-screen").removeEventListener("click", this.signupScreen),
            () => this.shadowRoot.querySelector("#back").removeEventListener("click", this.unauthenticated),
            () => this.shadowRoot.querySelector("#signup").removeEventListener("click", this.signup),
            () => this.shadowRoot.querySelector("#signin").removeEventListener("click", this.signin)
        )

        const inputs = ["name", "displayName"]
        inputs.forEach((item) => {
            const el = this.form.querySelector(`input[name=${item}]`)
            Context.on(["dictionary", item], [el, "placeholder"])
        })
    }

    disconnectedCallback() {
        this.subscriptions.forEach((off) => off())
    }

    next(response) {
        if (response.error) return console.error(response)
        this.form.reset()
        this.modal.close()
    }

    checkpoint() {
        if (Access.get("authenticated")) return true
        this.modal.showModal()
        if (!Access.get("authenticated")) this.show("unauthenticated-screen")
        return false
    }

    show(id) {
        this.shadowRoot.querySelectorAll("main").forEach((e) => e.classList.remove("active"))
        this.shadowRoot.getElementById(id).classList.add("active")
    }

    signupScreen() {
        this.form.reset()
        this.show("signup-screen")
    }

    unauthenticated() { this.show("unauthenticated-screen") }

    signup() {
        const data = Object.fromEntries(new FormData(this.form))
        signup(data).then(() => this.next())
    }

    signin() {
        signin().then(() => this.next())
    }

    sign(data, callback) {
        this.modal.showModal()
        this.show("sign-screen")
        this.shadowRoot.querySelector("#sign").addEventListener("click", () =>
            webauthn.sign({ data }).then((data) => {
                if (typeof callback === "function") callback(data)
                this.modal.close()
            })
        )
    }
}

customElements.define("ui-access", ACCESS)

export default ACCESS
