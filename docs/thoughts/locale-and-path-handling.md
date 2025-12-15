```js
export const createPath = (locale, path) => (locale && path ? `/${locale}` + path.replace(/(\/\w{2})($|\/.*)/g, "$2").replace(/\/$/g, "") : null)

export const redirect = () => {
    if (typeof window !== "undefined") {
        const pathLocale = getLocale(window.location.pathname)
        localStorage.locale = localStorage.locale || pathLocale || defaultLocale.code
        if (!pathLocale) {
            const path = createPath(localStorage.locale, window.location.pathname + window.location.search)
            navigate(path)
        }
    }
}

export const getLocale = path => {
    const pathLocale = path.replace(/(\/)(\w{2})($|\/.*)/g, "$2").replace(/[\W\d]/g, "")
    if (siteLocales.filter(locale => locale.code === pathLocale).length > 0) return pathLocale
    return null
}
```