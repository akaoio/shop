export { BigNumber } from "./bignumber.js"

export const toDecimal = (number, decimals) => {
    if (typeof number == "bigint") number = Number(number)
    if (typeof decimals == "bigint") decimals = Number(decimals)
    const divisor = 10 ** decimals
    const integer = number / divisor
    const fraction = number % divisor
    return parseFloat(`${integer}.${fraction}`)
}

export const toBigNumber = (number, decimals) => {
    if (typeof number == "bigint") number = Number(number)
    if (typeof decimals == "bigint") decimals = Number(decimals)
    const [integerPart, fractionalPart = ""] = number.toString().split(".")
    const divisor = 10 ** decimals
    const integer = Number(integerPart) * divisor
    const fraction = Number(fractionalPart.padEnd(decimals, "0"))
    return integer + fraction
}

export const formatNumber = (num, decimals = 4) => {
    let [int, frac = ""] = num.toString().split(".")
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    if (+int.replace(/,/g, "") > 10000) return int
    frac = (frac + "00").slice(0, decimals).replace(/0{1,2}$/, "")
    return `${int}.${frac || "00"}`
}

export const beautifyNumber = (number) => {
    if (typeof number == "string") number = number.replace(/[^0-9.]/g, "")
    if (number >= 1e9) return (number / 1e9).toFixed(1).replace(/\.0$/, "") + "B"
    if (number >= 1e6) return (number / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    if (number >= 1e3) return (number / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
    return number.toString()
}

// Shorten a string, output "asdf...zxcv"
export const shorten = (str, start = 4, end = 4) => {
    if (str.length <= start + end) return str
    return `${str.substring(0, start)}...${str.substring(str.length - end, str.length)}`
}
