/** Log error hanya di development — hindari bocor detail ke console production. */
export function devLog(...args: unknown[]): void {
    if (import.meta.dev) {
        console.error(...args)
    }
}
