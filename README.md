# Shop 🛍️

A modern **serverless eCommerce engine** built with pure Web Components. Framework-free, fully static, and ready for the decentralized web.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Web Components](https://img.shields.io/badge/Web-Components-29ABE2.svg)](https://www.webcomponents.org/)
[![No Framework](https://img.shields.io/badge/Framework-None-green.svg)](docs/thoughts/the-philosophy-of-framework-less.md)

## ✨ Features

- 🌍 **19 Languages** - Full internationalization with static routes per locale for optimal SEO
- 💱 **30+ Currencies** - Multi-currency support with real-time switching
- 🚀 **Serverless** - Pure static files deployable anywhere (Netlify, Vercel, GitHub Pages, S3)
- 🧩 **Web Components** - Native browser APIs, no framework dependencies
- 🔐 **Passwordless Auth** - WebAuthn passkeys (Face ID, Touch ID, Windows Hello)
- �� **Decentralized** - Optional GunDB integration for peer-to-peer data sync
- ⚡ **Fast** - Pre-rendered routes, hash-based caching, offline-first capabilities
- 🎨 **Themeable** - Built-in light/dark mode with CSS custom properties
- 📱 **PWA Ready** - Progressive Web App with service worker support
- 🏪 **Multi-tenant** - Different sites per domain with shared infrastructure

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for build tools only)
- No runtime dependencies

### Installation

```bash
# Clone the repository
git clone https://github.com/akaoio/shop.git
cd shop

# Install dev dependencies
npm install

# Build and start dev server
npm start
```

The dev server will open at `http://localhost:8080` with hot reload enabled.

### Development Workflow

```bash
# Full build (YAML → JSON, routes, hashes)
npm run build

# Start dev server with file watching
npm start

# Format code
npm run format
```

## 📁 Project Structure

```
shop/
├── src/                      # Source files
│   ├── core/                 # Core systems
│   │   ├── UI/              # Template engine (html, render, css)
│   │   ├── States.js        # Reactive state management
│   │   ├── Router.js        # Pattern-based routing
│   │   ├── Access.js        # Authentication system
│   │   ├── DB.js            # Static file loader with caching
│   │   ├── IDB.js           # IndexedDB wrapper
│   │   ├── GDB.js           # GunDB integration
│   │   └── Build/           # Build system utilities
│   ├── UI/                   # User interface
│   │   ├── components/      # 23 reusable web components
│   │   ├── layouts/         # Page layouts
│   │   ├── routes/          # Route handlers
│   │   └── css/             # Global styles
│   └── statics/              # Static data and content
│       ├── i18n/            # 180+ translation files
│       ├── items/           # Product data (YAML)
│       ├── sites/           # Multi-tenant configs
│       ├── locales.yaml     # Language definitions
│       ├── fiats.yaml       # Currency definitions
│       └── themes.yaml      # Theme configurations
├── build/                    # Generated output (gitignored)
├── build.js                  # Build script
├── server.js                 # Dev server with hot reload
└── docs/                     # Documentation and thoughts
```

## 🏗️ Architecture

### Core Philosophy

This project embraces **framework-less development**, leveraging native web standards:

- **Web Components API** - Custom elements with Shadow DOM
- **ES Modules** - Native JavaScript modules
- **Template Literals** - Zero-overhead templating
- **Web Standards** - No proprietary abstractions

See [the-philosophy-of-framework-less.md](docs/thoughts/the-philosophy-of-framework-less.md) for detailed rationale.

### UI System

The custom template engine provides React/Vue-like DX without the overhead:

```javascript
import { html, render } from "/core/UI.js"

// Define template
const template = html`
    <div class="card">
        <h2>\${title}</h2>
        <p>\${description}</p>
        \${items.map(item => html`
            <span>\${item}</span>
        `)}
    </div>
`

// Render to DOM
render(template, container)
```

**Key Features:**
- Nested templates and arrays
- Attribute event handlers
- Automatic primitive value embedding (performance optimization)
- No Virtual DOM, no diffing - direct DOM manipulation

### State Management

Reactive state with ES6 Proxy:

```javascript
import { Context } from "/core/Context.js"

// Subscribe to changes
Context.on("theme", ({ value }) => {
    console.log("Theme changed:", value)
})

// Update state (triggers subscribers)
Context.set({ theme: "dark" })

// Direct property binding
Context.on("locale", [element, "textContent"])
```

### Routing

Pattern-based router with dynamic segments:

```javascript
// Route definition
export class ItemRoute extends HTMLElement {
    // File: /src/UI/routes/item/[slug]/index.js
    // Pattern: /item/[slug]
}

// Router automatically matches:
// /en/item/organic-green-tea → { locale: "en", slug: "organic-green-tea" }
```

## 🌐 Internationalization

### Build-Time i18n

Static routes generated for each locale:

```
build/
├── en/
│   ├── index.html
│   ├── item/organic-green-tea/index.html
│   └── ...
├── fr/
│   ├── index.html
│   ├── item/organic-green-tea/index.html
│   └── ...
└── ... (19 locales total)
```

**Benefits:**
- Perfect SEO (separate URLs per language)
- No JavaScript required for initial render
- Fast page loads (pre-rendered HTML)

### Translation Files

Each UI string has its own YAML file:

```yaml
# src/statics/i18n/home.yaml
en: Home
fr: Accueil
es: Inicio
de: Startseite
...
```

Build process aggregates into:

```javascript
// build/statics/locales/en.json
{
  "home": "Home",
  "cart": "Cart",
  ...
}
```

## 🛠️ Build System

The build process is a pure Node.js script (`build.js`) that:

1. **Converts YAML → JSON** - All configs and content
2. **Generates Routes** - Creates static HTML for all locale/item/tag combinations
3. **Processes i18n** - Aggregates translations by locale
4. **Paginates Data** - Items and tags (10 per page by default)
5. **Generates Hashes** - SHA-256 integrity hashes for all JSON files
6. **Copies Assets** - Core code, UI components, icons

**Output:** ~200+ pre-rendered HTML files for full SEO coverage.

## 🧩 Components

### Available Components

**Navigation & Layout:**
- `<ui-header>`, `<ui-footer>`, `<ui-navigator>` - Layout structure
- `<ui-a>` - Custom anchor with router integration

**UI Controls:**
- `<ui-button>`, `<ui-select>`, `<ui-modal>`, `<ui-icon>` - Form elements
- `<ui-context>` - Dynamic text from Context state
- `<ui-loading>` - Loading overlay

**Localization:**
- `<ui-locales>` - Language switcher
- `<ui-fiats>` - Currency switcher
- `<ui-themes>` - Theme toggle (light/dark)

**Authentication:**
- `<ui-user>` - User profile display
- `<ui-access>` - Authentication modal
- `<ui-logout>` - Logout button
- `<ui-wallets>` - Wallet management

**eCommerce:**
- `<ui-item>` - Product card
- `<ui-items>` - Product grid with pagination
- `<ui-cart>` - Shopping cart

### Creating a Component

```javascript
// src/UI/components/my-component/index.js
import template from "./template.js"
import { render } from "/core/UI.js"
import States from "/core/States.js"

export class MyComponent extends HTMLElement {
    constructor() {
        super()
        this.states = new States({ count: 0 })
        this.attachShadow({ mode: "open" })
        render(template, this.shadowRoot)
        this.subscriptions = []
    }

    connectedCallback() {
        this.subscriptions.push(
            this.states.on("count", this.render.bind(this))
        )
    }

    disconnectedCallback() {
        this.subscriptions.forEach(off => off())
    }

    render() {
        // Update DOM based on state
    }
}

customElements.define("ui-my-component", MyComponent)
```

## 🔐 Authentication

WebAuthn-based passwordless authentication:

```javascript
import { Access } from "/core/Access.js"

// Check authentication
if (Access.get("authenticated")) {
    console.log("User is signed in")
}

// Subscribe to changes
Access.on("authenticated", ({ value }) => {
    console.log("Auth state:", value)
})
```

**Features:**
- Platform authenticators (biometrics, security keys)
- SEA key pair generation from credential hash
- Encrypted public key storage in GunDB
- No passwords to manage

## 🗄️ Data Storage

Three storage layers:

1. **IDB (IndexedDB)** - Client-side persistent storage
2. **GDB (GunDB)** - Decentralized graph database (optional)
3. **DB (Static Files)** - Hash-verified JSON files with caching

```javascript
import { DB } from "/core/DB.js"

// Load data with hash verification
const item = await DB.get(["items", "organic-green-tea", "meta.json"])

// Automatically cached in IndexedDB
// Falls back to network on cache miss
```

## 🎨 Theming

CSS custom properties with automatic theme switching:

```css
:host {
    color: var(--text-primary);
    background: var(--bg-primary);
}
```

Themes defined in `src/statics/themes.yaml`:

```yaml
light:
  --text-primary: "#000000"
  --bg-primary: "#ffffff"
  ...

dark:
  --text-primary: "#ffffff"
  --bg-primary: "#000000"
  ...
```

## 🚢 Deployment

### Static Hosting

Deploy `build/` directory to any static host:

```bash
# Build production files
npm run build

# Deploy to Netlify
netlify deploy --dir=build --prod

# Deploy to Vercel
vercel --prod

# Deploy to GitHub Pages
# (configure GitHub Actions or manual push to gh-pages branch)
```

### Configuration

Edit `src/statics/sites/your-site.yaml`:

```yaml
name: mystore
brand:
  text: /images/branding.svg
  symbol: /images/logo.svg
favicon: /images/icon.svg
locale: en
fiat: USD
peers: []  # GunDB peers for decentralized sync
```

Map domain in `src/statics/domains.yaml`:

```yaml
mystore.com: mystore
```

## 📚 Documentation

- [The Philosophy of Framework-less](docs/thoughts/the-philosophy-of-framework-less.md) - Why no framework?
- [Web Components Compatibility](docs/thoughts/web-components-compatibility.md) - Browser support
- [New UI Template Architecture](docs/thoughts/new-UI-html-template-architecture.md) - Template system design
- [Performance Optimization](docs/thoughts/performance-optimization.md) - Speed improvements
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code of conduct
- Development setup
- Code style guidelines
- Submission process
- Component creation guide

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built with native Web Standards
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/)
- Inspired by the principles of framework-less development

## 💬 Community

- **Issues:** [GitHub Issues](https://github.com/akaoio/shop/issues)
- **Discussions:** [GitHub Discussions](https://github.com/akaoio/shop/discussions)

---

**Built with ❤️ using pure Web Components**
