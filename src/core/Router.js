import { Statics } from "./Stores.js"

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
export function parsePath({ path = "", routes = [], locales = [], site = {} } = {}) {
    path = path || globalThis?.location?.pathname
    routes = routes.length ? routes : Statics?.routes || []
    locales = locales.length ? locales : Statics?.locales?.map(l => l.code) || []
    site = Object.keys(site).length ? site : Statics?.site || {}
    const locale = globalThis?.localStorage?.getItem?.("locale") || site?.locale || locales?.[0]
    const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean)
    const result = { locale, params: {} }
    if (segments.length) {
        // Check if first part is a supported locale or matches locale pattern
        if (locales.includes(segments[0]) || /^[a-z]{2}(-[A-Z]{2})?$/.test(segments[0])) result.locale = segments.shift()
        // Check against known route patterns
        for (const route of routes) {
            const params = match(segments, route)
            if (params) {
                result.params = params
                break
            }
        }
    }
    // Create new path including locale
    result.path = `/${[result.locale, ...segments].join("/")}`
    return result
}

function match(segments, route) {
    const pattern = typeof route === "string" ? route : route?.path
    if (!pattern) return null
    const parts = pattern.replace(/^\/++|\/+$/g, "").split("/")

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