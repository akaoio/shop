# Function Context Parameters - Real Examples

## Context Object

When a function is used as a template value, it receives:

```javascript
{
    node: Comment,              // The <!--__mark:i--> marker
    parent: Element,            // Parent element 
    index: number,              // Marker index (0, 1, 2...)
    container: Element,         // Root container
    fragment: DocumentFragment  // Fragment being built
}
```

---

## Real-World Examples

### Example 1: Numbered List Items

```javascript
const items = ['Apple', 'Banana', 'Cherry']

const template = UI.create`
    <ol>
        ${items.map(item => ({ index }) => UI.create`
            <li class="item-${index}">
                <span class="number">#${index + 1}</span>
                ${item}
            </li>
        `)}
    </ol>
`

UI.render(template, container)
```

**Output:**
```html
<ol>
    <li class="item-0"><span class="number">#1</span>Apple</li>
    <li class="item-1"><span class="number">#2</span>Banana</li>
    <li class="item-2"><span class="number">#3</span>Cherry</li>
</ol>
```

---

### Example 2: Zebra Striping

```javascript
const rows = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Bob', age: 35 }
]

const template = UI.create`
    <table>
        ${rows.map(row => ({ index }) => {
            const className = index % 2 === 0 ? 'even' : 'odd'
            return UI.create`
                <tr class="${className}">
                    <td>${row.name}</td>
                    <td>${row.age}</td>
                </tr>
            `
        })}
    </table>
`
```

---

### Example 3: Event Handlers with Closure

```javascript
const products = [
    { id: 1, name: 'Product A', price: 10 },
    { id: 2, name: 'Product B', price: 20 }
]

const handleClick = (product) => {
    console.log('Added to cart:', product)
}

const template = UI.create`
    <div class="products">
        ${products.map(product => ({ index }) => {
            const button = document.createElement('button')
            button.textContent = 'Add to Cart'
            button.className = 'btn-' + index
            button.onclick = () => handleClick(product)
            
            return UI.create`
                <div class="product">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    ${button}
                </div>
            `
        })}
    </div>
`
```

**Benefit:** Each button has its own closure over `product` data.

---

### Example 4: Reading Parent Attributes

```javascript
const template = UI.create`
    <div class="theme-container" data-theme="dark" data-size="large">
        ${({ parent }) => {
            const theme = parent.dataset.theme || 'light'
            const size = parent.dataset.size || 'medium'
            
            return UI.create`
                <div class="content ${theme}-theme ${size}-size">
                    <p>Theme: ${theme}</p>
                    <p>Size: ${size}</p>
                </div>
            `
        }}
    </div>
`
```

---

### Example 5: Container Communication

```javascript
// Container stores global state
const container = document.querySelector('#app')
container.dataset.locale = 'en'
container.dataset.currency = 'USD'

const template = UI.create`
    <div class="product">
        <h3>Product Name</h3>
        ${({ container }) => {
            const locale = container.dataset.locale
            const currency = container.dataset.currency
            
            const price = formatPrice(100, locale, currency)
            return UI.create`<span class="price">${price}</span>`
        }}
    </div>
`

UI.render(template, container)
```

---

### Example 6: Conditional Rendering Based on Parent

```javascript
const template = UI.create`
    <article class="post" data-premium="true">
        <h2>Post Title</h2>
        ${({ parent }) => {
            const isPremium = parent.dataset.premium === 'true'
            
            if (!isPremium) {
                return UI.create`
                    <div class="paywall">
                        <p>Subscribe to read more</p>
                        <button>Subscribe</button>
                    </div>
                `
            }
            
            return UI.create`
                <div class="full-content">
                    <p>Full premium content here...</p>
                </div>
            `
        }}
    </article>
`
```

---

### Example 7: Canvas Setup

