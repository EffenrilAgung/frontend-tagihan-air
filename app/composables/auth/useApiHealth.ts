/**
 * Cek ketersediaan backend Laravel via GET /api/health (sudah tercakup CORS).
 */
export function useApiHealth() {
    const config = useRuntimeConfig()
    const isOnline = ref(true)
    const checking = ref(false)

    function getHealthUrl(): string {
        const apiBase = (config.public.apiBaseUrl as string)?.replace(/\/$/, '') ?? ''
        return `${apiBase}/health`
    }

    async function checkHealth(): Promise<boolean> {
        if (!import.meta.client) return true

        checking.value = true
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(getHealthUrl(), {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            isOnline.value = response.ok
            return response.ok
        } catch {
            isOnline.value = false
            return false
        } finally {
            checking.value = false
        }
    }

    return {
        isOnline,
        checking,
        checkHealth,
    }
}
