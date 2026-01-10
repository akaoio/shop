/**
 * UI.create() - Tạo template object thay vì DOM node trực tiếp
 * 
 * Khác với html() cũ (trả về DocumentFragment), create() trả về object
 * chứa metadata để render() có thể xử lý nested templates
 * 
 * @param {TemplateStringsArray} strings - Array các string tĩnh từ template literal
 * @param {...any} values - Array các giá trị động (có thể là: string, number, node, array, hoặc nested template)
 * @returns {TemplateResult} Object chứa strings, values, và HTML string với markers
 * 
 * @example
 * // Simple usage
 * const template = UI.create`<div>Hello ${name}</div>`
 * 
 * @example
 * // Nested templates
 * const inner = UI.create`<span>World</span>`
 * const outer = UI.create`<div>Hello ${inner}</div>`
 * 
 * @example
 * // Array mapping
 * const items = [1, 2, 3]
 * const list = UI.create`<ul>${items.map(i => UI.create`<li>${i}</li>`)}</ul>`
 */
/**
 * Helper: Check if value cần marker hay có thể nhúng trực tiếp
 * Chỉ dùng markers cho complex values để tối ưu performance
 */
function needsMarker(value) {
    // null/undefined → không cần marker, nhúng trực tiếp
    if (value == null) return false

    // Nested TemplateResult → CẦN marker
    if (value._isTemplateResult) return true

    // Array → CẦN marker (có thể chứa nested templates)
    if (Array.isArray(value)) return true

    // DOM node → CẦN marker
    if (value.nodeType) return true

    // Function → CẦN marker (sẽ được gọi khi render)
    if (typeof value === 'function') return true

    // Primitive (string, number, boolean) → KHÔNG cần marker
    return false
} export function create(strings, ...values) {
    /**
     * BƯỚC 1: Phân loại values và tạo HTML string
     * - Primitive values → nhúng trực tiếp (fast path)
     * - Complex values → dùng markers (slow path)
     */

    // Track chỉ những values cần markers
    const markerValues = []

    const htmlString = strings
        .reduce((result, str, i) => {
            if (i >= values.length) return result + str

            const value = values[i]

            // Nếu value đơn giản → nhúng trực tiếp
            if (!needsMarker(value)) {
                return result + str + String(value ?? "")
            }

            // Nếu value phức tạp → dùng marker
            const markerIndex = markerValues.length
            markerValues.push(value)
            return result + str + `<!--__mark:${markerIndex}-->`
        }, "")
        .trim()
        .replace(/>\s+</g, "><") // Remove whitespace giữa các tags

    /**
     * BƯỚC 2: Xử lý self-closing custom elements
     * Giống như html() cũ, ta cần convert <ui-button /> thành <ui-button></ui-button>
     * vì browser không hiểu self-closing custom elements
     */
    const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
    const selfClosingTagsRegex = new RegExp(`<(([a-z][a-z0-9]*-[a-z0-9\\-\\.]*)(\\s+[^>]*)?)\\/>`, "gi")

    const processedHtml = htmlString.replace(selfClosingTagsRegex, (match, group, tagName) => {
        if (voidElements.includes(tagName.toLowerCase())) return match
        return `<${group}></${tagName}>`
    })

    /**
     * BƯỚC 3: Trả về TemplateResult object
     * Object này sẽ được render() xử lý sau
     * 
     * Quan trọng: Ta KHÔNG tạo DOM node ở đây, chỉ lưu metadata
     * Điều này cho phép render() xử lý nested templates một cách đệ quy
     * 
     * Performance optimization: Chỉ lưu markerValues (complex values),
     * primitive values đã được nhúng trực tiếp vào HTML
     */
    return {
        strings,           // Original strings từ template literal
        values: markerValues, // CHỈ complex values cần markers
        html: processedHtml, // HTML string với primitives embedded + markers cho complex values
        _isTemplateResult: true // Flag để nhận diện TemplateResult
    }
}

/**
 * Type definition (for documentation)
 * 
 * @typedef {Object} TemplateResult
 * @property {TemplateStringsArray} strings - Static strings từ template literal
 * @property {Array<any>} values - CHỈ complex values cần markers (nested templates, arrays, DOM nodes)
 *                                 Primitive values đã được nhúng trực tiếp vào html string
 * @property {string} html - HTML string với primitives embedded + comment markers cho complex values
 * @property {boolean} _isTemplateResult - Flag để identify template result object
 *
 * Performance note: Việc nhúng primitives trực tiếp giảm:
 * - Memory usage (không lưu primitive values trong array)
 * - Processing time (không cần TreeWalker xử lý primitive markers)
 * - Chỉ xử lý markers khi thực sự cần (nested templates, arrays, nodes)
 */

export default create