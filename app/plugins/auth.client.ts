/**
 * Hydrate auth dari localStorage (client-only), lalu sinkronkan profil dari API.
 * Membaca storage di plugin — bukan di useState initializer — agar tidak hydration mismatch.
 */
export default defineNuxtPlugin(() => {
    const storedToken = localStorage.getItem('auth_token')
    const { user, token, fetchProfile } = useAuth()

    if (storedToken) {
        token.value = storedToken
        const rawUser = localStorage.getItem('auth_user')
        if (rawUser) {
            try {
                user.value = JSON.parse(rawUser) as import('~/types/users').User
            } catch {
                localStorage.removeItem('auth_user')
            }
        }
        fetchProfile()
    }
})
