import { BROWSER } from "core/Utils/environments.js"

export async function render(UI) {
    if (!BROWSER) return
    const main = await import(`UIs/${UI}/main.js`)
    if (!main.render) return
    main.render()
}

export default render
