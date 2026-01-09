import template from "./template.js"

export class IDENTICON extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot.appendChild(template.cloneNode(true))
        this.svg = this.shadowRoot.querySelector("svg")
    }

    static get observedAttributes() {
        return ["data-seed", "data-size"]
    }

    attributeChangedCallback(name, last, value) {
        if ((name === "data-seed" || name === "data-size") && last !== value) {
            this.generateIdenticon(this.dataset.seed)
        }
    }

    connectedCallback() {
        if (this.dataset.seed) {
            this.generateIdenticon(this.dataset.seed)
        }
    }

    // Simple string hash function to generate a deterministic value
    hashCode(str) {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    generateIdenticon(seed) {
        // Clear previous SVG content
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild)
        }

        if (!seed) return
        if (["", "null", "undefined"].includes(seed)) this.removeAttribute("seed")

        // Get the size from attribute or use default
        const size = parseInt(this.dataset.size, 10) || 5

        // Define grid parameters (ensure odd number to have a middle column)
        const adjustedSize = size % 2 === 0 ? size + 1 : size

        // Set viewBox to make SVG square
        this.svg.setAttribute("viewBox", `0 0 ${adjustedSize} ${adjustedSize}`)

        // Generate a hash from the seed
        const hash = this.hashCode(seed)

        // Use hash to determine cell colors
        const leftHalfCols = Math.floor(adjustedSize / 2)
        const matrix = []

        // Generate left half + middle column
        for (let row = 0; row < adjustedSize; row++) {
            const rowValues = []
            for (let col = 0; col <= leftHalfCols; col++) {
                // Deterministically decide if this cell is filled based on hash and position
                const bitPosition = (row * adjustedSize + col) % 32
                const isFilled = ((hash >> bitPosition) & 1) === 1
                rowValues.push(isFilled)
            }
            matrix.push(rowValues)
        }

        // Create SVG elements for the entire grid with symmetry
        for (let row = 0; row < adjustedSize; row++) {
            for (let col = 0; col < adjustedSize; col++) {
                let isFilled

                if (col <= leftHalfCols) {
                    // Left half + middle column (from matrix)
                    isFilled = matrix[row][col]
                } else {
                    // Right half (mirrored from left)
                    const mirroredCol = adjustedSize - col - 1
                    isFilled = matrix[row][mirroredCol]
                }

                if (isFilled) {
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                    rect.setAttribute("x", col)
                    rect.setAttribute("y", row)
                    rect.setAttribute("width", 1)
                    rect.setAttribute("height", 1)
                    rect.setAttribute("fill", "currentColor")
                    this.svg.appendChild(rect)
                }
            }
        }
    }
}

customElements.define("ui-identicon", IDENTICON)
