import { Indexes, Statics } from "./Stores.js"
import { Context, getTheme, getFiat, getReferrer } from "./Context.js"
import { BROWSER, load } from "./Utils.js"
import Router from "./Router.js"

export const Construct = {
    Site: async function () {
        const hostname = BROWSER && globalThis.location?.hostname
        Statics.domain = /^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(hostname) ? "localhost" : hostname.split(".").slice(-2).join(".")
        const domain = await load(["statics", "domains", `${Statics.domain}.json`])
        Statics.site = await Indexes.Statics.get("site").once() || await load(["statics", "sites", domain.site, "configs.json"])
        if (Statics.site) Indexes.Statics.get("site").put(Statics.site)
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
            ...router,
            theme: getTheme(),
            fiat: getFiat(),
            referrer: globalThis.localStorage ? globalThis.localStorage.getItem("referrer") : await getReferrer()
        })
        console.log("Constructed: Context")
        return true
    }
}