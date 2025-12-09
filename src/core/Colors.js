// ANSI color codes for terminal output
export const colors = {
    // Effects
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",

    // Colors
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
}

// Icons
export const icons = {
    start: "🚀",
    done: "✅",
    error: "❌",
    warn: "⚠️",
    info: "ℹ️",
    sync: "🔄",
    chain: "⛓️"
}

// Simple color functions
export const color = {
    header: (text) => `${colors.bright}${colors.cyan}${text}${colors.reset}`,
    ok: (text) => `${colors.green}${text}${colors.reset}`,
    error: (text) => `${colors.red}${text}${colors.reset}`,
    warn: (text) => `${colors.yellow}${text}${colors.reset}`,
    info: (text) => `${colors.blue}${text}${colors.reset}`,
    primary: (text) => `${colors.magenta}${text}${colors.reset}`,
    secondary: (text) => `${colors.dim}${text}${colors.reset}`
}
