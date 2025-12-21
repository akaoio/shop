import { BROWSER } from "/core/Utils/environments.js"
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
    let path = state?.path || Context.get("path")
    let locale = state?.locale || Context.get("locale") || Statics?.locales?.find?.((e) => e.code === Statics?.site?.locale) || {}
    let route = state?.route || Context.get("route") || "home"
    let params = state?.params || Context.get("params") || {}

    const component = components[route] || (await import(`/UI/routes/${route}/index.js`))
    if (!component) return
    components[route] = component
    const name = route?.replace("-", "").toUpperCase()
    if (!component[name] && !component?.default) return
    const Component = component[name] || component?.default
    const element = new Component()
    root.appendChild(element)
    Router.setHistory({ path, locale, route, params })
    const word = route?.replace?.("-", "")?.toLowerCase?.()
    if (word) Router.setHead({ title: Statics?.dictionary?.[word] })
}

export default render
