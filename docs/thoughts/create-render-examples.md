# UI.create() & UI.render() - Chi tiết Logic và Ví dụ

## Tổng quan

Hệ thống mới gồm 2 hàm chính:
- **`UI.create()`** - Tạo template object (không tạo DOM)
- **`UI.render()`** - Render template object thành DOM và mount vào container

## Flow hoạt động

```
UI.create`...`  →  TemplateResult Object  →  UI.render()  →  DOM in container
```

---

## UI.create() - Chi tiết

### Performance Optimization ⚡

**Key insight**: Primitive values (string, number, boolean) không cần markers!

```javascript
// ❌ KHÔNG tối ưu: Tạo marker cho mọi value
UI.create`<div>Hello ${name}</div>`
→ "<div>Hello <!--__mark:0--></div>"  // Phải dùng TreeWalker sau

// ✅ TỐI ƯU: Nhúng primitives trực tiếp
UI.create`<div>Hello ${name}</div>`
→ "<div>Hello World</div>"  // Không cần TreeWalker!
```

**Chỉ dùng markers khi thực sự cần:**
- Nested TemplateResult
- Arrays (có thể chứa nested templates)
- DOM nodes

### Input
```javascript
const name = "World"  // primitive
const template = UI.create`<div>Hello ${name}</div>`
```

### Process
1. **Strings Array**: `["<div>Hello ", "</div>"]`
2. **Values Array**: `["World"]`
3. **Check value type**: `"World"` là primitive → nhúng trực tiếp
4. **Generate HTML**: `"<div>Hello World</div>"` (NO marker!)

### Output
```javascript
{
    strings: ["<div>Hello ", "</div>"],
    values: [],  // Empty! Primitive đã nhúng vào html
    html: "<div>Hello World</div>",  // No markers needed
    _isTemplateResult: true
}
```

### Comparison: Simple vs Complex Values

```javascript
// Simple: Primitives → embed directly
UI.create`<div>${"text"} ${123} ${true}</div>`
→ {
    html: "<div>text 123 true</div>",
    values: []  // Empty!
}

// Complex: Nested/Arrays → use markers
const nested = UI.create`<span>A</span>`
UI.create`<div>${nested}</div>`
→ {
    html: "<div><!--__mark:0--></div>",
    values: [nested]  // Only store complex value
}
```

---

## Ví dụ 1: Simple Template (Primitives Only)

### Code
```javascript
const name = "John"
const age = 25
const template = UI.create`<div>Hello ${name}, you are ${age} years old!</div>`

UI.render(template, document.body)
```

### Step-by-step

#### Step 1: UI.create() xử lý
```javascript
// Input
strings = ["<div>Hello ", ", you are ", " years old!</div>"]
values = ["John", 25]

// Check each value
needsMarker("John") → false (primitive string)
needsMarker(25) → false (primitive number)

// Generate HTML - nhúng trực tiếp, NO markers!
html = "<div>Hello John, you are 25 years old!</div>"

// Return
{
    strings: [...],
    values: [],  // EMPTY! Không lưu primitives
    html: "<div>Hello John, you are 25 years old!</div>",
    _isTemplateResult: true
}
```

#### Step 2: UI.render() xử lý
```javascript
// 1. Create DocumentFragment
<template>
    <div>Hello John, you are 25 years old!</div>
</template>

// 2. TreeWalker tìm markers
Found: NOTHING! (No markers to process)

// 3. Skip marker processing completely
// → Very fast! 🚀

// 4. Result DOM (already correct)
<div>Hello John, you are 25 years old!</div>

// 5. Append vào container
```

**Performance**: Không cần TreeWalker, không cần replace nodes → Rất nhanh!

---

## Ví dụ 2: Nested Template (Requires Markers)

### Code
```javascript
const inner = UI.create`<span class="highlight">World</span>`
const outer = UI.create`<div>Hello ${inner}!</div>`

UI.render(outer, container)
```

### Step-by-step

#### Step 1: UI.create() cho `inner`
```javascript
// All primitives → no markers
{
    strings: ['<span class="highlight">', '</span>'],
    values: [],  // "World" embedded directly
    html: '<span class="highlight">World</span>',
    _isTemplateResult: true
}
```

#### Step 2: UI.create() cho `outer`
```javascript
// Check value type
needsMarker(innerTemplateResult) → TRUE! (nested template)

// Use marker for complex value
{
    strings: ["<div>Hello ", "!</div>"],
    values: [innerTemplateResult],  // Store complex value
    html: "<div>Hello <!--__mark:0-->!</div>",
    _isTemplateResult: true
}
```

