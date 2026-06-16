import { hasStoredAuth } from '~/utils/auth-storage'

/**
 * Global auth middleware.
 *
 * - If the user is NOT authenticated and tries to access a protected route
 *   (under /dashboard), they are redirected to the login page (/).
 * - If the user IS authenticated and is on the login page (/), they are
 *   redirected to /dashboard.
 */
export default defineNuxtRouteMiddleware((to, _from) => {
    // Skip middleware during SSR — auth state only available on client
    if (import.meta.server) {
        return
    }

    const isAuthenticated = hasStoredAuth()

    const protectedRoutePatterns = [
        '/dashboard',
        '/customer',
        '/tarif',
        '/pencatatan-meter',
        '/billing',
        '/reports',
        '/settings',
    ]

    const isProtectedRoute = protectedRoutePatterns.some((pattern) =>
        to.path.startsWith(pattern),
    )

    if (!isAuthenticated && isProtectedRoute) {
        return navigateTo('/', { replace: true })
    }

    if (isAuthenticated && to.path === '/') {
        return navigateTo('/dashboard', { replace: true })
    }
})
