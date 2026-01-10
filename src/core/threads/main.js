import { events } from "/core/Events.js"
import { Progress } from "/core/Progress.js"
import { Statics } from "/core/Stores.js"
import { merge } from "/core/Utils.js"
import { Construct } from "/core/Construct.js"
import Thread from "/core/Thread.js"
import { Context } from "/core/Context.js"
import Router from "/core/Router.js"
import DB from "/core/DB.js"
import styles from "/css/global.css.js"
import { SPLASH } from "/UI/components/splash/index.js"

const thread = new Thread()
const components = {}
document.head.appendChild(styles)

events.on("authenticate", () => {
    globalThis.threads.call({
        thread: "onchain",
        method: "authenticate"
    })
})

Progress.set({
    Site: false,
    GDB: false,
    User: false,
    Context: false
})

let root = document.getElementById("root")
if (!root) {
    // Create root element for app ui
    root = document.createElement("div")
    document.body.appendChild(root)
    root.setAttribute("id", "root")
}

async function render(state = {}) {
    // Render new page
    state.path = state?.path || Context.get("path") || globalThis?.location?.pathname
    if (!state?.route || !state?.locale || !state.params) state = { ...state, ...Router.process({ path: state.path }) }
    state.route = state?.route || Context.get("route") || "home"
    state.locale = state?.locale || Context.get("locale") || Statics?.locales?.find?.((e) => e.code === Statics?.site?.locale) || Statics?.locales?.[0]
    state.params = state?.params || Context.get("params") || {}
    const component = components[state.route] || (await import(`/UI/routes/${state.route}/index.js`))
    if (!component) return
    components[state.route] = component
    // Name of the component class
    const name = state.route?.replace("-", "").toUpperCase()
    // Every component must have a class with the same name as the route in uppercase
    if (!component[name] && !component?.default) return
    const Component = component[name] || component?.default
    const element = new Component()
    root.replaceChildren(element)
    Router.setHistory(state)
    Router.setHead({ title: Statics?.dictionary?.[state.route?.replace?.("-", "")?.toLowerCase?.()] || "" })
}

function splash(state = false) {
    let splash = document.querySelector("ui-splash")
    if (!splash) {
        splash = new SPLASH()
        document.body.prepend(splash)
    }
    splash.switch(state)
    return state
}

thread.init = async function () {
    const { site } = Statics
    if (!site) throw new Error("No site configs found during preload")
    splash(true)
    merge(Statics, {
        routes: await DB.get(["statics", "routes.json"]),
        locales: await DB.get(["statics", "locales.json"]),
        fiats: await DB.get(["statics", "fiats.json"]),
        themes: await DB.get(["statics", "themes.json"])
    })
    Progress.set({ Site: true })
    Progress.set({ GDB: await Construct.GDB() })
    Progress.set({ User: await Construct.User() })
    // Listen to the popstate event, which is triggered when the user navigates back to the previous page
    // Updates Context with the new route info
    globalThis.addEventListener("popstate", (data) => {
        if (Context.get("locale")?.code !== data?.state?.locale?.code) Router.setLocale(data.state.locale.code)
        render(data?.state || {})
    })
    Context.on("path", ({ value: path }) => render({ path }))
    Context.on("locale", ({ value: locale }) => Router.setLocale(locale.code))
    Progress.set({ Context: await Construct.Context() })
    splash(false)
}