#### Step 3: UI.render() xử lý `outer`
```javascript
// 1. Create fragment from outer.html
<div>Hello <!--__mark:0-->!</div>

// 2. TreeWalker tìm marker
Found: <!--__mark:0-->

// 3. Check value type
values[0]._isTemplateResult === true
→ Đây là nested template!

// 4. Render nested template vào temp container
temp = document.createElement("div")
renderTemplateResult(innerTemplateResult, temp)

// temp bây giờ chứa:
<span class="highlight">World</span>

// 5. Insert children của temp vào vị trí marker
parent.insertBefore(temp.firstChild, markerNode)
parent.removeChild(markerNode)

// 6. Final DOM
<div>Hello <span class="highlight">World</span>!</div>
```

**Performance**: Chỉ 1 marker (cho nested template), không có markers cho primitive "World"

---

## Ví dụ 3: Array Mapping (Mixed Primitives & Nested)

### Code
```javascript
const items = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" }
]

const template = UI.create`
    <ul>
        ${items.map(item => UI.create`
            <li data-id="${item.id}">${item.name}</li>
        `)}
    </ul>
`

UI.render(template, container)
```

### Step-by-step

#### Step 1: items.map() tạo array of TemplateResults
```javascript
// Mỗi item template có primitives embedded
[
    TemplateResult { 
        html: '<li data-id="1">Apple</li>',  // Primitives embedded!
        values: []  // No markers needed
    },
    TemplateResult { 
        html: '<li data-id="2">Banana</li>',
        values: []
    },
    TemplateResult { 
        html: '<li data-id="3">Cherry</li>',
        values: []
    }
]
```

#### Step 2: UI.create() cho outer template
```javascript
// Check value type
const mappedArray = [... 3 TemplateResults]
needsMarker(mappedArray) → TRUE! (array of templates)

{
    strings: ["\n    <ul>\n        ", "\n    </ul>\n"],
    values: [[...3 TemplateResults]], // Store array
    html: "<ul><!--__mark:0--></ul>",
    _isTemplateResult: true
}
```

#### Step 3: UI.render() xử lý
```javascript
// 1. Create fragment
<ul><!--__mark:0--></ul>

// 2. TreeWalker tìm marker
Found: <!--__mark:0-->

// 3. Check value type
Array.isArray(values[0]) === true

// 4. Loop qua array
forEach item in values[0]:
    if item._isTemplateResult:
        // Render từng template
        // Mỗi template ĐÃ có primitives embedded → Very fast!
        render item vào temp
        insert temp.children vào vị trí marker

// 5. Final DOM
<ul>
    <li data-id="1">Apple</li>
    <li data-id="2">Banana</li>
    <li data-id="3">Cherry</li>
</ul>
```

**Performance**: 
- Outer: 1 marker (cho array)
- Inner: 0 markers mỗi item (primitives embedded)
- Total: 1 marker thay vì 7 markers (1 outer + 2×3 inner)

---

## Ví dụ 4: Function Values

### Code
```javascript
const getGreeting = () => "Hello World"
const getTime = () => new Date().toLocaleTimeString()

const template = UI.create`
    <div>
        <h1>${getGreeting}</h1>
        <p>Current time: ${getTime}</p>
    </div>
`

UI.render(template, container)
```

### With Context Parameters

Functions receive context when called:
```javascript
const items = ['A', 'B', 'C']

const template = UI.create`
    <ul>
        ${items.map(item => ({ index, parent }) => UI.create`
            <li class="item-${index}">
                Item #${index + 1}: ${item}
            </li>
        `)}
    </ul>
`
```

Context object:
```javascript
{
    node: Comment,       // Marker comment node
    parent: Element,     // Parent element
    index: number,       // Marker index in values array
    container: Element,  // Root container
    fragment: DocumentFragment
}
```

### Step-by-step

#### Step 1: UI.create() xử lý
```javascript
// Check value types
needsMarker(getGreeting) → TRUE! (function)
needsMarker(getTime) → TRUE! (function)

// Use markers for functions
{
    strings: [...],
    values: [getGreeting, getTime],  // Store function references
    html: "<div><h1><!--__mark:0--></h1><p>Current time: <!--__mark:1--></p></div>",
    _isTemplateResult: true
}
```

