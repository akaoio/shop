# Function Values in Templates

## Overview

Functions as template values enable powerful patterns:
- **Lazy evaluation** - Only execute when rendering
- **Dynamic computation** - Compute values at render time
- **Composition** - Functions return templates
- **Encapsulation** - Hide logic inside functions
- **Context access** - Access DOM nodes and position info

---

## How It Works

### 1. Functions need markers

```javascript
function needsMarker(value) {
    if (typeof value === 'function') return true
    // ...
}
```

**Why?** Functions cannot be embedded as strings. Must be called during render.

### 2. Functions are called during render with context

```javascript
// In render()
let value = values[index]

if (typeof value === 'function') {
    value = value({
        node,           // The comment marker node
        parent,         // Parent element containing the marker
        index,          // Marker index in values array
        container,      // Root container being rendered to
        fragment        // DocumentFragment being built
    })
}

// Then process the return value
```

**Result:** Function return value is processed based on its type.

---

## Function Context Parameters

When your function is called, it receives an object with:

```javascript
{
    node: Comment,              // The <!--__mark:i--> comment node
    parent: Element,            // Parent element of the marker
    index: number,              // Index in the values array (0, 1, 2...)
    container: Element,         // Root container (from UI.render(template, container))
    fragment: DocumentFragment  // The fragment being constructed
}
```

### Examples Using Context

#### Access parent element
```javascript
const template = UI.create`
    <div class="container">
        ${({ parent }) => {
            // parent is the <div class="container">
            parent.dataset.initialized = 'true'
            return 'Content'
        }}
    </div>
`
```

#### Use index for numbering
```javascript
const items = ['A', 'B', 'C']

const template = UI.create`
    <ul>
        ${items.map(item => ({ index }) => UI.create`
            <li>Item ${index + 1}: ${item}</li>
        `)}
    </ul>
`
// Result: Item 1: A, Item 2: B, Item 3: C
```

#### Access container for global context
```javascript
const template = UI.create`
    <div>
        ${({ container }) => {
            // Check container's dataset
            const theme = container.dataset.theme || 'light'
            return UI.create`<span>Theme: ${theme}</span>`
        }}
    </div>
`

// Usage
const container = document.querySelector('#app')
container.dataset.theme = 'dark'
UI.render(template, container)
```

---

## Use Cases

### 1. Lazy Evaluation

**Problem:** Expensive computation shouldn't run if template is never rendered.

```javascript
// ❌ Bad: Runs immediately
const expensiveValue = computeExpensiveValue()
const template = UI.create`<div>${expensiveValue}</div>`

// ✅ Good: Only runs when rendering
const template = UI.create`<div>${() => computeExpensiveValue()}</div>`
```

**Benefit:** Performance - computation only happens when needed.

---

### 2. Dynamic Computed Values

**Problem:** Value depends on current state/time.

```javascript
// Current time - changes every second
const template = UI.create`
    <div>
        Current time: ${() => new Date().toLocaleTimeString()}
    </div>
`

// Re-render to update
setInterval(() => {
    UI.render(template, container)
}, 1000)
```

**Benefit:** Fresh value on each render.

---

### 3. Access Parent Element

**Problem:** Need to manipulate or read from parent element.

```javascript
const template = UI.create`
    <div class="card" data-theme="dark">
        ${({ parent }) => {
            const theme = parent.dataset.theme
            return UI.create`<span class="${theme}-text">Themed content</span>`
        }}
    </div>
`
```

**Benefit:** Access to parent element's attributes, classes, dataset, etc.

---

### 4. Event Handlers with Context

**Problem:** Need to attach event handlers that know their position.

```javascript
const items = ['Apple', 'Banana', 'Cherry']

const template = UI.create`
    <ul>
        ${items.map((item, i) => ({ parent, index }) => {
            const li = UI.create`
                <li data-index="${index}">${item}</li>
            `
            
            // Note: li is TemplateResult, need to handle after render
            // Better pattern below
            return li
        })}
    </ul>
`
```

**Better pattern with node access:**
```javascript
const template = UI.create`
    <ul>
        ${items.map(item => ({ parent }) => {
            // Create element directly for event handling
            const li = document.createElement('li')
            li.textContent = item
            li.onclick = () => console.log(`Clicked ${item}`)
            return li  // Return DOM node
        })}
    </ul>
`
```

**Benefit:** Event handlers with closure over data and position.

---

### 5. Conditional Rendering with Context

