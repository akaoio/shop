import Indexed from "./Indexed.js"
export const Indexes = {
    Statics: new Indexed({ name: "Statics" }),
    Lives: new Indexed({ name: "Lives" }),
    Auth: new Indexed({ name: "Auth" })
}

globalThis.Statics = globalThis.Statics || {}
export const Statics = globalThis.Statics

globalThis.Lives = globalThis.Lives || {}
export const Lives = globalThis.Lives

export const Wallets = {}
export const Elements = {}
