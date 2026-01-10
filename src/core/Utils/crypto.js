export function sha256(str) {
    // SHA-256 constants (pre-computed)
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
    const rightRotate = (v, n) => (v >>> n) | (v << (32 - n))

    // Prepare message
    const words = []
    const strBitLength = str.length * 8
    str += "\x80"
    while (str.length % 64 !== 56) str += "\x00"

    // Convert to words
    for (let i = 0; i < str.length; i++) {
        words[i >> 2] |= str.charCodeAt(i) << (((3 - i) % 4) * 8)
    }
    words[words.length] = (strBitLength / Math.pow(2, 32)) | 0
    words[words.length] = strBitLength

    // Process chunks
    for (let j = 0; j < words.length; ) {
        const w = words.slice(j, (j += 16))
        const oldHash = H.slice(0)

        // Main loop
        for (let i = 0; i < 64; i++) {
            if (i >= 16) {
                const w15 = w[i - 15],
                    w2 = w[i - 2]
                const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)
                const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0
            }

            const a = H[0],
                b = H[1],
                c = H[2],
                d = H[3],
                e = H[4],
                f = H[5],
                g = H[6],
                h = H[7]
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
            const ch = (e & f) ^ (~e & g)
            const temp1 = (h + S1 + ch + K[i] + w[i]) | 0
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
            const maj = (a & b) ^ (a & c) ^ (b & c)

            H[7] = g
            H[6] = f
            H[5] = e
            H[4] = (d + temp1) | 0
            H[3] = c
            H[2] = b
            H[1] = a
            H[0] = (temp1 + (S0 + maj)) | 0 | 0
        }

        // Add compressed chunk
        for (let i = 0; i < 8; i++) H[i] = (H[i] + oldHash[i]) | 0
    }

    // Convert to hex
    let result = ""
    for (let i = 0; i < 8; i++) {
        for (let j = 3; j >= 0; j--) {
            const b = (H[i] >> (j * 8)) & 255
            result += (b < 16 ? "0" : "") + b.toString(16)
        }
    }
    return result
}

export async function signAndHash(data) {
    let { sea, user } = globalThis
    if (user.is && user._ && user._.sea) {
        const signedData = await sea.sign(data, user._.sea)

        const _ = JSON.stringify({
            data: signedData,
            user: { pub: user.is.pub }
        })

        return { data: _, hash: sha256(_) }
    }
    return {}
}

export function base64UrlToHex(base64url) {
    const padding = "=".repeat((4 - (base64url.length % 4)) % 4)
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding
    const binary = atob(base64)
    return binary
        .split("")
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
}

export function hexToBase64Url(hex) {
    const binary = hex
        .match(/.{1,2}/g)
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join("")
    const base64 = btoa(binary)
    const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    return base64url
}

export function base64ToHex(base64) {
    var binaryStr = atob(base64)
    var hexStr = ""
    for (var i = 0; i < binaryStr.length; i++) {
        var hex = binaryStr.charCodeAt(i).toString(16)
        hexStr += hex.length === 1 ? "0" + hex : hex
    }
    return hexStr
}

export function hexToBase64(hexStr) {
    var base64 = ""
    for (var i = 0; i < hexStr.length; i++) {
        base64 += !((i - 1) & 1) ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16)) : ""
    }
    return btoa(base64)
}

// Encode ArrayBuffer to base64url
export function bufferToBase64Url(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
}

// Decode base64 to ArrayBuffer
export function base64UrlToBuffer(base64url) {
    const padding = "=".repeat((4 - (base64url.length % 4)) % 4)
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding
    const binary = atob(base64)
    const buffer = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i)
    }
    return buffer
}
