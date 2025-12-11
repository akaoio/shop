import { Statics } from "/core/Stores.js"
import { Context } from "/core/Context.js"
import { setHead, setHistory } from "/core/Router.js"

export function render() {
    // Initial render
    handleRoute(Context.get("route"))

    // Listen for route changes
    Context.on("route", ({ value: route }) => handleRoute(route))
}

// Cache imported components
const components = {}

// Create root element for app ui
const root = document.createElement("div")
document.body.appendChild(root)
root.setAttribute("id", "root")

async function handleRoute(route) {
    // Clear current page
    root.innerHTML = ""
    // Render new page
    route = route || "home"
    const component = components[route] || (await import(`./routes/${route}/index.js`))
    if (!component) return
    components[route] = component
    const name = route.replace("-", "").toUpperCase()
    if (!component[name] && !component?.default) return
    const Component = component[name] || component?.default
    const element = new Component()
    root.appendChild(element)
    const { dictionary } = Statics
    const word = route?.replace("-", "").toLowerCase()
    setHead({ title: dictionary[word] })
    setHistory(route)
}
