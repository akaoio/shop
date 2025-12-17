import { BROWSER } from "/core/Utils/environments.js"
import { Context, setHead, setHistory } from "/core/Context.js"

// Cache imported components
const components = {}

export async function render() {
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
    const route = Context.get("route") || "home"
    const component = components[route] || (await import(`/UI/routes/${route}/index.js`))
    if (!component) return
    components[route] = component
    const name = route?.replace("-", "").toUpperCase()
    if (!component[name] && !component?.default) return
    const Component = component[name] || component?.default
    const element = new Component()
    root.appendChild(element)
    const { dictionary } = Statics
    const word = route?.replace("-", "").toLowerCase()
    setHead({ title: dictionary[word] })
    setHistory(route)
}

export default render
