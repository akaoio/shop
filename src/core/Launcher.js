import { threads } from "./Threads.js"
import { reset } from "./Utils/reset.js"
globalThis.reset = reset
// Register threads
threads.register("onchain", { worker: true, type: "module" })
threads.register("offchain", { worker: true, type: "module" })
threads.register("main", { main: true, type: "module" })
