import { BROWSER } from "/core/Utils/environment.js"
import { Context } from "/core/Context.js"
import Router from "/core/Router.js"

// Cache imported components
const components = {}

export async function render(state = {}) {
    if (!BROWSER) return
    let root = document.getElementById("root")
    if (!root) {
        // Create root element for app ui
        root = document.createElement("div")
        document.body.appendChild(root)
        root.setAttribute("id", "root")
    }
    // Clear current page
    root.innerHTML = ""
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
    root.appendChild(element)
    Router.setHistory(state)
    Router.setHead({ title: Statics?.dictionary?.[state.route?.replace?.("-", "")?.toLowerCase?.()] || "" })
}

export default render