```javascript
const template = UI.create`
    <div class="chart">
        ${({ parent }) => {
            const canvas = document.createElement('canvas')
            canvas.width = 600
            canvas.height = 400
            
            // Draw after append (async)
            requestAnimationFrame(() => {
                const ctx = canvas.getContext('2d')
                
                // Draw chart
                ctx.fillStyle = '#4CAF50'
                ctx.fillRect(50, 50, 100, 200)
                ctx.fillStyle = '#2196F3'
                ctx.fillRect(200, 100, 100, 150)
            })
            
            return canvas
        }}
    </div>
`
```

---

### Example 8: Accordion with State

```javascript
const sections = [
    { title: 'Section 1', content: 'Content 1' },
    { title: 'Section 2', content: 'Content 2' },
    { title: 'Section 3', content: 'Content 3' }
]

const template = UI.create`
    <div class="accordion">
        ${sections.map((section, i) => ({ index, parent }) => {
            const header = document.createElement('div')
            header.className = 'accordion-header'
            header.textContent = section.title
            
            const content = document.createElement('div')
            content.className = 'accordion-content'
            content.textContent = section.content
            content.style.display = 'none'
            
            header.onclick = () => {
                // Close all others
                parent.querySelectorAll('.accordion-content').forEach(el => {
                    el.style.display = 'none'
                })
                // Open this one
                content.style.display = 'block'
            }
            
            const section = document.createElement('div')
            section.className = 'accordion-section'
            section.appendChild(header)
            section.appendChild(content)
            
            return section
        })}
    </div>
`
```

---

### Example 9: Dynamic Class Based on Index

```javascript
const colors = ['red', 'blue', 'green', 'yellow', 'purple']
const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)

const template = UI.create`
    <div class="grid">
        ${items.map(item => ({ index }) => {
            const colorIndex = index % colors.length
            const color = colors[colorIndex]
            
            return UI.create`
                <div class="grid-item color-${color}">
                    ${item}
                </div>
            `
        })}
    </div>
`
```

---

### Example 10: Tabs with Active State

```javascript
const tabs = ['Home', 'Profile', 'Settings']
const activeTab = 'Profile'

const template = UI.create`
    <div class="tabs">
        ${tabs.map(tab => ({ index, parent }) => {
            const button = document.createElement('button')
            button.className = tab === activeTab ? 'tab active' : 'tab'
            button.textContent = tab
            
            button.onclick = () => {
                // Remove active from all
                parent.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active')
                })
                // Add to clicked
                button.classList.add('active')
                
                // Update content (could trigger re-render)
                console.log('Switched to tab:', tab)
            }
            
            return button
        })}
    </div>
`
```

---

## Best Practices

### ✅ DO: Use context for positioning

```javascript
${({ index }) => UI.create`<span>Item ${index + 1}</span>`}
```

### ✅ DO: Use parent for theming/config

```javascript
${({ parent }) => {
    const theme = parent.dataset.theme
    return UI.create`<div class="${theme}">...</div>`
}}
```

### ✅ DO: Return DOM nodes for complex interactions

```javascript
${({ parent }) => {
    const button = document.createElement('button')
    button.onclick = () => handleClick(parent)
    return button
}}
```

### ⚠️ CAREFUL: Async operations

```javascript
${({ parent }) => {
    // Schedule async work
    setTimeout(() => updateParent(parent), 0)
    // Return synchronously
    return 'Loading...'
}}
```

### ❌ DON'T: Modify fragment directly

```javascript
// ❌ Bad
${({ fragment }) => {
    fragment.appendChild(...)  // Don't mutate fragment
    return 'text'
}}

// ✅ Good
${() => {
    const el = document.createElement('div')
    return el  // Return element to be inserted
}}
```

---

## Summary

**Function context parameters enable:**
- 📍 Position awareness (index)
- 🔗 Parent element access
- 🌐 Container-wide state
- 🎯 Event handlers with closures
- 🎨 Dynamic styling based on position
- ⚙️ Complex DOM setup

**Common patterns:**
- Use `index` for numbering, classes, zebra striping
- Use `parent` for reading attributes, theming
- Use `container` for global app state
- Return DOM nodes for event handlers
- Combine with closures for data access
