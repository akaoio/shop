import { write, load, copy, dir, hash, remove } from "./src/core/Utils/files.js"
import { color, icons } from "./src/core/Colors.js"

// ============ Configuration ============
const YAML_EXTENSIONS = ['.yaml', '.yml']
const isYamlFile = file => YAML_EXTENSIONS.some(ext => file.endsWith(ext))
const toJsonFilename = file => file.replace(/\.(yaml|yml)$/, '.json')

const paths = {
    src: {
        index: ["src", "index.html"],
        statics: ["src", "statics"],
        i18n: ["src", "statics", "i18n"],
        items: ["src", "statics", "items"],
        sites: ["src", "statics", "sites"],
        core: ["src", "core"],
        UI: ["src", "UI"],
        routes: ["src", "UI", "routes"],
        importmap: ["importmap.json"]
    },
    build: {
        root: ["build"],
        statics: ["build", "statics"],
        locales: ["build", "statics", "locales"],
        core: ["build", "core"],
        UI: ["build", "UI"]
    }
}

// ============ Helper Functions ============
const log = {
    start: msg => console.log(`${icons.start} ${color.header(msg)}`),
    info: msg => console.log(`${icons.sync} ${color.info(msg)}`),
    ok: msg => console.log(`${icons.done} ${color.ok(msg)}`),
    section: msg => console.log(`\n${color.header(msg)}`)
}

async function processYamlDirectory(srcPath, destPath, { recursive = false, filter = null } = {}) {
    const files = await dir(srcPath)
    const filtered = filter ? files.filter(filter) : files
    let processed = 0

    for (const file of filtered) {
        const fullSrcPath = [...srcPath, file]

        if (recursive) {
            const subFiles = await dir(fullSrcPath)
            for (const subFile of subFiles) {
                if (isYamlFile(subFile)) {
                    const data = await load([...fullSrcPath, subFile])
                    await write([...destPath, file, toJsonFilename(subFile)], data)
                    processed++
                } else {
                    await copy([...fullSrcPath, subFile], [...destPath, file, subFile])
                }
            }
        } else if (isYamlFile(file)) {
            const data = await load(fullSrcPath)
            await write([...destPath, toJsonFilename(file)], data)
            processed++
        }
    }

    return { total: filtered.length, processed }
}

async function copyAssets(assets) {
    for (const { src, dest, label } of assets) {
        await copy(src, dest)
        log.ok(`Copied ${label}`)
    }
}


async function generateRoutes(locales, items, tags, indexContent) {
    const routes = [
        { path: [...paths.build.root, "index.html"], label: "Root" }
    ]

    for (const locale of locales) {
        routes.push(
            { path: [...paths.build.root, locale, "index.html"], label: `/${locale}` },
            { path: [...paths.build.root, locale, "item", "index.html"], label: `/${locale}/item` }
        )

        for (const item of items) {
            routes.push({
                path: [...paths.build.root, locale, "item", item, "index.html"],
                label: `/${locale}/item/${item}`
            })
        }

        routes.push({
            path: [...paths.build.root, locale, "tag", "index.html"],
            label: `/${locale}/tag`
        })

        for (const tag of tags) {
            routes.push({
                path: [...paths.build.root, locale, "tag", tag, "index.html"],
                label: `/${locale}/tag/${tag}`
            })
        }
    }

    for (const route of routes) {
        await write(route.path, indexContent)
    }

    return routes.length
}

// ============ Main Build Process ============
log.start("Starting build process...")

// Clean
log.info("Cleaning build folder...")
await remove([paths.build.root])
log.ok("Cleaned build folder")

// Load configuration
log.info("Loading configuration and data...")
const localesConfig = await load([...paths.src.statics, "locales.yaml"])
const locales = localesConfig.map(locale => locale.code)

// Load items metadata
const itemDirs = await dir(paths.src.items)
const items = []
const allTags = new Set()

