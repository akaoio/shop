import { write, load, copy, dir } from "./src/core/Utils/files.js"
import { color, icons } from "./src/core/Colors.js"

console.log(`${icons.start} ${color.header("Starting build process...")}`)

// ============ Load Data Once ============
console.log(`${icons.sync} ${color.info("Loading configuration and data...")}`)

const srcPaths = {
    index: ["src", "index.html"],
    statics: ["src", "statics"],
    i18n: ["src", "statics", "i18n"],
    items: ["src", "items"],
    sites: ["src", "sites"],
    core: ["src", "core"],
    UI: ["src", "UI"],
    importmap: ["importmap.json"]
}

const destPaths = {
    build: ["build"],
    statics: ["build", "statics"],
    locales: ["build", "statics", "locales"],
    core: ["build", "core"],
    UI: ["build", "UI"]
}

// Load locales configuration
const localesConfig = await load([...srcPaths.statics, "locales.yaml"])
const locales = localesConfig.map(locale => locale.code)

// Load static files
const staticFiles = await dir(srcPaths.statics)
const dataFiles = staticFiles.filter(file => file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml'))

// Load i18n data
const i18nDir = await dir(srcPaths.i18n)
const i18nFiles = i18nDir.filter(file => file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml'))

// Load items and their metadata
const itemDirs = await dir(srcPaths.items)
const allTags = new Set()

// Filter directories by checking if they have a meta.yaml file
const items = []
for (const name of itemDirs) {
    const meta = await load([...srcPaths.items, name, 'meta.yaml'])
    if (meta) {
        items.push(name)
        if (meta?.tags) {
            meta.tags.forEach(tag => allTags.add(tag))
        }
    }
}

console.log(`${icons.done} ${color.ok(`Loaded: ${locales.length} locales, ${items.length} items, ${allTags.size} unique tags`)}`)

// ============ Copy Static Files ============
console.log(`${icons.sync} ${color.info("Copying static files...")}`)

for (const file of dataFiles) {
    await copy([...srcPaths.statics, file], [...destPaths.statics, file])
}

// Copy items folder
await copy(srcPaths.items, [...destPaths.statics, "items"])

// Copy sites folder
await copy(srcPaths.sites, [...destPaths.statics, "sites"])

// Copy core folder
await copy(srcPaths.core, destPaths.core)

// Copy UI folder
await copy(srcPaths.UI, destPaths.UI)

// Copy importmap.json
await copy(srcPaths.importmap, [...destPaths.build, "importmap.json"])

console.log(`${icons.done} ${color.ok(`Copied ${dataFiles.length} static files to /build/statics/`)}`)
console.log(`${icons.done} ${color.ok(`Copied items folder to /build/statics/items/`)}`)
console.log(`${icons.done} ${color.ok(`Copied sites folder to /build/statics/sites/`)}`)
console.log(`${icons.done} ${color.ok(`Copied core folder to /build/core/`)}`)
console.log(`${icons.done} ${color.ok(`Copied UI folder to /build/UI/`)}`)
console.log(`${icons.done} ${color.ok(`Copied importmap.json to /build/`)}`)

// ============ Process i18n and Generate Locale Files ============
console.log(`${icons.sync} ${color.info("Processing i18n files...")}`)

const localeData = {}
locales.forEach(locale => {
    localeData[locale] = {}
})

// Load all i18n translations
for (const file of i18nFiles) {
    const keyName = file.replace(/\.(json|yaml|yml)$/, '')
    const translations = await load([...srcPaths.i18n, file])

    for (const locale of locales) {
        if (translations?.[locale]) {
            localeData[locale][keyName] = translations[locale]
        }
    }
}

// Write locale files
for (const locale of locales) {
    const sortedData = Object.keys(localeData[locale])
        .sort()
        .reduce((obj, key) => {
            obj[key] = localeData[locale][key]
            return obj
        }, {})

    await write([...destPaths.locales, `${locale}.json`], sortedData)
}

console.log(`${icons.done} ${color.ok(`Created ${locales.length} locale files`)}`)

// ============ Generate Routes ============
console.log(`${icons.sync} ${color.info("Generating routes...")}`)

// Root index.html
await copy(srcPaths.index, [...destPaths.build, "index.html"])
let routeCount = 1

// For each locale, create locale root and routes
for (const locale of locales) {
    // Locale root: /build/{locale}/index.html
    await copy(srcPaths.index, [...destPaths.build, locale, "index.html"])
    routeCount++

    // Item directory root: /build/{locale}/item/index.html
    await copy(srcPaths.index, [...destPaths.build, locale, "item", "index.html"])
    routeCount++

    // Item routes: /build/{locale}/item/{item}/index.html
    for (const item of items) {
        await copy(srcPaths.index, [...destPaths.build, locale, "item", item, "index.html"])
        routeCount++
    }

    // Tag directory root: /build/{locale}/tag/index.html
    await copy(srcPaths.index, [...destPaths.build, locale, "tag", "index.html"])
    routeCount++

    // Tag routes: /build/{locale}/tag/{tag}/index.html
    for (const tag of allTags) {
        await copy(srcPaths.index, [...destPaths.build, locale, "tag", tag, "index.html"])
        routeCount++
    }
}

console.log(`${icons.done} ${color.ok(`Created ${routeCount} route index.html files`)}`)

// ============ Summary ============
console.log(`\n${color.header("========================================")}`);
console.log(`${icons.done} ${color.ok("Locales")}: ${locales.length}`)
console.log(`${icons.done} ${color.ok("Items")}: ${items.length}`)
console.log(`${icons.done} ${color.ok("Unique Tags")}: ${allTags.size}`)
console.log(`${icons.done} ${color.ok("Static Files")}: ${dataFiles.length}`)
console.log(`${icons.done} ${color.ok("I18n Files")}: ${i18nFiles.length}`)
console.log(`${icons.done} ${color.ok("Routes Created")}: ${routeCount}`)
console.log(`  ${color.secondary("- Root")}: 1`)
console.log(`  ${color.secondary("- Locale roots")}: ${locales.length}`)
console.log(`  ${color.secondary("- Item directory roots")}: ${locales.length}`)
console.log(`  ${color.secondary("- Item routes")}: ${locales.length * items.length}`)
console.log(`  ${color.secondary("- Tag directory roots")}: ${locales.length}`)
console.log(`  ${color.secondary("- Tag routes")}: ${locales.length * allTags.size}`)
console.log(`${color.header("========================================")}`);
console.log(`${icons.done} ${color.header("Build completed successfully!")}`)
