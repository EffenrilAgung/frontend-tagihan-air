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

const NETWORK_ERROR_PATTERN = /failed to fetch|networkerror|load failed|network request failed/i

export function isNetworkError(error: unknown): boolean {
    const apiError = toApiError(error)
    if (apiError.status === 0) return true
    if (error instanceof TypeError) return true
    const message = apiError.message ?? (error instanceof Error ? error.message : '')
    return NETWORK_ERROR_PATTERN.test(message)
}

export function formatApiErrorMessage(
    error: unknown,
    fallback = 'Terjadi kesalahan',
): string {
    const apiError = toApiError(error)

    if (apiError.status === 401) {
        return 'Sesi login telah berakhir. Silakan logout lalu login kembali.'
    }

    if (apiError.status !== undefined && apiError.status >= 500) {
        return 'Terjadi kesalahan pada server.'
    }

    if (isNetworkError(error)) {
        return 'Server backend tidak merespon. Pastikan Laravel berjalan dengan perintah: php artisan serve --port=8000'
    }

    return apiError.message || fallback
}