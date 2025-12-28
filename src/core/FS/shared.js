// Import environment detection flags to determine runtime context
import { NODE, BROWSER, WIN } from "../Utils/environment.js"

// Lazy-loaded modules that are only available in Node.js environment
let fs = null
let YAML = null

// Dynamically import Node.js-specific modules when running in Node.js
if (NODE) {
    fs = await import("fs")
    YAML = await import("yaml")
}

export { fs, YAML, NODE, BROWSER, WIN }
