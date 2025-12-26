import { write, load, copy, dir, remove, isDirectory } from "./src/core/Utils/files.js"
import { color, icons } from "./src/core/Colors.js"
import { paths } from "./src/core/Build/config.js"
import { log } from "./src/core/Build/logger.js"
import { generateRoutes } from "./src/core/Build/routes.js"
import { processI18n } from "./src/core/Build/i18n.js"
import { generateHashFiles } from "./src/core/Build/hash.js"

// ============ Helper Functions ============
async function copyAssets(assets) {
    for (const { src, dest, label } of assets) {
        await copy(src, dest)
        log.ok(`Copied ${label}`)
    }
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
                const fullSubPath = [...fullSrcPath, subFile]

                // Check if it's a directory - if so, copy it entirely
                if (await isDirectory(fullSubPath)) {
                    await copy(fullSubPath, [...destPath, file, subFile])
                    continue
                }

                // Otherwise, try to load and convert YAML/JSON
                const data = await load(fullSubPath)
                if (data) {
                    const jsonName = subFile.replace(/\.(yaml|yml)$/, '.json')
                    await write([...destPath, file, jsonName], data)
                    processed++
                } else {
                    await copy(fullSubPath, [...destPath, file, subFile])
                }
            }
        } else {
            const data = await load(fullSrcPath)
            if (data) {
                const jsonName = file.replace(/\.(yaml|yml)$/, '.json')
                await write([...destPath, jsonName], data)
                processed++
            }
        }
    }

    return { total: filtered.length, processed }
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
    { filter: file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json') }
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
    { src: paths.src.importmap, dest: [...paths.build.root, "importmap.json"], label: "importmap.json" },
    { src: ["node_modules", "bootstrap-icons", "icons"], dest: [...paths.build.root, "images", "icons"], label: "bootstrap icons" }
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
const localeCount = await processI18n(locales)
log.ok(`Created ${localeCount} locale files`)

// Generate routes
log.info("Generating routes...")
const indexContent = await load(paths.src.index)
const routeCount = await generateRoutes(locales, items, allTags, indexContent)
log.ok(`Created ${routeCount} route files`)

// Generate hash files for all JSON files in build directory
log.info("Generating hash files...")
const hashResult = await generateHashFiles(paths.build.root)
log.ok(`Created ${hashResult.hashFiles} hash files and ${hashResult.hashDatabase} hash database entries`)

// Summary
log.section("========================================")
console.log(`${icons.done} ${color.ok("Locales")}: ${locales.length}`)
console.log(`${icons.done} ${color.ok("Items")}: ${items.length}`)
console.log(`${icons.done} ${color.ok("Unique Tags")}: ${allTags.size}`)
console.log(`${icons.done} ${color.ok("Routes Created")}: ${routeCount}`)
console.log(`${icons.done} ${color.ok("Hash Files")}: ${hashResult.hashFiles}`)
console.log(`${icons.done} ${color.ok("Hash Database")}: ${hashResult.hashDatabase}`)
log.section("========================================")
log.start("Build completed successfully!")
