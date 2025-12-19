import UI from "/core/UI.js"
import { BROWSER } from "/core/Utils/environments.js"
import { events } from "/core/Events.js"
import { Progress } from "/core/Progress.js"
import { Statics } from "/core/Stores.js"
import { load } from "/core/Utils/files.js"
import { merge } from "/core/Utils/data.js"
import { Construct } from "/core/Construct.js"
import Thread from "/core/Thread.js"
import { Context } from "/core/Context.js"
import Router from "/core/Router.js"

const thread = new Thread()

UI.init()

events.on("authenticate", () => {
    globalThis.threads.call({
        thread: "onchain",
        method: "authenticate"
    })
})

Progress.set({
    Site: false,
    DB: false,
    User: false,
    Context: false
})

thread.init = async function () {
    const { site } = Statics
    if (!site) throw new Error("No site configs found during preload")
    if (BROWSER) UI.splash(true)
    merge(
        Statics,
        await load({
            routes: ["statics", "routes.json"],
            locales: ["statics", "locales.json"],
            fiats: ["statics", "fiats.json"],
            themes: ["statics", "themes.json"]
        })
    )
    Progress.set({ Site: true })
    Progress.set({ DB: await Construct.DB() })
    Progress.set({ User: await Construct.User() })
    Context.on("path", ({ value: path }) => {
        const state = Context.get({ path: null, route: null, locale: null })
        path = path || state.path

        UI.render({ path, route, locale })
        Router.setHistory(path)
        const word = Context.get("route")?.replace?.("-", "")?.toLowerCase?.()
        if (word) Router.setHead({ title: Statics?.dictionary?.[word] })
    })
    Context.on("locale", ({ value: locale }) => Router.setLocale(locale.code))
    // Listen to the popstate event, which is triggered when the user navigates back to the previous page
    // Updates Context with the new route info
    if (BROWSER) {
        globalThis.addEventListener("popstate", () => Context.set(Router.process()))
        Progress.set({ Context: await Construct.Context() })
        UI.splash(false)
    }
}
