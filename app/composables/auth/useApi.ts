/**
 * API Client composable for making HTTP requests to the Laravel backend.
 * Automatically attaches the Sanctum Bearer token from auth storage.
 */
export function useApi() {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBaseUrl as string)?.replace(/\/$/, '') ?? ''

    if (!baseUrl) {
        throw new Error(
            '[useApi] NUXT_PUBLIC_API_BASE_URL belum diatur. Salin .env.example ke .env dan isi URL API backend.',
        )
    }

    /**
     * Get the auth token from localStorage
     */
    function getToken(): string | null {
        if (import.meta.client) {
            return localStorage.getItem('auth_token')
        }
        return null
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
    ): Promise<{ success: boolean; message: string; data: T }> {
        const url = `${baseUrl}${path}`

        const isFormData = body instanceof FormData

        const options: RequestInit = {
            method,
            headers: buildHeaders(isFormData ? undefined : 'application/json'),
            credentials: 'omit', // token-based auth — no cookies needed
        }

        if (body) {
            options.body = isFormData ? body : JSON.stringify(body)
        }

        const response = await fetch(url, options)

        const json = await response.json()

        if (!response.ok) {
            // Laravel validation errors: { message, errors: { field: [...] } }
            const errorMessage = json.message || `Request failed with status ${response.status}`
            throw { status: response.status, message: errorMessage, errors: json.errors || null, ...json }
        }

        return json
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
