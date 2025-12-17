import { BROWSER } from "./Utils/environments.js"
import { States } from "./States.js"
import { Statics } from "./Stores.js"
import { load } from "./Utils/files.js"

export const Context = new States({
    theme: getTheme(),
    fiat: getFiat(),
    referrer: null
})

// Listen to the popstate event, which is triggered when the user navigates back to the previous page
// Updates Context route to match the URL
if (BROWSER) globalThis.addEventListener("popstate", () => Context.set({ route: getRoute() }))

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
        const url = globalThis?.location?.href
        // Check if the URL has changed from the old URL, then update browser history without reloading
        if (url !== globalThis.history.state?.path) globalThis.history.pushState({ path: url }, "", url)
    } catch (error) {
        console.error("Error setting history:", error)
    }
}

export function navigate(path = "") {
    // const locale = getLocale(path)
    // const route = getRoute(path)
    // if (Context.get("route") === route) return
    // Context.set({ route })
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

export function setLocale(code) {
    if (code && globalThis?.localStorage?.getItem("locale") !== code) globalThis.localStorage.setItem("locale", code)
    const locale = Statics.locales?.find?.((e) => e.code == code)
    if (!locale) return
    // Update document lang attribute
    if (globalThis.document && globalThis.document.documentElement.lang !== locale.code) globalThis.document.documentElement.lang = locale.code
    // Load dictionary based on new locale code
    load(["statics", "locales", `${code}.json`]).then((data) => {
        if (!data) return
        // Update dictionary
        globalThis.dictionary = Statics.dictionary = data
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