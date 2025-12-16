import { Indexes, Statics } from "./Stores.js"
import { Context, getTheme, getFiat, getReferrer } from "./Context.js"
import { NODE, BROWSER } from "./Utils/environments.js"
import { load } from "./Utils/files.js"
import Router from "./Router.js"

export const Construct = {
    Site: async function () {
        const hostname = BROWSER && globalThis.location?.hostname
        Statics.domain = BROWSER && /^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(hostname) ? "localhost" : hostname.split(".").slice(-2).join(".")
        Statics.routes = await load([NODE && "src", "statics", "routes.json"].filter(Boolean))
        const { version } = await load([NODE && "src", "statics", "version.json"].filter(Boolean))
        Statics.site = await Indexes.Statics.get("site").once()
        if (!Statics.site || version !== Statics?.site?.version) {
            Statics.site = await load([NODE && "src", "statics", "sites", Statics.domain, "configs.json"].filter(Boolean))
            if (!Statics.site) return
            Statics.site.version = version
            Indexes.Statics.get("site").put(Statics.site)
        }
        // Redirect to the main domain if current domain is different
        if (BROWSER && Statics.site.domain && Statics.domain !== Statics.site.domain && globalThis?.location) {
            const url = new URL(globalThis.location.href)
            url.host = Statics.site.domain
            globalThis.location.href = url.href
        }
        console.log("Constructed: Site")
        return true
    },
    DB: async function () {
        if (!Statics.site) return
        await import("./DB.js")
        globalThis.gun = GUN({ peers: Statics.site?.peers || [] })
        globalThis.sea = SEA
        console.log("Constructed: DB")
        return true
    },
    User: async function () {
        globalThis.user = globalThis.gun.user()
        const { authenticate } = await import("./Gun.js")
        // Try to recall authentication
        const pair = await Indexes.Auth.get("pair").once()
        if (pair && !Context.get("authenticated")) authenticate(pair)
        console.log("Constructed: User")
        return true
    },
    Context: async function () {
        const router = Router.process()
        Context.set({
            path: router.path,
            route: router.route,
            locale: router.locale,
            theme: getTheme(),
            dictionary: Statics.dictionary,
            fiat: getFiat(),
            referrer: globalThis.localStorage ? globalThis.localStorage.getItem("referrer") : await getReferrer()
        })
        console.log("Constructed: Context")
        return true
    }
}