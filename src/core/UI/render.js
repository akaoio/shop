/**
 * Helper: Safely get nodes from container
 * ShadowRoot cannot be cloned, so we need special handling
 */
function getNodesFromContainer(container) {
    const content = container.nodeName === 'TEMPLATE' ? container.content : container

    // If only 1 child, return that child
    if (content.childNodes.length === 1) {
        return content.firstChild
    }

    // If container is ShadowRoot, create fragment with cloned children
    if (content instanceof ShadowRoot) {
        const fragment = document.createDocumentFragment()
        Array.from(content.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true))
        })
        return fragment
    }

    // For other containers, clone the whole thing
    return content.cloneNode(true)
}

/**
 * UI.render() - Render template object to DOM and optionally mount to container
 * 
 * This function receives TemplateResult from html() and:
 * 1. Convert HTML string to DOM
 * 2. Find markers (<!--__mark:i-->) using TreeWalker
 * 3. Replace markers with corresponding values
 * 4. Process nested templates recursively
 * 5. Mount to container if provided, always return rendered nodes
 * 
 * @param {TemplateResult|Node|string|Array} template - Template to render
 * @param {HTMLElement|ShadowRoot} [container] - Container to mount DOM (optional)
 * @returns {DocumentFragment|Node} - Always returns rendered nodes
 * 
 * @example
 * // Render to container and get nodes
 * const nodes = render(template, document.body)
 * 
 * @example
 * // Get rendered nodes without container
 * const nodes = render(html`<div>Hello ${name}</div>`)
 * someElement.appendChild(nodes)
 * 
 * @example
 * // Nested templates
 * const inner = html`<span>World</span>`
 * const outer = html`<div>Hello ${inner}</div>`
 * const nodes = render(outer, shadowRoot)
 */
export function render(template, container) {
    // Create temp container if none provided
    const hasContainer = container && container.nodeType
    if (!hasContainer) {
        container = document.createElement("template")
    }

    // Clear container first
    // Special handling for <template> element
    if (container.nodeName === 'TEMPLATE') {
        container.content.textContent = ""
    } else {
        container.innerHTML = ""
    }

    /**
     * STEP 1: Handle different input types
     */

    // If it's a TemplateResult from html()
    if (template?._isTemplateResult) {
        // If container is <template>, render to .content
        const target = container.nodeName === 'TEMPLATE' ? container.content : container
        renderTemplateResult(template, target)
        // Return nodes after rendering
        return getNodesFromContainer(container)
    }

    // If it's a direct DOM node
    if (template?.nodeType) {
        const target = container.nodeName === 'TEMPLATE' ? container.content : container
        target.appendChild(template)
        // Return the appended node
        return template
    }

    // If it's an array (e.g., items.map(...))
    if (Array.isArray(template)) {
        template.forEach(item => render(item, container))
        // Return all rendered nodes
        return getNodesFromContainer(container)
    }

    // If it's a primitive value (string, number, etc.)
    if (container.nodeName === 'TEMPLATE') {
        container.content.textContent = String(template ?? "")
    } else {
        container.textContent = String(template ?? "")
    }

    // Always return the rendered nodes
    return getNodesFromContainer(container)
}

/**
 * renderTemplateResult() - Core logic to process TemplateResult
 * 
 * @param {TemplateResult} templateResult - Object from html()
 * @param {HTMLElement|ShadowRoot} container - Container to mount
 */
function renderTemplateResult(templateResult, container) {
    const { html, values } = templateResult

    /**
     * STEP 2: Create DocumentFragment from HTML string
     */
    const template = document.createElement("template")
    template.innerHTML = html
    const fragment = template.content.cloneNode(true)

    /**
     * OPTIMIZATION: If no values, means no markers
     * → Skip TreeWalker completely! 🚀
     */
    if (values.length === 0) {
        container.appendChild(fragment)
        return
    }

    /**
     * STEP 3: Find and replace markers using TreeWalker
     * TreeWalker allows traversing all comment nodes
     */
    const walker = document.createTreeWalker(
        fragment,
        NodeFilter.SHOW_COMMENT, // Only find comment nodes
        null
    )

    const markers = []
    let currentNode

    // Collect all markers
    while (currentNode = walker.nextNode()) {
        const match = currentNode.textContent.match(/^__mark:(\d+)$/)
        if (match) {
            const index = parseInt(match[1], 10)
            markers.push({ node: currentNode, index })
        }
    }

    /**
     * STEP 4: Replace markers with corresponding values
     */
    markers.forEach(({ node, index }) => {
        let value = values[index]
        const parent = node.parentNode

        if (!parent) return

        // Case 0: Function → call it with context parameters
        if (typeof value === 'function') {
            value = value({
                node,           // Comment node marker
                parent,         // Parent element
                index,          // Marker index
                container,      // Root container
                fragment        // DocumentFragment being built
            })
        }

        // Case 1: Nested TemplateResult
        if (value?._isTemplateResult) {
            // Create temporary container to render nested template
            const temp = document.createElement("div")
            renderTemplateResult(value, temp)

            // Insert all children of temp at marker position
            while (temp.firstChild) {
                parent.insertBefore(temp.firstChild, node)
            }
            parent.removeChild(node)
            return
        }

        // Case 2: Array (e.g., items.map(...))
        if (Array.isArray(value)) {
            value.forEach(item => {
                // If item is TemplateResult
                if (item?._isTemplateResult) {
                    const temp = document.createElement("div")
                    renderTemplateResult(item, temp)
                    while (temp.firstChild) {
                        parent.insertBefore(temp.firstChild, node)
                    }
                }
                // If item is DOM node
                else if (item?.nodeType) {
                    parent.insertBefore(item.cloneNode(true), node)
                }
                // If item is primitive
                else {
                    parent.insertBefore(document.createTextNode(String(item ?? "")), node)
                }
            })
            parent.removeChild(node)
            return
        }

        // Case 3: DOM node
        if (value?.nodeType) {
            parent.replaceChild(value.cloneNode(true), node)
            return
        }

        // Case 4: Primitive value (string, number, null, undefined)
        parent.replaceChild(document.createTextNode(String(value ?? "")), node)
    })

    /**
     * STEP 5: Mount fragment to container
     */
    container.appendChild(fragment)
}

export default render