### 5. Conditional Rendering with Context

```javascript
const template = UI.create`
    <header data-logged-in="true">
        ${({ parent }) => {
            const isLoggedIn = parent.dataset.loggedIn === 'true'
            return isLoggedIn 
                ? UI.create`<button>Logout</button>`
                : UI.create`<button>Login</button>`
        }}
    </header>
`
```

**Benefit:** Template structure changes based on parent's state.

---

### 6. Index-based Rendering

**Problem:** Need to know position in list for styling or numbering.

```javascript
const items = ['First', 'Second', 'Third']

const template = UI.create`
    <ol>
        ${items.map(item => ({ index }) => UI.create`
            <li class="item-${index}">
                <span class="number">${index + 1}.</span>
                ${item}
            </li>
        `)}
    </ol>
`
```

**Result:**
```html
<ol>
    <li class="item-0"><span class="number">1.</span>First</li>
    <li class="item-1"><span class="number">2.</span>Second</li>
    <li class="item-2"><span class="number">3.</span>Third</li>
</ol>
```

---

### 7. Component Composition

### 7. Component Composition

```javascript
// Reusable components as functions
const renderButton = (text, icon) => () => UI.create`
    <button>
        <ui-icon data-src="${icon}"></ui-icon>
        ${text}
    </button>
`

const renderCard = (title, content) => ({ index }) => UI.create`
    <div class="card" data-index="${index}">
        <h3>${title}</h3>
        <p>${content}</p>
        ${renderButton("Read More", "arrow-right")}
    </div>
`

// Usage
const cards = [
    { title: "Title 1", content: "Content 1" },
    { title: "Title 2", content: "Content 2" }
]

const template = UI.create`
    <div class="cards">
        ${cards.map(card => renderCard(card.title, card.content))}
    </div>
`
```

**Benefit:** Composable, reusable template functions with context awareness.

---

### 8. DOM Manipulation on Render

```javascript
const createItem = (data) => () => UI.create`
    <div class="item">
        <h4>${data.name}</h4>
        <span>${data.price}</span>
    </div>
`

const items = [
    { name: "Product 1", price: "$10" },
    { name: "Product 2", price: "$20" }
]

const template = UI.create`
    <div class="items">
        ${items.map(item => createItem(item))}
    </div>
`
```

**Benefit:** Closure over data, lazy evaluation.

---

### 6. Async Data Loading (Advanced)

```javascript
// Function can handle promises
const fetchUserData = async () => {
    const response = await fetch('/api/user')
    const user = await response.json()
    return UI.create`
        <div class="user">
            <h3>${user.name}</h3>
            <p>${user.email}</p>
        </div>
    `
}

// Note: render() is sync, so need wrapper
const template = UI.create`
    <div>
        ${() => {
            // Show loading initially
            const loading = UI.create`<div>Loading...</div>`
            
            // Fetch and update
            fetchUserData().then(userTemplate => {
                UI.render(userTemplate, container.querySelector('.user-container'))
            })
            
            return loading
        }}
        <div class="user-container"></div>
    </div>
`
```

**Note:** For async, better to use separate render cycle or state management.

---

## Function Return Types

### Returns Primitive

```javascript
const getName = () => "John Doe"

UI.create`<div>Hello ${getName}</div>`
// → <div>Hello John Doe</div>
```

### Returns TemplateResult

```javascript
const getButton = () => UI.create`<button>Click</button>`

UI.create`<div>${getButton}</div>`
// → <div><button>Click</button></div>
```

### Returns Array

```javascript
const getItems = () => [1, 2, 3]

UI.create`<ul>${() => getItems().map(i => UI.create`<li>${i}</li>`)}</ul>`
// → <ul><li>1</li><li>2</li><li>3</li></ul>
```

### Returns DOM Node

```javascript
const createCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    return canvas
}

UI.create`<div>${createCanvas}</div>`
// → <div><canvas width="100" height="100"></canvas></div>
```

### Returns null/undefined

```javascript
const maybeRender = (condition) => () => {
    return condition ? UI.create`<span>Yes</span>` : null
}

UI.create`<div>${maybeRender(false)}</div>`
// → <div></div>
```

---

## Performance Considerations

### ✅ Good: Memoization

```javascript
let cachedValue = null

const getExpensiveValue = () => {
    if (cachedValue === null) {
        cachedValue = computeExpensive()
    }
    return cachedValue
}

UI.create`<div>${getExpensiveValue}</div>`
```

