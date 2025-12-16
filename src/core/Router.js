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
export function parsePath(path = "") {

}