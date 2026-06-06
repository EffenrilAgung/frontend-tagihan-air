export interface ResponseWithServer<T> {
    success: boolean
    message: string
    data?: T
}

export interface ApiError {
    status?: number
    message?: string
    errors?: Record<string, string[]> | null
}

export function toApiError(error: unknown): ApiError {
    if (typeof error === 'object' && error !== null) {
        const e = error as ApiError
        return {
            status: e.status,
            message: e.message,
            errors: e.errors ?? null,
        }
    }
    if (error instanceof Error) {
        return { message: error.message }
    }
    return {}
}