#### Step 2: UI.render() xử lý
```javascript
// 1. Find markers
Found: <!--__mark:0--> and <!--__mark:1-->

// 2. Process each marker
forEach marker:
    value = values[index]
    
    // Check if function
    if (typeof value === 'function') {
        value = value()  // CALL the function!
    }
    
    // Now process the return value
    // getGreeting() → "Hello World" (string)
    // getTime() → "10:30:45" (string)
    
    // Replace with text nodes
    parent.replaceChild(textNode("Hello World"), marker0)
    parent.replaceChild(textNode("10:30:45"), marker1)

// 3. Final DOM
<div>
    <h1>Hello World</h1>
    <p>Current time: 10:30:45</p>
</div>
```

**Use cases:**
- Lazy evaluation
- Dynamic computed values
- Callbacks that return templates

---

## Ví dụ 5: Function Returning Nested Templates

### Code
```javascript
const renderButton = () => UI.create`<button>Click Me</button>`
const renderList = () => {
    const items = ["A", "B", "C"]
    return UI.create`
        <ul>
            ${items.map(item => UI.create`<li>${item}</li>`)}
        </ul>
    `
}

const template = UI.create`
    <div>
        ${renderButton}
        ${renderList}
    </div>
`

UI.render(template, container)
```

### Step-by-step

#### Step 1: UI.create() cho outer template
```javascript
// Functions need markers
{
    strings: ["<div>", "", "</div>"],
    values: [renderButton, renderList],  // Function references
    html: "<div><!--__mark:0--><!--__mark:1--></div>",
    _isTemplateResult: true
}
```

#### Step 2: UI.render() xử lý
```javascript
// Process marker 0
value = renderButton
if (typeof value === 'function') {
    value = renderButton()  // Returns TemplateResult!
}
// Now value._isTemplateResult === true
// → Render as nested template

// Process marker 1
value = renderList
if (typeof value === 'function') {
    value = renderList()  // Returns TemplateResult with array!
}
// → Render as nested template

// Final DOM
<div>
    <button>Click Me</button>
    <ul>
        <li>A</li>
        <li>B</li>
        <li>C</li>
    </ul>
</div>
```

**Benefits:**
- Lazy evaluation (function only called when rendering)
- Encapsulation (logic inside function)
- Composability (functions return templates)

---

## Ví dụ 6: Complex Nested Structure

### Code
```javascript
const user = {
    name: "Alice",
    hobbies: ["Reading", "Gaming", "Cooking"]
}

const template = UI.create`
    <div class="user-card">
        <h2>${user.name}</h2>
        <div class="hobbies">
            <h3>Hobbies:</h3>
            <ul>
                ${user.hobbies.map(hobby => UI.create`
                    <li>
                        ${UI.create`<span class="icon">🎯</span>`}
                        ${hobby}
                    </li>
                `)}
            </ul>
        </div>
    </div>
`

UI.render(template, container)
```

### Final DOM
```html
<div class="user-card">
    <h2>Alice</h2>
    <div class="hobbies">
        <h3>Hobbies:</h3>
        <ul>
            <li>
                <span class="icon">🎯</span>
                Reading
            </li>
            <li>
                <span class="icon">🎯</span>
                Gaming
            </li>
            <li>
                <span class="icon">🎯</span>
                Cooking
            </li>
        </ul>
    </div>
</div>
```

---

## So sánh với html() cũ

### html() cũ (hiện tại)
```javascript
const template = html`<div>${value}</div>`
// ↓ Trực tiếp trả về DocumentFragment
// ↓ Không thể nested vì value đã được convert thành string

// Limitation: Không thể làm:
html`<div>${html`<span>nested</span>`}</div>`
// Vì html() inner trả về DocumentFragment,
// nhưng reduce() trong html() chỉ xử lý string
```

### UI.create() + UI.render() mới
```javascript
const template = UI.create`<div>${value}</div>`
// ↓ Trả về TemplateResult object
// ↓ render() xử lý sau, có thể detect nested templates

// ✅ Có thể làm:
UI.create`<div>${UI.create`<span>nested</span>`}</div>`
// Vì UI.create() trả về object có flag _isTemplateResult,
// render() có thể detect và xử lý đệ quy
```

---

## Key Differences

| Aspect | html() cũ | UI.create() + UI.render() mới |
|--------|-----------|-------------------------------|
| Return type | DocumentFragment | TemplateResult object |
| Processing | Eager (tạo DOM ngay) | Lazy (tạo DOM khi render) |
| Nested support | ❌ Không | ✅ Có |
| Array mapping | Limited | ✅ Full support |
| Dynamic updates | ❌ Không | ✅ Có thể extend (Phase 4) |

---

## Benefits của Architecture mới

