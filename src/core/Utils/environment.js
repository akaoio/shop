let NODE = false
let BROWSER = false
let WIN = false

if (globalThis?.process?.versions?.node) {
    NODE = true
    BROWSER = !NODE
}

if (globalThis?.location?.origin) {
    BROWSER = true
    NODE = !BROWSER
}

if (globalThis?.process?.platform?.includes("win")) {
    WIN = true
}

export { NODE, BROWSER, WIN }
