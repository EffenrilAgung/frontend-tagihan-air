import type { Ref } from 'vue'
import { toast } from 'vue-sonner'
import type { User, AuthState, LoginResponse, ProfileUpdateForm } from '../../types/users'
import { useApi } from './useApi'

/**
 * Composable for managing user authentication state.
 *
 * - Stores the Sanctum token in localStorage for persistence across refreshes.
 * - Provides login(), logout(), and reactive user/token/isAuthenticated refs.
 */
export function useAuth() {
    // ---- Reactive state ----
    // Inisialisasi null di server & client agar HTML SSR cocok saat hydration.
    // localStorage dibaca di plugin auth.client.ts setelah mount.
    const user: Ref<User | null> = useState<User | null>('auth_user', () => null)

    const token: Ref<string | null> = useState<string | null>('auth_token', () => null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)

    // ---- Persist helpers ----
    function persistAuth(state: AuthState): void {
        token.value = state.token
        user.value = state.user
        if (import.meta.client) {
            localStorage.setItem('auth_token', state.token ?? '')
            localStorage.setItem('auth_user', JSON.stringify(state.user))
        }
    }

    function persistUser(updated: User): void {
        user.value = updated
        if (import.meta.client) {
            localStorage.setItem('auth_user', JSON.stringify(updated))
        }
    }

    function clearAuth(): void {
        token.value = null
        user.value = null
        if (import.meta.client) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
        }
    }

    // ---- API calls ----

    /**
     * Log in with email and password.
     * On success, stores the token and user; navigates to /dashboard.
     */
    async function login(email: string, password: string): Promise<void> {
        const api = useApi()

        const res = await api.post<LoginResponse>('/login', { email, password })

        if (res.success && res.data) {
            persistAuth({ token: res.data.token, user: res.data.user })
            toast.success(res.message || 'Login berhasil')
            await navigateTo('/dashboard', { replace: true })
        } else {
            throw new Error(res.message || 'Login gagal')
        }
    }

    /**
     * Log out the current user.
     * Calls POST /api/logout on the backend then clears local state.
     */
    async function logout(): Promise<void> {
        try {
            const api = useApi()
            await api.post('/logout')
        } catch {
            // Even if the server call fails, clear local state
        } finally {
            clearAuth()
            toast.info('Anda telah logout')
            await navigateTo('/', { replace: true })
        }
    }

    /**
     * Fetch the authenticated user's profile from GET /api/profile.
     * Useful for validating the token on app init.
     */
    async function fetchProfile(): Promise<void> {
        if (!token.value) return

        try {
            const api = useApi()
            const res = await api.get<User>('/profile')
            if (res.success && res.data) {
                persistUser(res.data)
            }
        } catch {
            // Token is invalid/expired — clear auth
            clearAuth()
        }
    }

    /**
     * Update profile (nama, email, optional password, foto).
     */
    async function updateProfile(
        form: ProfileUpdateForm,
        options?: { foto?: File | null; removeFoto?: boolean },
    ): Promise<User> {
        const api = useApi()
        const formData = new FormData()
        formData.append('nama', form.nama.trim())
        formData.append('email', form.email.trim())

        if (form.password?.trim()) {
            formData.append('current_password', form.current_password ?? '')
            formData.append('password', form.password)
            formData.append('password_confirmation', form.password_confirmation ?? '')
        }

        if (options?.removeFoto) {
            formData.append('remove_foto', '1')
        }

        if (options?.foto) {
            formData.append('foto_profil', options.foto)
        }

        const res = await api.put<User>('/profile', formData)

        if (!res.success || !res.data) {
            throw new Error(res.message || 'Gagal memperbarui profil')
        }

        persistUser(res.data)
        toast.success(res.message || 'Profil berhasil diperbarui')
        return res.data
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        fetchProfile,
        updateProfile,
    }
}
