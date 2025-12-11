/**
 * Router module for client-side navigation and URL management.
 * Handles route retrieval from URL parameters, history management, and page metadata updates.
 * Uses the 'p' query parameter to store the current route (e.g., ?p=home, ?p=about).
 */

import { BROWSER } from "./Utils/environments.js"
import { Context } from "./Context.js"
import { Statics } from "./Stores.js"

/**
 * Get the current route from URL parameters.
 * Returns the value of the 'p' query parameter or defaults to 'home'.
 * Only works in browser environment.
 * @returns {string} Current route name (default: 'home')
 */
export function getRoute() {
    if (!BROWSER) return
    return globalThis?.location ? new URLSearchParams(globalThis.location.search).get("p") || "home" : "home"
}

/**
 * Update page metadata (title, description, favicon).
 * Creates or updates HTML head elements for SEO and branding.
 * @param {Object} options - Configuration object
 * @param {string} options.title - Page title (site name appended automatically)
 * @param {string} options.description - Meta description for SEO
 */
export function setHead({ title = "", description = "" } = {}) {
    if (typeof document === "undefined") return
    // Update page title with site name
    document.title = title + (title ? " | " : "") + Statics?.site?.name

    // Update or create description meta tag
    const _description = document.querySelector('meta[name="description"]')
    if (_description) _description.setAttribute("content", description)
    else {
        const _description = document.createElement("meta")
        _description.name = "description"
        _description.content = description
        document.head.appendChild(_description)
    }

    // Update or create favicon link
    if (Statics?.site?.favicon) {
        // Check if the favicon link tag already exists
        const _favicon = document.querySelector('link[rel="icon"]')
        // Update existing favicon href if different
        if (_favicon?.href && _favicon.href !== Statics?.site?.favicon) _favicon.href = Statics?.site?.favicon
        // Create new favicon link tag if not present
        else {
            const _favicon = document.createElement("link")
            _favicon.rel = "icon"
            // Determine favicon type based on file extension
            _favicon.type = Statics?.site?.favicon.endsWith(".svg") ? "image/svg+xml" : "image/x-icon"
            _favicon.href = Statics?.site?.favicon
            document.head.appendChild(_favicon)
        }
    }
}

/**
 * Update browser history with the new route.
 * Adds or removes the 'p' query parameter from the URL without reloading the page.
 * Uses history.pushState for browser back/forward compatibility.
 * @param {string} route - The route to navigate to (empty string removes the parameter)
 */
export function setHistory(route) {
    if (!globalThis.history || !globalThis.location) return
    try {
        const _URL = new URL(globalThis.location.href)
        // Add or replace the 'p' parameter in the new URL
        if (route === "") _URL.searchParams.delete("p")
        else _URL.searchParams.set("p", route)
        // Check if the URL has changed from the old URL
        if (_URL.href !== globalThis.location.href && _URL.href !== globalThis.history.state?.path) {
            // Update browser history without reloading
            globalThis.history.pushState({ path: _URL.href }, "", _URL.href)
        }
    } catch (error) {
        console.error("Error setting history:", error)
    }
}

/**
 * Navigate to a new route by updating the Context.
 * Prevents unnecessary navigation if already on the target route.
 * @param {string} route - The route to navigate to
 */
export function navigate(route) {
    if (Context.get("route") === route) return
    Context.set({ route })
}

// Listen to the popstate event, which is triggered when the user navigates back to the previous page
// Updates Context route to match the URL
if (BROWSER) globalThis.addEventListener("popstate", () => Context.set({ route: getRoute() }))
