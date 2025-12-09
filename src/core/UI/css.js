export function css(strings, ...values) {
    const style = document.createElement("style")
    style.innerHTML = strings.reduce((acc, str, i) => acc + str + (values[i] instanceof HTMLStyleElement ? values[i].innerText : (values[i] ?? "")), "")
    return style
}

export default css
