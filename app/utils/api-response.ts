/**
 * Laravel often wraps Resource::collection inside `data` as `{ data: T[] }`.
 * This normalizes either a plain array or that nested shape.
 */
export function unwrapListData<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) {
        return payload as T[]
    }
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: T[] }).data
    }
    return []
}
