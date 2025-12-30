import { threads } from "./Threads.js"
import { reset } from "./Utils/reset.js"
globalThis.reset = reset
// Register threads
threads.register("main", { main: true, type: "module" })
// threads.register("update", { worker: true, type: "module" })