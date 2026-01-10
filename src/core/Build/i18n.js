import { write, load, dir } from "../FS.js"
import { paths } from "./config.js"

// ============ i18n Processing ============

export async function processI18n(locales) {
    const i18nFiles = await dir(paths.src.i18n)
    const localeData = Object.fromEntries(locales.map((l) => [l, {}]))

    for (const file of i18nFiles) {
        const keyName = file.replace(/\.(json|yaml|yml)$/, "")
        const translations = await load([...paths.src.i18n, file])

        for (const locale of locales) {
            if (translations?.[locale]) {
                localeData[locale][keyName] = translations[locale]
            }
        }
    }

    for (const locale of locales) {
        const sorted = Object.fromEntries(Object.entries(localeData[locale]).sort(([a], [b]) => a.localeCompare(b)))
        await write([...paths.build.locales, `${locale}.json`], sorted)
    }

    return locales.length
}
