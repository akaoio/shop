import { color, icons } from "../Colors.js"

// ============ Build Logger ============

export const log = {
    start: (msg) => console.log(`${icons.start} ${color.header(msg)}`),
    info: (msg) => console.log(`${icons.sync} ${color.info(msg)}`),
    ok: (msg) => console.log(`${icons.done} ${color.ok(msg)}`),
    section: (msg) => console.log(`\n${color.header(msg)}`)
}
