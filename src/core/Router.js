import { Statics } from "./Stores.js"
import { Context } from "./Context.js"
import { Indexes } from "./Stores.js"
import { load } from "./Utils/files.js"

export class Router {
    // This function takes a URL path as input and returns an object. It works step by step as following:
    // 1. Extracts the locale from the beginning of the path if it matches one of the supported locales.
    // 2. Compares the remaining part of the path against known route patterns (like item and tag).
    // 3. Create a new path containing locale
    // 4. Returns an object containing the extracted locale and any other relevant information based on the route pattern.
    // Example:
    // - Patterns from /build/statics/routes.json:
    //   - "/item/[slug]"
    //   - "/tag/[tag]"
    // - Input: "/fr/tag/some-tag" -> Output: { locale: "fr", params: { tag: "some-tag" } }
    // - Input: "/vi/item/asdf-qwer-zxvc" -> Output: { locale: "vi", params: { slug: "asdf-qwer-zxvc" } }
    static process({ path = "", routes = [], locales = [], site = {} } = {}) {
        // Remove last segment if it's a file (contains a file extension)
        path = path || globalThis?.location?.pathname
        site = Object.keys(site).length ? site : Statics?.site || {}
        routes = routes.length ? routes : Statics?.routes || []
        locales = locales.length ? locales : Statics?.locales || []
        let segments = path.replace(/^\/+|\/+$|\/\w+\.\w+$/g, "").split("/").filter(Boolean)
        let locale = globalThis?.localStorage?.getItem?.("locale") || site?.locale || locales?.[0]?.code
        const result = {
            locale: locales.find(l => l.code === locale),
            params: {},
            route: "home"
        }
        if (segments.length) {
            // Check if first part is a supported locale or matches locale pattern
            if (locales.some(l => l.code === segments?.[0]) || /^[a-z]{2}(-[A-Z]{2})?$/.test(segments[0])) {
                locale = segments.shift()
                result.locale = locales.find(l => l.code === locale)
            }
            // Check against known route patterns
            for (const route of routes) {
                const params = this.match(segments, route)
                if (params) {
                    result.params = params
                    result.route = route
                    break
                }
            }
        }
        // Create new path including locale
        result.path = `/${[result.locale.code, ...segments].join("/")}/`
        return result
    }

    static match(segments, route) {
        const pattern = typeof route === "string" ? route : route?.path
        if (!pattern) return null
        const parts = pattern.replace(/^\/+|\/+$/g, "").split("/")

        const params = {}
        let si = 0 // segment index

        for (let pi = 0; pi < parts.length; pi++) {
            const part = parts[pi]
            const isCatchAll = part.startsWith("[...") && part.endsWith("]") && !part.startsWith("[[")
            const isOptionalCatchAll = part.startsWith("[[...") && part.endsWith("]]")

            if (isCatchAll || isOptionalCatchAll) {
                const nameMatch = part.match(/\[\[?\.\.\.(.+?)\]\]?/)
                const name = nameMatch?.[1]
                if (!name) return null
                const rest = segments.slice(si)
                if (!isOptionalCatchAll && rest.length === 0) return null // required catch-all must have at least one segment
                params[name] = rest
                si = segments.length
                // catch-all must be the last pattern part; otherwise ambiguous
                if (pi !== parts.length - 1) return null
                break
            }

            if (si >= segments.length) return null // no segment to match

            if (part.startsWith("[") && part.endsWith("]")) {
                params[part.slice(1, -1)] = segments[si]
                si += 1
                continue
            }

            if (part !== segments[si]) return null
            si += 1
        }

        // All pattern parts consumed; ensure all segments matched
        if (si !== segments.length) return null
        return params
    }

    /**
     * Update page metadata (title, description, favicon).
     * Creates or updates HTML head elements for SEO and branding.
     * @param {Object} options - Configuration object
     * @param {string} options.title - Page title (site name appended automatically)
     * @param {string} options.description - Meta description for SEO
     */
    static setHead({ title = "", description = "" } = {}) {
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

    static setHistory({ path = "", locale = {}, route = "", params = {} } = {}) {
        if (!globalThis.history || !globalThis.location) return
        try {
            const url = new URL(globalThis?.location?.href)
            if (path) url.pathname = path
            // Check if the URL has changed from the old URL, then update browser history without reloading
            if (url.pathname !== globalThis.history.state?.path) globalThis.history.pushState({ path: url.pathname, locale, route, params }, "", url)
        } catch (error) {
            console.error("Error setting history:", error)
        }
    }

    static async setLocale(code) {
        if (code && globalThis?.localStorage?.getItem("locale") !== code) globalThis.localStorage.setItem("locale", code)
        const locale = Statics.locales?.find?.((e) => e.code == code)
        Statics.dictionaries = Statics.dictionaries || await Indexes.Statics.get("dictionaries").once() || {}
        if (!locale) return
        // Update document lang attribute
        if (globalThis.document && globalThis.document.documentElement.lang !== locale.code) globalThis.document.documentElement.lang = locale.code
        // Load dictionary based on new locale code
        const data = Statics.dictionaries?.[code] || await load(["statics", "locales", `${code}.json`])
        if (!data) return
        // Cache loaded dictionary
        Statics.dictionaries[code] = data
        Indexes.Statics.get("dictionaries").put(Statics.dictionaries)
        // Update dictionary
        globalThis.dictionary = Statics.dictionary = Statics.dictionaries[code]
        // Only run after dictionary is loaded
        const payload = { dictionary: Statics.dictionaries[code] }
        if (Context.get("locale")?.code !== code) payload.locale = locale
        Context.set(payload)
    }

    static navigate(path = "") {
        Context.set(Router.process({ path }))
    }
}

export default Router