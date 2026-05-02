/**
 * Global auth middleware.
 *
 * - If the user is NOT authenticated and tries to access a protected route
 *   (under /dashboard), they are redirected to the login page (/).
 * - If the user IS authenticated and is on the login page (/), they are
 *   redirected to /dashboard.
 */
export default defineNuxtRouteMiddleware((to, _from) => {
    // Skip middleware during SSR for auth check since localStorage isn't available
    if (import.meta.server) {
        return
    }

    const token = localStorage.getItem('auth_token')
    const isAuthenticated = !!token

    // Protected routes: all routes under /dashboard (or other app routes)
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

    // Redirect unauthenticated users away from protected routes
    if (!isAuthenticated && isProtectedRoute) {
        return navigateTo('/', { replace: true })
    }

    // Redirect authenticated users away from the login page
    if (isAuthenticated && to.path === '/') {
        return navigateTo('/dashboard', { replace: true })
    }
})
