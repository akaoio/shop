import { isPromise } from "./data.js"

export function loop({ data, process, callback, delay = [1000, 5000], index = 0, iterations = 0 } = {}) {
    if (typeof process !== "function") return
    let chunk
    if (data && Array.isArray(data)) {
        if (!data.length) return
        // If the loop is over, reset the index to 0 to start again
        if (index >= data.length) index = 0
        chunk = data[index]
    }
    const result = process(chunk, index)

    const next = (result) => {
        if (typeof callback === "function") callback(result)

        let nextDelay = delay
        if (Array.isArray(delay)) {
            // If this is the first loop, set delay to min (which means speed max)
            if (iterations == index) nextDelay = Math.min(...delay)
            // Else set delay to max, which means speed min
            else nextDelay = Math.max(...delay)
        }

        setTimeout(
            () =>
                loop({
                    data,
                    process,
                    callback,
                    delay,
                    index: index + 1,
                    iterations: iterations == index ? iterations + 1 : iterations
                }),
            nextDelay
        )
    }

    if (isPromise(result)) return result.then((result) => next(result)).catch((error) => console.error(error))
    else next(result)
}
