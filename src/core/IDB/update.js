import { notify } from "./notify.js"

export async function update(db, path, value) {
    // First notify the exact path
    notify(db.callbacks, path, value)

    // Then notify any subscribers watching nested paths
    if (typeof value === "object" && value !== null) {
        const notifyNested = async (currentPath, currentValue) => {
            for (const [key, val] of Object.entries(currentValue)) {
                const nestedPath = [...currentPath, key]
                notify(db.callbacks, nestedPath, val)
                if (typeof val === "object" && val !== null) {
                    await notifyNested(nestedPath, val)
                }
            }
        }
        await notifyNested(path, value)
    }

    // Finally notify parent paths
    for (let i = path.length - 1; i >= 0; i--) {
        const parentPath = path.slice(0, i)
        if (parentPath.length > 0) {
            const parentValue = await db.$get(parentPath)
            if (parentValue !== undefined) notify(db.callbacks, parentPath, parentValue)
        }
    }
}
