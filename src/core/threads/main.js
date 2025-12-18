import UI from "/core/UI.js"
import { BROWSER } from "/core/Utils/environments.js"
import { events } from "/core/Events.js"
import { Progress } from "/core/Progress.js"
import { Statics } from "/core/Stores.js"
import { load } from "/core/Utils/files.js"
import { merge } from "/core/Utils/data.js"
import { Construct } from "/core/Construct.js"
import Thread from "/core/Thread.js"
import { Context, setHistory, setLocale } from "/core/Context.js"
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
    Progress.set({ Site: true })
    Progress.set({ DB: await Construct.DB() })
    Progress.set({ User: await Construct.User() })
    const locale = Context.get("locale")?.code || globalThis?.localStorage?.getItem?.("locale") || site.locale
    Context.on("path", ({ value: path }) => {
        UI.render()
        setHistory(path)
    })
    Context.on("locale", ({ value: locale }) => setLocale(locale.code))
    // Listen to the popstate event, which is triggered when the user navigates back to the previous page
    // Updates Context with the new route info
    if (BROWSER) globalThis.addEventListener("popstate", () => Context.set(Router.process()))
    if (!locale) throw new Error("No locale found during preload")
    merge(
        Statics,
        await load({
            routes: ["statics", "routes.json"],
            locales: ["statics", "locales.json"],
            fiats: ["statics", "fiats.json"],
            themes: ["statics", "themes.json"],
            dictionary: ["statics", "locales", `${locale}.json`]
        })
    )
    if (BROWSER) {
        Progress.set({ Context: await Construct.Context() })
        UI.splash(false)
    }
}
