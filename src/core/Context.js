import { BROWSER } from "./Utils/environments.js"
import { States } from "./States.js"
import { Statics } from "./Stores.js"
import { load } from "./Utils/files.js"
import Router from "./Router.js"

export const Context = new States({
    route: getRoute(),
    theme: getTheme(),
    locale: getLocale(),
    fiat: getFiat(),
    referrer: null
})

// Listen to the popstate event, which is triggered when the user navigates back to the previous page
// Updates Context route to match the URL
if (BROWSER) globalThis.addEventListener("popstate", () => Context.set({ route: getRoute() }))

// Cache imported components
const components = {}

/**
 * Extract the route segment from a URL path.
 * 
 * Architecture Decision:
 * Routes are extracted using a two-step process:
 * 1. Regex captures the first segment after an optional locale prefix
 * 2. Post-validation rejects standalone locale patterns
 * 
 * Behavior:
 * - /locale/route/child-route → 'route' (locale is stripped, route is extracted)
 * - /about → 'about' (no locale prefix, first segment is the route)
 * - /page/terms → 'page' (no locale prefix, first segment is the route)
 * - /en → 'home' (standalone locale without route defaults to home)
 * - /en-US → 'home' (standalone locale with region defaults to home)
 * - / → 'home' (empty path defaults to home)
 * 
 * Locale Pattern: /^[a-z]{2}(-[A-Z]{2})?$/
 * - Two lowercase letters (ISO 639-1 language code)
 * - Optional: dash followed by two uppercase letters (ISO 3166-1 region code)
 * - Examples: en, fr, de, en-US, zh-TW, pt-BR
 * 
 * @param {string} path - Optional path to parse. Defaults to current browser location pathname.
 * @returns {string} Extracted route name, or 'home' if no valid route found.
 * @returns {undefined} Returns undefined in non-browser environments.
 */
export function getRoute(path = "") {
    if (!BROWSER) return
    const route = (path || globalThis.location?.pathname).replace(/^\/(?:(?:[a-z]{2}(?:-[A-Z]{2})?)\/)?([^/?]+)?.*$/, '$1')
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(route) ? "home" : route || "home"
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
        // Update browser history without reloading
        if (_URL.href !== globalThis.location.href && _URL.href !== globalThis.history.state?.path) globalThis.history.pushState({ path: _URL.href }, "", _URL.href)
    } catch (error) {
        console.error("Error setting history:", error)
    }
}

export function navigate(path = "") {
    const locale = getLocale(path)
    const route = getRoute(path)
    if (Context.get("route") === route) return
    Context.set({ route })
}

export async function handleRoute(route) {
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
    route = route || "home"
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

export function getTheme() {
    if (!BROWSER) return
    const memory = globalThis.localStorage ? globalThis.localStorage.getItem("theme") : null
    const system = globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const theme = memory || system || Statics.themes?.[0]?.code
    if (Statics.themes && theme && !Statics.themes.find((e) => e.code == theme)) return
    if (theme && theme !== memory && globalThis?.localStorage) globalThis.localStorage.setItem("theme", theme)
    if (globalThis?.document) globalThis.document.documentElement.dataset.theme = theme
    return theme
}

export function setTheme(theme) {
    if (globalThis.localStorage && globalThis.localStorage.getItem("theme") !== theme) globalThis.localStorage.setItem("theme", theme)
    if (globalThis.document) document.documentElement.dataset.theme = theme
    if (Context.get("theme") === theme) return
    Context.set({ theme })
}

export function getLocale(path = "") {
    if (!BROWSER) return
    const extract = (path || globalThis.location?.pathname).replace(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/.*)?$/, "$1").replace(/^\/.*$/, "")
    const memory = globalThis.localStorage ? globalThis.localStorage.getItem("locale") : null
    const code = extract || memory || Statics.site?.locale
    if (code && code !== memory && globalThis?.localStorage) globalThis.localStorage.setItem("locale", code)
    const locale = Statics.locales?.find?.((element) => element.code == code)
    if (!locale) return Statics.locales?.[0]
    // Update document lang attribute
    if (globalThis.document && globalThis.document.documentElement.lang !== locale.code) globalThis.document.documentElement.lang = locale.code
    return locale
}

export function setLocale(code) {
    // Don't proceed if new locale code is not different with the current locale code
    if (code === Context.get("locale")?.code) return

    if (globalThis.localStorage) globalThis.localStorage.setItem("locale", code)
    const locale = Statics.locales?.find?.((e) => e.code == code)
    if (!locale) return
    // Update document lang attribute
    if (globalThis.document && globalThis.document.documentElement.lang !== locale.code) globalThis.document.documentElement.lang = locale.code

    // Load dictionary based on new locale code
    load(["statics", "locales", `${code}.json`]).then((data) => {
        if (!data) return
        // Update dictionary
        globalThis.dictionary = data
        // Only run after dictionary is loaded
        Context.set({ locale, dictionary: data })
    })
}

export function getFiat() {
    const memory = globalThis.localStorage ? globalThis.localStorage.getItem("fiat") : null
    const code = memory || Statics.site?.fiat
    if (code && code !== memory && globalThis.localStorage) globalThis.localStorage.setItem("fiat", code)
    const fiat = Statics.fiats?.find?.((element) => element.code == code)
    if (!fiat) return Statics.fiats?.[0]
    return fiat
}

export function setFiat(code) {
    // Don't proceed if new fiat code is not different with the current fiat code
    if (code === Context.get("fiat")?.code) return
    if (globalThis.localStorage) globalThis.localStorage.setItem("fiat", code)
    const fiat = Statics.fiats?.find?.((e) => e.code == code)
    if (!fiat) return
    Context.set({ fiat })
}

export function getReferrer() {
    const memory = globalThis.localStorage ? globalThis.localStorage.getItem("referrer") : null
    if (!globalThis.location) return
    const code = new URLSearchParams(globalThis.location.search).get("r")
    const { gun } = globalThis
    return new Promise((resolve) => {
        if (memory) return resolve(memory)
        if (!code) return resolve()
        const scope = gun.get("#link").get(code)
        scope.on((referrer) => {
            // Only the first referrer is saved
            // This is to prevent the user from having more than 1 referrer
            if (!referrer) return
            scope.off()
            if (referrer !== memory && globalThis.localStorage) globalThis.localStorage.setItem("referrer", referrer)
            return resolve(referrer)
        })
    }).catch((error) => console.error(error))
}