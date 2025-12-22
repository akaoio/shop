// ============ Build Configuration ============

export const paths = {
    src: {
        index: ["src", "index.html"],
        statics: ["src", "statics"],
        i18n: ["src", "statics", "i18n"],
        items: ["src", "statics", "items"],
        sites: ["src", "statics", "sites"],
        core: ["src", "core"],
        UI: ["src", "UI"],
        routes: ["src", "UI", "routes"],
        importmap: ["importmap.json"]
    },
    build: {
        root: ["build"],
        statics: ["build", "statics"],
        locales: ["build", "statics", "locales"],
        core: ["build", "core"],
        UI: ["build", "UI"]
    }
}
