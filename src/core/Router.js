import { BROWSER } from "./Utils/environments.js"
import { Context } from "./Context.js"
import { Statics } from "./Stores.js"

export function getRoute() {
    if (!BROWSER) return
    return globalThis?.location ? new URLSearchParams(globalThis.location.search).get("p") || "home" : "home"
}

export function setHead({ title = "", description = "" } = {}) {
    if (typeof document === "undefined") return
    document.title = title + (title ? " | " : "") + Statics?.site?.name

    // Check if the description meta tag already exists
    const _description = document.querySelector('meta[name="description"]')
    if (_description) _description.setAttribute("content", description)
    else {
        const _description = document.createElement("meta")
        _description.name = "description"
        _description.content = description
        document.head.appendChild(_description)
    }

    // Try to add favicon
    if (Statics?.site?.favicon) {
        // Check if the favicon link tag already exists
        const _favicon = document.querySelector('link[rel="icon"]')
        if (_favicon?.href && _favicon.href !== Statics?.site?.favicon) _favicon.href = Statics?.site?.favicon
        else {
            const _favicon = document.createElement("link")
            _favicon.rel = "icon"
            _favicon.type = Statics?.site?.favicon.endsWith(".svg") ? "image/svg+xml" : "image/x-icon"
            _favicon.href = Statics?.site?.favicon
            document.head.appendChild(_favicon)
        }
    }
}

export function setHistory(route) {
    if (!globalThis.history || !globalThis.location) return
    try {
        const _URL = new URL(globalThis.location.href)
        // Add or replace the 'p' parameter in the new URL
        if (route === "") _URL.searchParams.delete("p")
        else _URL.searchParams.set("p", route)
        // Check if the URL has changed from the old URL
        if (_URL.href !== globalThis.location.href && _URL.href !== globalThis.history.state?.path) {
            globalThis.history.pushState({ path: _URL.href }, "", _URL.href)
        }
    } catch (error) {
        console.error("Error setting history:", error)
    }
}

export function navigate(route) {
    if (Context.get("route") === route) return
    Context.set({ route })
}

// Listen to the popstate event, which is triggered when the user navigates back to the previous page
if (BROWSER) globalThis.addEventListener("popstate", () => Context.set({ route: getRoute() }))
