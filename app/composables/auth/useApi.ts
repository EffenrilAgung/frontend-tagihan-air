/**
 * API Client composable for making HTTP requests to the Laravel backend.
 * Automatically attaches the Sanctum Bearer token from auth storage.
 */
import type { ResponseWithServer } from '~/types/response-server'
import { getStoredToken } from '~/utils/auth-storage'

export function useApi() {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBaseUrl as string)?.replace(/\/$/, '') ?? ''

    if (!baseUrl) {
        throw new Error(
            '[useApi] NUXT_PUBLIC_API_BASE_URL belum diatur. Salin .env.example ke .env dan isi URL API backend.',
        )
    }

    /**
     * Get the auth token from sessionStorage
     */
    function getToken(): string | null {
        return getStoredToken()
    }

    /**
     * Build common headers including Authorization if token exists.
     */
    function buildHeaders(contentType?: string): Record<string, string> {
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (contentType) {
            headers['Content-Type'] = contentType
        }

        const token = getToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return headers
    }

    /**
     * Generic request handler with error parsing.
     * Returns the parsed JSON body on success, throws on network error.
     */
    async function request<T = unknown>(
        method: string,
        path: string,
        body?: Record<string, unknown> | FormData,
    ): Promise<ResponseWithServer<T>> {
        const url = `${baseUrl}${path}`

        const isFormData = body instanceof FormData

        const options: RequestInit = {
            method,
            headers: buildHeaders(isFormData ? undefined : 'application/json'),
            credentials: 'omit', // token-based auth — no cookies needed
        }

        if (body) {
            // For FormData with non-GET/POST methods, use POST with _method spoofing
            // because browsers don't send multipart/form-data correctly with PUT/PATCH/DELETE
            if (isFormData && method !== 'GET' && method !== 'POST') {
                (body as FormData).append('_method', method)
                options.method = 'POST'
            }
            options.body = isFormData ? body : JSON.stringify(body)
        }

        let response: Response
        try {
            response = await fetch(url, options)
        } catch {
            throw {
                status: 0,
                message: 'Server backend tidak merespon. Pastikan Laravel berjalan dengan perintah: php artisan serve --port=8000',
                errors: null,
            }
        }

        const contentType = response.headers.get('content-type') ?? ''
        const isJson = contentType.includes('application/json')

        let json: Record<string, unknown>
        try {
            if (!isJson) {
                throw new Error('non-json')
            }
            json = await response.json()
        } catch {
            if (response.status === 401) {
                throw {
                    status: 401,
                    message: 'Sesi login telah berakhir. Silakan logout lalu login kembali.',
                    errors: null,
                }
            }

            throw {
                status: response.status,
                message: response.status === 0 || !response.ok
                    ? 'Server backend tidak merespon. Pastikan Laravel berjalan dengan perintah: php artisan serve --port=8000'
                    : `Respons server tidak valid (${response.status})`,
                errors: null,
            }
        }

        if (!response.ok) {
            const rawMessage = typeof json.message === 'string' ? json.message : ''
            const safeMessage = response.status >= 500
                ? 'Terjadi kesalahan pada server.'
                : rawMessage || `Request failed with status ${response.status}`

            throw { status: response.status, message: safeMessage, errors: json.errors || null }
        }

        return {
            success: Boolean(json.success),
            message: typeof json.message === 'string' ? json.message : '',
            data: json.data as T,
        }
    }

    return {
        get<T = unknown>(path: string) {
            return request<T>('GET', path)
        },

        post<T = unknown>(path: string, body?: Record<string, unknown> | FormData) {
            return request<T>('POST', path, body)
        },

        put<T = unknown>(path: string, body?: Record<string, unknown> | FormData) {
            return request<T>('PUT', path, body)
        },

        delete<T = unknown>(path: string) {
            return request<T>('DELETE', path)
        },
    }
}
