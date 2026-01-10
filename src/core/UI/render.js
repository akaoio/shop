/**
 * UI.render() - Render template object thành DOM và mount vào container
 * 
 * Hàm này nhận TemplateResult từ UI.create() và:
 * 1. Convert HTML string thành DOM
 * 2. Tìm các markers (<!--__mark:i-->) bằng TreeWalker
 * 3. Thay thế markers bằng values tương ứng
 * 4. Xử lý đệ quy nested templates
 * 5. Mount vào container
 * 
 * @param {TemplateResult|Node|string|Array} template - Template để render
 * @param {HTMLElement|ShadowRoot} container - Container để mount DOM
 * @returns {void}
 * 
 * @example
 * const template = UI.create`<div>Hello ${name}</div>`
 * UI.render(template, document.body)
 * 
 * @example
 * // Nested templates
 * const inner = UI.create`<span>World</span>`
 * const outer = UI.create`<div>Hello ${inner}</div>`
 * UI.render(outer, shadowRoot)
 */
export function render(template, container) {
    // Clear container trước
    container.innerHTML = ""

    /**
     * BƯỚC 1: Xử lý các loại input khác nhau
     */

    // Nếu là TemplateResult từ UI.create()
    if (template?._isTemplateResult) {
        renderTemplateResult(template, container)
        return
    }

    // Nếu là DOM node trực tiếp
    if (template?.nodeType) {
        container.appendChild(template)
        return
    }

    // Nếu là array (vd: items.map(...))
    if (Array.isArray(template)) {
        template.forEach(item => render(item, container))
        return
    }

    // Nếu là primitive value (string, number, etc.)
    container.textContent = String(template ?? "")
}

/**
 * renderTemplateResult() - Core logic để xử lý TemplateResult
 * 
 * @param {TemplateResult} templateResult - Object từ UI.create()
 * @param {HTMLElement|ShadowRoot} container - Container để mount
 */
function renderTemplateResult(templateResult, container) {
    const { html, values } = templateResult

    /**
     * BƯỚC 2: Tạo DocumentFragment từ HTML string
     */
    const template = document.createElement("template")
    template.innerHTML = html
    const fragment = template.content.cloneNode(true)

    /**
     * OPTIMIZATION: Nếu không có values, nghĩa là không có markers
     * → Skip TreeWalker completely! 🚀
     */
    if (values.length === 0) {
        container.appendChild(fragment)
        return
    }

    /**
     * BƯỚC 3: Tìm và thay thế markers bằng TreeWalker
     * TreeWalker cho phép duyệt qua tất cả comment nodes
     */
    const walker = document.createTreeWalker(
        fragment,
        NodeFilter.SHOW_COMMENT, // Chỉ tìm comment nodes
        null
    )

    const markers = []
    let currentNode

    // Collect tất cả markers
    while (currentNode = walker.nextNode()) {
        const match = currentNode.textContent.match(/^__mark:(\d+)$/)
        if (match) {
            const index = parseInt(match[1], 10)
            markers.push({ node: currentNode, index })
        }
    }

    /**
     * BƯỚC 4: Thay thế markers bằng values tương ứng
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
            // Tạo temporary container để render nested template
            const temp = document.createElement("div")
            renderTemplateResult(value, temp)

            // Insert tất cả children của temp vào vị trí marker
            while (temp.firstChild) {
                parent.insertBefore(temp.firstChild, node)
            }
            parent.removeChild(node)
            return
        }

        // Case 2: Array (vd: items.map(...))
        if (Array.isArray(value)) {
            value.forEach(item => {
                // Nếu item là TemplateResult
                if (item?._isTemplateResult) {
                    const temp = document.createElement("div")
                    renderTemplateResult(item, temp)
                    while (temp.firstChild) {
                        parent.insertBefore(temp.firstChild, node)
                    }
                }
                // Nếu item là DOM node
                else if (item?.nodeType) {
                    parent.insertBefore(item.cloneNode(true), node)
                }
                // Nếu item là primitive
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
     * BƯỚC 5: Mount fragment vào container
     */
    container.appendChild(fragment)
}

export default render