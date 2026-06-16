/**
 * Hydrate auth dari sessionStorage (client-only), lalu sinkronkan profil dari API.
 */
import { getStoredToken, getStoredUserRaw } from '~/utils/auth-storage'

export default defineNuxtPlugin(() => {
    const storedToken = getStoredToken()
    const { user, token, fetchProfile } = useAuth()

    if (storedToken) {
        token.value = storedToken
        const rawUser = getStoredUserRaw()
        if (rawUser) {
            try {
                user.value = JSON.parse(rawUser) as import('~/types/users').User
            } catch {
                sessionStorage.removeItem('auth_user')
            }
        }
        fetchProfile()
    }
})
