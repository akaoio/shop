import { Statics } from "./Stores.js"
import { Context } from "./Context.js"
import DB from "./DB.js"

export class Router {
    /**
     * Processes a URL path and returns route information with locale and parameters.
     * 
     * Steps:
     * 1. Normalizes the path (strips trailing slashes and file extensions)
     * 2. Determines locale from: path prefix → localStorage → site config → first available locale
     * 3. Matches remaining path segments against known route patterns
     * 4. Constructs normalized path with locale prefix
     * 
     * @param {Object} options - Configuration object
     * @param {string} options.path - URL path to process (defaults to current location)
     * @param {Array} options.routes - Route patterns (defaults to Statics.routes)
     * @param {Array} options.locales - Supported locales (defaults to Statics.locales)
     * @param {Object} options.site - Site configuration (defaults to Statics.site)
     * 
     * @returns {Object} Route information: { locale, params, route, path }
     * 
     * @example
     * // Route patterns from /build/statics/routes.json: "/item/[slug]", "/tag/[tag]"
     * process({ path: "/fr/tag/some-tag" })
     * // => { locale: {code: "fr", ...}, params: { tag: "some-tag" }, route: "/tag/[tag]", path: "/fr/tag/some-tag/" }
     * 
     * process({ path: "/vi/item/asdf-qwer-zxvc" })
     * // => { locale: {code: "vi", ...}, params: { slug: "asdf-qwer-zxvc" }, route: "/item/[slug]", path: "/vi/item/asdf-qwer-zxvc/" }
     * 
     * process({ path: "/" })
     * // => { locale: {code: "en", ...}, params: {}, route: "home", path: "/en/" }
     */
    static process({ path = "", routes = [], locales = [], site = {}, locale } = {}) {
        // Remove last segment if it's a file (contains a file extension)
        path = path || globalThis?.location?.pathname
        site = Object.keys(site).length ? site : Statics?.site || {}
        routes = routes.length ? routes : Statics?.routes || []
        locales = locales.length ? locales : Statics?.locales || []
        let segments = path.replace(/^\/+|\/+$|\/\w+\.\w+$/g, "").split("/").filter(Boolean)
        locale = locale || globalThis?.localStorage?.getItem?.("locale") || site?.locale || locales?.[0]?.code
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

    /**
     * Matches URL segments against a route pattern and extracts parameters.
     * 
     * Supports multiple parameter types:
     * - Dynamic segments: `[param]` - matches single segment
     * - Catch-all: `[...param]` - matches remaining segments (required)
     * - Optional catch-all: `[[...param]]` - matches remaining segments (optional)
     * 
     * @param {Array<string>} segments - URL path segments to match
     * @param {string|Object} route - Route pattern string or object with path property
     * 
     * @returns {Object|null} Extracted parameters object, or null if no match
     * 
     * @example
     * match(["item", "abc-123"], "/item/[slug]")
     * // => { slug: "abc-123" }
     * 
     * match(["tag", "electronics"], "/tag/[tag]")
     * // => { tag: "electronics" }
     * 
     * match(["docs", "api", "router"], "/docs/[...path]")
     * // => { path: ["api", "router"] }
     * 
     * match(["about"], "/item/[slug]")
     * // => null (no match)
     */
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
     * Updates page metadata including title, description, and favicon.
     * Creates or updates HTML head elements for SEO and branding.
     * 
     * - Sets page title with site name appended
     * - Creates/updates meta description tag
     * - Creates/updates favicon link (from Statics.site.favicon)
     * - Auto-detects favicon MIME type (.svg vs .ico)
     * 
     * @param {Object} options - Configuration object
     * @param {string} options.title - Page title (site name appended automatically)
     * @param {string} options.description - Meta description for SEO
     */
    static setHead({ title = "", description = "" } = {}) {
        if (typeof document === "undefined") return
        // Update page title with site name
        document.title = title + (title ? " | " : "") + Statics?.site?.name

        // Update or create description meta tag
        const $description = document.querySelector('meta[name="description"]')
        if ($description) $description.setAttribute("content", description)
        else {
            const $description = document.createElement("meta")
            $description.name = "description"
            $description.content = description
            document.head.appendChild($description)
        }

        // Update or create favicon link
        if (Statics?.site?.favicon) {
            // Check if the favicon link tag already exists
            const $favicon = document.querySelector('link[rel="icon"]')
            // Update existing favicon href if different
            if ($favicon?.href && $favicon.href !== Statics?.site?.favicon) $favicon.href = Statics?.site?.favicon
            // Create new favicon link tag if not present
            else {
                const $favicon = document.createElement("link")
                $favicon.rel = "icon"
                // Determine favicon type based on file extension
                $favicon.type = Statics?.site?.favicon.endsWith(".svg") ? "image/svg+xml" : "image/x-icon"
                $favicon.href = Statics?.site?.favicon
                document.head.appendChild($favicon)
            }
        }
    }

    /**
     * Updates browser history without reloading the page (client-side navigation).
     * Pushes new state to history stack only if the path has changed.
     * 
     * @param {Object} options - Configuration object
     * @param {string} options.path - New URL pathname to navigate to
     * @param {Object} options.locale - Locale object to store in history state
     * @param {string} options.route - Route identifier to store in history state
     * @param {Object} options.params - Route parameters to store in history state
     * 
     * @example
     * setHistory({ 
     *   path: "/fr/item/abc-123", 
     *   locale: { code: "fr" }, 
     *   route: "/item/[slug]", 
     *   params: { slug: "abc-123" } 
     * })
     */
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

    /**
     * Changes the application locale and loads the corresponding translations.
     * 
     * Performs the following operations:
     * 1. Saves locale code to localStorage
     * 2. Updates document lang attribute for accessibility/SEO
     * 3. Loads translation dictionary from DB
     * 4. Updates global dictionary reference
     * 5. Updates Context with new locale and dictionary
     * 
     * @param {string} code - Locale code (e.g., "en", "fr", "zh-TW")
     * 
     * @example
     * await setLocale("fr") // Switches to French
     * await setLocale("ja") // Switches to Japanese
     */
    static async setLocale(code) {
        if (code && globalThis?.localStorage?.getItem("locale") !== code) globalThis.localStorage.setItem("locale", code)
        const locale = Statics.locales?.find?.((e) => e.code == code)
        if (!locale) return
        // Update document lang attribute
        if (globalThis.document && globalThis.document.documentElement.lang !== locale.code) globalThis.document.documentElement.lang = locale.code
        // Load dictionary based on new locale code
        Statics.dictionary = await DB.get(["statics", "locales", `${code}.json`])
        if (!Statics.dictionary) return
        // Update dictionary
        globalThis.dictionary = Statics.dictionary
        // Only run after dictionary is loaded
        Context.set({ dictionary: Statics.dictionary, locale })
    }

    /**
     * Navigates to a new path by processing it and updating the Context.
     * Triggers route matching and extracts locale/parameters from the path.
     * 
     * @param {string} path - URL path to navigate to (e.g., "/fr/item/abc-123")
     * 
     * @example
     * navigate("/en/item/wireless-headphones")
     * navigate("/fr/tag/electronics")
     */
    static navigate(path = "") {
        Context.set(Router.process({ path }))
    }
}

export default Router