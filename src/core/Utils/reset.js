export function reset() {
    // Clear all data in localStorage
    localStorage.clear()
    console.log("localStorage has been cleared.")

    // Clear all data in sessionStorage
    sessionStorage.clear()
    console.log("sessionStorage has been cleared.")

    // Delete all databases in indexedDB
    if ("indexedDB" in window) {
        indexedDB.databases().then((databases) => {
            databases.forEach((database) => {
                indexedDB.deleteDatabase(database.name)
                console.log(`Database ${database.name} has been deleted.`)
            })
        }).catch((error) => {
            console.error("Error accessing IndexedDB:", error)
        })
    }

    // Clear all caches
    if ("caches" in window) {
        caches.keys().then((cacheNames) => {
            cacheNames.forEach((cacheName) => {
                caches.delete(cacheName).then(() => {
                    console.log(`Cache ${cacheName} has been deleted.`)
                })
            })
        })
    }

    // Delete all cookies
    const cookies = document.cookie.split(";")
    cookies.forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim()
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    })
    console.log("All cookies have been deleted.")

    // Unregister all Service Workers
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
                registration.unregister()
                console.log(`Service Worker ${registration.scope} has been unregistered.`)
            })
        })
    }

    // If using Web SQL (though it's deprecated), data needs to be manually cleared
    console.log("Web SQL data would need to be manually cleared if used.")

    // Log that all reset tasks have been completed
    console.log("All reset tasks have been completed.")
}
