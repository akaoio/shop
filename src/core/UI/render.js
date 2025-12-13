import { BROWSER } from "/core/Utils/environments.js"

export async function render() {
    if (!BROWSER) return
    const main = await import(`/UI/main.js`)
    if (!main.render) return
    main.render()
}

export default render
