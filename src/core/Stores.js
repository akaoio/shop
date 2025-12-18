import Indexed from "./Indexed.js"
export const Indexes = {
    Statics: new Indexed({ name: "Statics" }),
    Auth: new Indexed({ name: "Auth" }),
    Wallet: new Indexed({ name: "Wallet" }),
    Lives: new Indexed({ name: "Lives" })
}

globalThis.Statics = globalThis.Statics || {}
export const Statics = globalThis.Statics

export const Wallets = {}
export const Elements = {}
