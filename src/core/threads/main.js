import UI from "/core/UI.js"
import { BROWSER, NODE } from "/core/Utils/environments.js"
import { events } from "/core/Events.js"
import { Progress } from "/core/Progress.js"
import { Statics } from "/core/Stores.js"
import { load } from "/core/Utils/files.js"
import { merge } from "/core/Utils/data.js"
import { Construct } from "/core/Construct.js"
import Thread from "/core/Thread.js"

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
    Chains: false,
    Dexs: false,
    Wallets: false,
    DB: false,
    User: false,
    Context: false
})

thread.init = async () => {
    const { site } = Statics
    if (!site) throw new Error("No site configs found during preload")
    if (BROWSER) UI.splash(true)
    Progress.set({ Site: true })
    Progress.set({ Chains: await Construct.Chains() })
    Progress.set({ Dexs: await Construct.Dexs() })
    Progress.set({ Wallets: await Construct.Wallets() })
    Progress.set({ DB: await Construct.DB() })
    Progress.set({ User: await Construct.User() })
    const locale = (globalThis?.localStorage && globalThis.localStorage.getItem("locale")) || site.locale
    if (!locale) throw new Error("No locale found during preload")
    merge(
        Statics,
        await load({
            locales: [NODE && "src", "statics", "locales.json"],
            fiats: [NODE && "src", "statics", "fiats.json"],
            themes: [NODE && "src", "statics", "themes.json"],
            dexs: [NODE && "src", "statics", "dexs.json"],
            dictionary: [NODE && "src", "statics", "locales", `${locale}.json`]
        })
    )
    if (BROWSER) {
        Progress.set({ Context: await Construct.Context() })
        UI.render("Vanilla")
        UI.splash(false)
    }
}