1. **Nested templates**: Có thể compose templates
2. **Lazy rendering**: Chỉ tạo DOM khi cần
3. **Better array handling**: render() xử lý arrays một cách thông minh
4. **Extensible**: Có thể thêm reactivity sau (Phase 4)
5. **Type-safe**: Có thể detect TemplateResult vs primitive values
6. **🚀 Performance optimized**: 
   - Primitives embedded directly → No TreeWalker overhead
   - Only use markers for complex values
   - Reduced memory usage (không lưu primitives trong values array)
   - Faster rendering (ít markers cần xử lý hơn)

---

## Performance Comparison

### Old html() approach
```javascript
// Mọi thứ đều tạo DOM ngay
html`<div>Hello ${name}, age ${age}</div>`
→ Parse & create DocumentFragment immediately
→ No optimization possible
```

### Previous create() design (markers cho mọi value)
```javascript
// ❌ Inefficient: Tạo marker cho mọi value
UI.create`<div>Hello ${name}, age ${age}</div>`
→ {
    html: "<div>Hello <!--__mark:0-->, age <!--__mark:1--></div>",
    values: ["John", 25]
}
→ TreeWalker phải tìm 2 markers
→ Replace 2 text nodes
→ Memory overhead cho 2 primitive values
```

### Current optimized design ✅
```javascript
// ✅ Efficient: Chỉ marker cho complex values
UI.create`<div>Hello ${name}, age ${age}</div>`
→ {
    html: "<div>Hello John, age 25</div>",
    values: []  // Empty!
}
→ No TreeWalker needed
→ No node replacement
→ No memory overhead
→ 🚀 Much faster!
```

### Real-world example: Large list
```javascript
// 100 items, 2 primitives mỗi item
const items = Array.from({length: 100}, (_, i) => ({id: i, name: `Item ${i}`}))

// ❌ Old design: 200 markers (100 items × 2 values)
// ✅ New design: 1 marker (cho array), 0 markers cho primitives
//    → 200x less marker processing! 🚀
```

---

## Decision Logic: When to Use Markers?

### needsMarker() function
```javascript
function needsMarker(value) {
    // null/undefined → NO marker (empty string)
    if (value == null) return false
    
    // TemplateResult → YES marker (cần render đệ quy)
    if (value._isTemplateResult) return true
    
    // Array → YES marker (có thể chứa nested templates)
    if (Array.isArray(value)) return true
    
    // DOM node → YES marker (cần insert node)
    if (value.nodeType) return true
    
    // Function → YES marker (sẽ được gọi khi render)
    if (typeof value === 'function') return true
    
    // Primitive (string/number/boolean) → NO marker
    return false
}
```

### Why this logic?

#### Primitives: NO markers ❌
```javascript
// String, number, boolean có thể toString() an toàn
"text", 123, true
→ Embed directly: `<div>text 123 true</div>`
→ Fast! No processing needed
```

**Lý do:**
- Không cần xử lý đặc biệt
- `String(value)` luôn work
- Không có child nodes
- Không cần đệ quy

#### Nested TemplateResult: YES markers ✅
```javascript
const nested = UI.create`<span>A</span>`
→ Cannot toString() meaningfully
→ Need recursive rendering
→ Use marker: <!--__mark:0-->
```

**Lý do:**
- Phải render() đệ quy để tạo DOM
- Không thể convert thành string đơn giản
- Có thể chứa nested templates sâu hơn

#### Arrays: YES markers ✅
```javascript
[item1, item2, item3]
→ Could contain nested templates
→ Need special handling
→ Use marker: <!--__mark:0-->
```

**Lý do:**
- Array có thể chứa mixed content (primitives + templates)
- Cần loop và render từng item
- Mỗi item có thể cần xử lý khác nhau

#### DOM Nodes: YES markers ✅
```javascript
const node = document.createElement("div")
→ Cannot embed as string
→ Need insertBefore()
→ Use marker: <!--__mark:0-->
```

**Lý do:**
- Phải dùng DOM API để insert
- Không thể serialize thành string an toàn
- Có thể có event listeners attached

#### Functions: YES markers ✅
```javascript
const render = () => UI.create`<span>A</span>`
→ Cannot evaluate at create() time
→ Need to call during render()
→ Use marker: <!--__mark:0-->
```

**Lý do:**
- Lazy evaluation (chỉ gọi khi thực sự render)
- Function có thể return bất kỳ type nào (template/node/primitive)
- Cho phép dynamic computed values
- Enable composition patterns

### Edge Cases