### ⚠️ Careful: Side Effects

```javascript
// ⚠️ Function runs on every render
let counter = 0
const incrementCounter = () => {
    counter++  // Side effect!
    return `Count: ${counter}`
}

UI.create`<div>${incrementCounter}</div>`
// Render twice → counter becomes 2
```

**Recommendation:** Keep functions pure when possible.

### ❌ Avoid: Complex Async Logic

```javascript
// ❌ Bad: Async in function
const loadData = async () => {
    const data = await fetch('/api/data')
    return data.json()
}

UI.create`<div>${loadData}</div>`  // Returns Promise, not rendered correctly
```

**Solution:** Handle async outside template, pass result as primitive or use state management.

---

## Real-World Examples

### Example 1: Dynamic Navigation

```javascript
const renderNav = (routes, currentPath) => () => {
    return UI.create`
        <nav>
            ${routes.map(route => UI.create`
                <a 
                    href="${route.path}"
                    class="${currentPath === route.path ? 'active' : ''}"
                >
                    ${route.label}
                </a>
            `)}
        </nav>
    `
}

// Usage
const routes = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' }
]

const template = UI.create`
    <header>
        ${renderNav(routes, window.location.pathname)}
    </header>
`
```

### Example 2: Conditional Sections

```javascript
const renderUserSection = (user) => () => {
    if (!user) {
        return UI.create`
            <div class="login-prompt">
                <button>Login</button>
            </div>
        `
    }
    
    return UI.create`
        <div class="user-info">
            <img src="${user.avatar}">
            <span>${user.name}</span>
            <button>Logout</button>
        </div>
    `
}

// Usage
const template = UI.create`
    <header>
        ${renderUserSection(currentUser)}
    </header>
`
```

### Example 3: List with Dynamic Items

```javascript
const renderProductCard = (product) => () => UI.create`
    <div class="product-card">
        <img src="${product.image}">
        <h3>${product.name}</h3>
        <p>${product.price}</p>
        ${() => product.inStock 
            ? UI.create`<button>Add to Cart</button>`
            : UI.create`<span class="out-of-stock">Out of Stock</span>`
        }
    </div>
`

const renderProducts = (products) => () => UI.create`
    <div class="products">
        ${products.map(renderProductCard)}
    </div>
`

// Usage
const template = UI.create`
    <section>
        <h2>Products</h2>
        ${renderProducts(productList)}
    </section>
`
```

---

## Best Practices

### ✅ DO: Use for dynamic content

```javascript
const getGreeting = () => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Good Morning' : 'Good Evening'
}

UI.create`<h1>${getGreeting}</h1>`
```

### ✅ DO: Use for composition

```javascript
const renderIcon = (name) => () => UI.create`<ui-icon data-src="${name}"></ui-icon>`
const renderButton = (text, icon) => () => UI.create`
    <button>
        ${renderIcon(icon)}
        ${text}
    </button>
`
```

### ✅ DO: Use for conditional rendering

```javascript
const showWarning = (hasError) => () => 
    hasError ? UI.create`<div class="error">Error!</div>` : null

UI.create`<div>${showWarning(errorState)}</div>`
```

### ❌ DON'T: Use for simple static values

```javascript
// ❌ Unnecessary
const getName = () => "John"
UI.create`<div>${getName}</div>`

// ✅ Better
const name = "John"
UI.create`<div>${name}</div>`
```

### ❌ DON'T: Put heavy computation directly

```javascript
// ❌ Bad
UI.create`<div>${() => hugeArray.map(...).filter(...).reduce(...)}</div>`

// ✅ Better: Compute outside
const result = hugeArray.map(...).filter(...).reduce(...)
UI.create`<div>${result}</div>`

// Or cache
let cached = null
const getResult = () => cached || (cached = compute())
UI.create`<div>${getResult}</div>`
```

---

## Summary

**Functions as template values enable:**
- 🚀 Lazy evaluation
- 🔄 Dynamic computation
- 🧩 Component composition
- 🎯 Conditional rendering
- 📦 Encapsulation

**Remember:**
- Functions are called during `render()`
- Return value is processed based on type
- Keep functions pure when possible
- Use for dynamic content, not static values
- Great for composition patterns

**Trade-offs:**
- ✅ Flexibility and power
- ✅ Lazy evaluation benefits
- ⚠️ Slightly more complex
- ⚠️ Need to understand execution timing
