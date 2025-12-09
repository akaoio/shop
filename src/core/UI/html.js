export function html(strings, ...values) {
    // Combine the strings and values
    const htmlString = strings
        .reduce((result, str, i) => {
            let value = values[i] ?? "" // Ensure undefined values don't cause issues
            if (Array.isArray(value)) {
                value = value.map((v) => (v?.nodeType ? serialize(v) : v)).join("")
            } else if (value?.nodeType) {
                value = serialize(value)
            }
            return result + str + value
        }, "")
        .trim()
        .replace(/>\s+</g, "><")

    // List of standard void elements that should remain self-closing
    const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]

    // Regex to match self-closing custom elements (containing a hyphen)
    // but not matching standard void elements
    const selfClosingTagsRegex = new RegExp(`<(([a-z][a-z0-9]*-[a-z0-9\\-\\.]*)(\\s+[^>]*)?)\\/>`, "gi")

    // Replace self-closing custom element tags with properly closed tags
    const processedHtml = htmlString.replace(selfClosingTagsRegex, (match, group, tagName) => {
        // If it's a standard void element, leave it as is
        if (voidElements.includes(tagName.toLowerCase())) {
            return match
        }
        // Otherwise, convert to opening and closing tags
        return `<${group}></${tagName}>`
    })

    // Create the template from the processed HTML
    const template = document.createElement("template")
    template.innerHTML = processedHtml
    return template.content.cloneNode(true)
}

function serialize(node) {
    if (node instanceof DocumentFragment) {
        const temp = document.createElement("div")
        temp.appendChild(node.cloneNode(true))
        return temp.innerHTML
    }
    return node.outerHTML ?? "" // Fallback for elements without outerHTML
}

export default html
