import { Indexes, Statics } from "./Stores.js"
import { Context, getTheme, getFiat, getReferrer } from "./Context.js"
import { BROWSER } from "./Utils.js"
import Router from "./Router.js"
import DB from "./DB.js"

export const Construct = {
    Site: async function () {
        const hostname = BROWSER && globalThis.location?.hostname
        Statics.domain = /^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(hostname) ? "localhost" : hostname.split(".").slice(-2).join(".")
        const domain = await DB.get(["statics", "domains", `${Statics.domain}.json`])
        Statics.site = await DB.get(["statics", "sites", domain.site, "configs.json"])
        console.log("Constructed: Site")
        return true
    },
    GDB: async function () {
        if (!Statics.site) return
        await import("./GDB.js")
        globalThis.gun = GUN({ peers: Statics.site?.peers || [] })
        globalThis.sea = SEA
        console.log("Constructed: GDB")
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