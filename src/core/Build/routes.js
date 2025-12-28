import { write } from "../FS.js"
import { paths } from "./config.js"

// ============ Routes Generation ============

export async function generateRoutes(locales, items, tags, indexContent) {
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
