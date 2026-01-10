/**
 * html() - Create template object instead of direct DOM nodes
 *
 * Unlike old html() (returns DocumentFragment), this returns an object
 * containing metadata so render() can process nested templates
 *
 * @param {TemplateStringsArray} strings - Array of static strings from template literal
 * @param {...any} values - Array of dynamic values (can be: string, number, node, array, or nested template)
 * @returns {TemplateResult} Object containing strings, values, and HTML string with markers
 *
 * @example
 * // Simple usage
 * const template = html`<div>Hello ${name}</div>`
 *
 * @example
 * // Nested templates
 * const inner = html`<span>World</span>`
 * const outer = html`<div>Hello ${inner}</div>`
 *
 * @example
 * // Array mapping
 * const items = [1, 2, 3]
 * const list = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`
 */
/**
 * Helper: Check if value needs marker or can be embedded directly
 * Only use markers for complex values to optimize performance
 */
function needsMarker(value) {
    // null/undefined → no marker needed, embed directly
    if (value == null) return false

    // Nested TemplateResult → NEEDS marker
    if (value._isTemplateResult) return true

    // Array → NEEDS marker (may contain nested templates)
    if (Array.isArray(value)) return true

    // DOM node → NEEDS marker
    if (value.nodeType) return true

    // Function → NEEDS marker (will be called during render)
    if (typeof value === "function") return true

    // Primitive (string, number, boolean) → NO marker needed
    return false
}

export function html(strings, ...values) {
    /**
     * STEP 1: Classify values and create HTML string with merged strings
     * - Primitive values → embed directly and merge strings (fast path)
     * - Complex values → use markers (slow path)
     * - Functions in attribute position → use special attribute markers
     */

    // Track only values that need markers
    const markerValues = []
    // Track merged strings (strings with primitives embedded)
    const mergedStrings = []
    let currentString = strings[0]

    values.forEach((value, i) => {
        // If value is simple → embed into current string and merge with next string
        if (!needsMarker(value)) {
            currentString += String(value ?? "") + strings[i + 1]
        }
        // If value is complex → save marker
        else {
            mergedStrings.push(currentString)
            markerValues.push(value)
            currentString = strings[i + 1]
        }
    })

    // If no more complex values at the end, only current string remains
    if (currentString !== undefined) {
        mergedStrings.push(currentString)
    }

    // Build HTML string with markers - detect attribute vs content position
    const htmlString = mergedStrings
        .reduce((result, str, i) => {
            if (i >= markerValues.length) return result + str

            // Check if we're inside a tag (attribute position)
            const isInAttribute = /<[^>]*$/.test(str)

            if (isInAttribute && typeof markerValues[i] === "function") {
                // Use special attribute marker for functions in attribute position
                // IMPORTANT: Use index i which maps to markerValues[i]
                return result + str + `__attr_mark:${i}__`
            } else {
                // Use comment marker for content position
                return result + str + `<!--__mark:${i}-->`
            }
        }, "")
        .trim()
        .replace(/>\s+</g, "><") // Remove whitespace between tags

    /**
     * STEP 2: Process self-closing custom elements
     * Like old html(), we need to convert <ui-button /> to <ui-button></ui-button>
     * because browsers don't understand self-closing custom elements
     */
    const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
    const selfClosingTagsRegex = new RegExp(`<(([a-z][a-z0-9]*-[a-z0-9\\-\\.]*)(\\s+[^>]*)?)\\/>`, "gi")

    const processedHtml = htmlString.replace(selfClosingTagsRegex, (match, group, tagName) => {
        if (voidElements.includes(tagName.toLowerCase())) return match
        return `<${group}></${tagName}>`
    })

    /**
     * STEP 3: Return TemplateResult object
     * This object will be processed by render() later
     *
     * Important: We do NOT create DOM nodes here, only save metadata
     * This allows render() to process nested templates recursively
     *
     * Performance optimization:
     * - mergedStrings: strings already merged with primitive values
     * - markerValues: ONLY complex values that need markers
     * - Primitive values already embedded directly into mergedStrings
     */
    return {
        strings: mergedStrings, // Merged strings (with primitives embedded)
        values: markerValues, // ONLY complex values that need markers
        html: processedHtml, // HTML string with primitives embedded + markers for complex values
        _isTemplateResult: true // Flag to identify TemplateResult
    }
}

/**
 * Type definition (for documentation)
 *
 * @typedef {Object} TemplateResult
 * @property {Array<string>} strings - Merged strings (static strings + embedded primitives)
 *                                     Length corresponds to values.length + 1
 *                                     Example: html`<div>${1} ${nested} ${3}</div>`
 *                                     → strings: ["<div>1 ", " 3</div>"]  (primitives merged)
 *                                     → values: [nested]  (only complex value)
 * @property {Array<any>} values - ONLY complex values that need markers (nested templates, arrays, DOM nodes, functions)
 *                                 Primitive values already merged into strings
 * @property {string} html - HTML string with primitives embedded + comment markers for complex values
 * @property {boolean} _isTemplateResult - Flag to identify template result object
 *
 * Performance note: Merging primitives into strings reduces:
 * - Memory usage (no need to store primitive values in array)
 * - Processing time (no need for TreeWalker to process primitive markers)
 * - Marker indices match exactly with values indices
 * - Only process markers when truly needed (nested templates, arrays, nodes)
 */

export default html
