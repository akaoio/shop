import { BROWSER } from "core/Utils/environments.js"
import { SPLASH } from "UIs/Vanilla/components/splash/index.js"

export function splash(state = false) {
    if (!BROWSER) return
    let splash = document.querySelector("ui-splash")
    if (!splash) {
        splash = new SPLASH()
        document.body.prepend(splash)
    }
    splash.switch(state)
    return state
}
