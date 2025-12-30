import UI from "/core/UI.js"
import { events } from "/core/Events.js"
import { Progress } from "/core/Progress.js"
import { Statics } from "/core/Stores.js"
import { merge } from "/core/Utils.js"
import { Construct } from "/core/Construct.js"
import Thread from "/core/Thread.js"
import { Context } from "/core/Context.js"
import Router from "/core/Router.js"
import DB from "/core/DB.js"

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
    GDB: false,
    User: false,
    Context: false
})

thread.init = async function () {
    const { site } = Statics
    if (!site) throw new Error("No site configs found during preload")
    UI.splash(true)
    merge(
        Statics,
        {
            routes: await DB.get(["statics", "routes.json"]),
            locales: await DB.get(["statics", "locales.json"]),
            fiats: await DB.get(["statics", "fiats.json"]),
            themes: await DB.get(["statics", "themes.json"])
        }
    )
    Progress.set({ Site: true })
    Progress.set({ GDB: await Construct.GDB() })
    Progress.set({ User: await Construct.User() })
    // Listen to the popstate event, which is triggered when the user navigates back to the previous page
    // Updates Context with the new route info
    globalThis.addEventListener("popstate", data => UI.render(data?.state || {}))
    Context.on("path", ({ value: path }) => UI.render({ path }))
    Context.on("locale", ({ value: locale }) => Router.setLocale(locale.code))
    Progress.set({ Context: await Construct.Context() })
    UI.splash(false)
}