```javascript
// null/undefined → empty string
UI.create`<div>${null} ${undefined}</div>`
→ "<div> </div>"  // NO markers

// false/0 → toString()
UI.create`<div>${false} ${0}</div>`
→ "<div>false 0</div>"  // NO markers

// Empty array → marker (có thể extend sau)
UI.create`<div>${[]}</div>`
→ "<div><!--__mark:0--></div>"  // Marker (vì array)
→ render() sẽ xử lý empty array → không insert gì

// Mixed array
UI.create`<div>${[1, UI.create`<span>A</span>`, "text"]}</div>`
→ "<div><!--__mark:0--></div>"  // 1 marker
→ render() xử lý từng item:
   - 1 → textNode("1")
   - template → render đệ quy
   - "text" → textNode("text")

// Function returning primitive
const getName = () => "John"
UI.create`<div>${getName}</div>`
→ "<div><!--__mark:0--></div>"  // Marker (vì function)
→ render() gọi getName() → "John" → textNode("John")

// Function returning template
const renderItem = () => UI.create`<span>Item</span>`
UI.create`<div>${renderItem}</div>`
→ "<div><!--__mark:0--></div>"  // Marker
→ render() gọi renderItem() → TemplateResult → render đệ quy

// Function returning array
const getItems = () => [1, 2, 3]
UI.create`<div>${getItems}</div>`
→ "<div><!--__mark:0--></div>"  // Marker
→ render() gọi getItems() → [1,2,3] → process as array
```

---

## Implementation Notes

### Markers Format
```javascript
<!--__mark:0-->
<!--__mark:1-->
<!--__mark:2-->
// etc.
```

**Tại sao dùng HTML comments?**
- Browser không render comments
- TreeWalker có thể tìm comments dễ dàng với NodeFilter.SHOW_COMMENT
- Không ảnh hưởng đến structure của DOM

### TreeWalker vs querySelectorAll
```javascript
// ❌ Không thể dùng querySelectorAll vì comments không phải elements
document.querySelectorAll("<!--__mark:0-->") // Không work

// ✅ Phải dùng TreeWalker
const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_COMMENT
)
```

### Performance Considerations

#### Memory Usage Comparison

| Scenario | Old Design (all markers) | New Design (selective markers) | Savings |
|----------|--------------------------|--------------------------------|---------|
| Simple text | `values: ["John"]`<br>1 marker | `values: []`<br>0 markers | 100% |
| 2 primitives | `values: ["John", 25]`<br>2 markers | `values: []`<br>0 markers | 100% |
| 1 nested | `values: [template]`<br>1 marker | `values: [template]`<br>1 marker | 0% |
| 100 list items<br>(2 primitives each) | `values: 200 items`<br>200 markers | `values: 1 array`<br>1 marker | 99.5% |

#### Processing Time Comparison

```javascript
// Benchmark: 1000 simple templates
const name = "John"
const age = 25

// Old design: All values use markers
for (let i = 0; i < 1000; i++) {
    UI.create`<div>Hello ${name}, age ${age}</div>`
    // → 2000 markers total
    // → TreeWalker traverse: 2000 times
    // → Node replacement: 2000 times
}
// ⏱️ Estimated: ~100ms

// New design: Primitives embedded
for (let i = 0; i < 1000; i++) {
    UI.create`<div>Hello ${name}, age ${age}</div>`
    // → 0 markers total
    // → TreeWalker traverse: 0 times
    // → Node replacement: 0 times
}
// ⏱️ Estimated: ~5ms
// 🚀 20x faster!
```

#### Real-world Impact

**E-commerce product list (100 products):**
```javascript
const products = [...100 items]

// Each product has: id, name, price, rating
// = 4 primitive values per item
// = 400 primitive values total

// Old design:
// - 400 markers to create
// - 400 TreeWalker lookups
// - 400 node replacements
// - Store 400 values in memory
// ⏱️ ~50-100ms rendering time

// New design:
// - 1 marker (for array)
// - 1 TreeWalker lookup
// - 100 nested templates (each with 0 markers)
// - Store 1 array in memory
// ⏱️ ~5-10ms rendering time
// 🚀 10x faster!
```

- TreeWalker rất nhanh (native browser API)
- Chỉ duyệt 1 lần qua DOM tree
- Markers được process theo thứ tự, đảm bảo correctness
- **Optimization**: Không duyệt nếu không có markers!

---

## Migration Path

### Before (html() cũ)
```javascript
import { html } from "/core/UI.js"

class MyComponent extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        
        const template = html`<div>Hello World</div>`
        this.shadowRoot.appendChild(template)
    }
}
```

### After (UI.create() + UI.render() mới)
```javascript
import UI from "/core/UI.js"

class MyComponent extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        
        const template = UI.create`<div>Hello World</div>`
        UI.render(template, this.shadowRoot)
    }
}
```

**Minimal changes needed!** ✨
