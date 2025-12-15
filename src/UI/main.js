import { Context, handleRoute } from "/core/Context.js"

export function render() {
    // Initial render
    handleRoute(Context.get("route"))

    // Listen for route changes
    Context.on("route", ({ value: route }) => handleRoute(route))
}