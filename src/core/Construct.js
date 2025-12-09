import { Indexes, Chains, Wallets, Dexs, Statics } from "./Stores.js"
import { Context, getTheme, getLocale, getFiat, getReferrer } from "./Context.js"
import { getRoute } from "./Router.js"
import { NODE, BROWSER } from "./Utils/environments.js"
import { load } from "./Utils/files.js"

export const Construct = {
    Site: async () => {
        const hostname = BROWSER && globalThis.location?.hostname
        Statics.domain = BROWSER && ["localhost", "127.0.0.1"].includes(hostname) ? "localhost" : hostname.split(".").slice(-2).join(".")
        const { version } = await load([NODE && "src", "statics", "version.json"].filter(Boolean))
        Statics.site = await Indexes.Statics.get("site").once()
        if (!Statics.site || version !== Statics.site?.version) {
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
    DB: async () => {
        if (!Statics.site) return
        await import("./DB.js")
        globalThis.gun = GUN({ peers: Statics.site?.peers || [] })
        globalThis.sea = SEA
        console.log("Constructed: DB")
        return true
    },
    User: async () => {
        globalThis.user = globalThis.gun.user()
        const { authenticate } = await import("./Gun.js")
        // Try to recall authentication
        const pair = await Indexes.Auth.get("pair").once()
        if (pair && !Context.get("authenticated")) authenticate(pair)
        console.log("Constructed: User")
        return true
    },
    Context: async () => {
        Context.set({
            route: getRoute(),
            theme: getTheme(),
            locale: getLocale(),
            dictionary: Statics.dictionary,
            fiat: getFiat(),
            referrer: globalThis.localStorage ? globalThis.localStorage.getItem("referrer") : await getReferrer()
        })
        console.log("Constructed: Context")
        return true
    }
}

export { Chains, Wallets, Dexs }
