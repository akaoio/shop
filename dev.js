import liveServer from "live-server"

// Check if UI development mode is enabled
const ui = process.argv.includes("ui")

liveServer.start({
    port: 3000, // Set the server port. Defaults to 8080.
    host: "localhost", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "./src", // Set root directory that's being served. Defaults to cwd.
    open: ui ? "/dev.html" : "/index.html", // Path to open initially
    file: "index.html", // Fallback for 404s
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    logLevel: 2 // 0 = errors only, 1 = some, 2 = lots
})
