import server from "live-server"
import chokidar from "chokidar"
import { spawn } from "child_process"

// Watch for changes in src directory and rebuild
console.log("🔍 Watching for file changes...")
chokidar.watch("src/**/*").on("change", (path) => {
    console.log(`📝 Change detected in ${path}, rebuilding...`)
    spawn("npm", ["run", "build"], { stdio: "inherit" })
})

server.start({
    port: 8080, // Set the server port. Defaults to 8080.
    host: process.env.IP, // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "build", // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    logLevel: 2 // 0 = errors only, 1 = some, 2 = lots
})