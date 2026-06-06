import { ref } from 'vue'

export function useAsyncAction() {
    const loading = ref(false)
    const error = ref<unknown>(null)

    async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
        if (loading.value) return
        loading.value = true
        error.value = null
        try {
            return await fn()
        } catch (e) {
            error.value = e
            throw e
        } finally {
            loading.value = false
        }
    }

    return { loading, error, run }
}