for (const name of itemDirs) {
    const meta = await load([...paths.src.items, name, 'meta.yaml'])
    if (meta) {
        items.push(name)
        meta.tags?.forEach(tag => allTags.add(tag))
    }
}

log.ok(`Loaded: ${locales.length} locales, ${items.length} items, ${allTags.size} unique tags`)

// Build static files (YAML → JSON)
log.info("Building static files...")
const { processed: staticCount } = await processYamlDirectory(
    paths.src.statics,
    paths.build.statics,
    { filter: file => isYamlFile(file) || file.endsWith('.json') }
)
log.ok(`Built ${staticCount} static files`)

// Build domains mapping
log.info("Building domains mapping...")
const domainsData = await load([...paths.src.statics, "domains.yaml"])
let domainCount = 0
for (const [domain, value] of Object.entries(domainsData)) {
    await write([...paths.build.statics, "domains", `${domain}.json`], { site: value })
    domainCount++
}
log.ok(`Built ${domainCount} domain mappings`)

// Build items
log.info("Building items (YAML → JSON)...")
await processYamlDirectory(paths.src.items, [...paths.build.statics, "items"], { recursive: true })
log.ok(`Built ${items.length} items`)

// Build sites
log.info("Building sites (YAML → JSON)...")
const siteDirs = await dir(paths.src.sites)
await processYamlDirectory(paths.src.sites, [...paths.build.statics, "sites"], { recursive: true })
log.ok(`Built ${siteDirs.length} sites`)

// Copy assets
await copyAssets([
    { src: paths.src.core, dest: paths.build.core, label: "core folder" },
    { src: paths.src.UI, dest: paths.build.UI, label: "UI folder" },
    { src: paths.src.importmap, dest: [...paths.build.root, "importmap.json"], label: "importmap.json" }
])

// Build routes list using regex pattern and post-process
log.info("Building routes list...")
const found = await dir(paths.src.routes, /index\.js$/)
// Keep only directories that have index.js by stripping the suffix
const routeDirs = Array.from(new Set(found
    .filter(p => p.endsWith('index.js'))
    .map(p => p.replace(/\/index\.js$/, ''))))
await write([...paths.build.statics, "routes.json"], routeDirs)
log.ok(`Built routes list with ${routeDirs.length} routes`)

// Process i18n
log.info("Processing i18n files...")
const i18nFiles = await dir(paths.src.i18n)
const localeData = Object.fromEntries(locales.map(l => [l, {}]))

for (const file of i18nFiles.filter(f => isYamlFile(f) || f.endsWith('.json'))) {
    const keyName = file.replace(/\.(json|yaml|yml)$/, '')
    const translations = await load([...paths.src.i18n, file])

    for (const locale of locales) {
        if (translations?.[locale]) {
            localeData[locale][keyName] = translations[locale]
        }
    }
}

for (const locale of locales) {
    const sorted = Object.keys(localeData[locale]).sort().reduce((obj, key) => {
        obj[key] = localeData[locale][key]
        return obj
    }, {})
    await write([...paths.build.locales, `${locale}.json`], sorted)
}
log.ok(`Created ${locales.length} locale files`)

// Generate routes
log.info("Generating routes...")
const indexContent = await load(paths.src.index)
const routeCount = await generateRoutes(locales, items, allTags, indexContent)
log.ok(`Created ${routeCount} route files`)

// Generate version hash
log.info("Generating version hash...")
const buildHash = await hash(paths.build.root, ["statics/version.json"])
await write([...paths.build.root, "statics", "version.json"], { version: buildHash })
log.ok(`Generated version hash: ${buildHash}`)

// Summary
log.section("========================================")
console.log(`${icons.done} ${color.ok("Locales")}: ${locales.length}`)
console.log(`${icons.done} ${color.ok("Items")}: ${items.length}`)
console.log(`${icons.done} ${color.ok("Unique Tags")}: ${allTags.size}`)
console.log(`${icons.done} ${color.ok("Routes Created")}: ${routeCount}`)
log.section("========================================")
log.start("Build completed successfully!")
