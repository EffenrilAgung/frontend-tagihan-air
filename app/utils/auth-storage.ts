const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function migrateLegacyLocalStorage(): void {
    if (!import.meta.client) return

    const legacyToken = localStorage.getItem(TOKEN_KEY)
    if (legacyToken && !sessionStorage.getItem(TOKEN_KEY)) {
        sessionStorage.setItem(TOKEN_KEY, legacyToken)
        localStorage.removeItem(TOKEN_KEY)
    }

    const legacyUser = localStorage.getItem(USER_KEY)
    if (legacyUser && !sessionStorage.getItem(USER_KEY)) {
        sessionStorage.setItem(USER_KEY, legacyUser)
        localStorage.removeItem(USER_KEY)
    }
}

export function getStoredToken(): string | null {
    if (!import.meta.client) return null
    migrateLegacyLocalStorage()
    return sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredUserRaw(): string | null {
    if (!import.meta.client) return null
    migrateLegacyLocalStorage()
    return sessionStorage.getItem(USER_KEY)
}

export function setStoredToken(token: string): void {
    if (!import.meta.client) return
    sessionStorage.setItem(TOKEN_KEY, token)
}

export function setStoredUser(userJson: string): void {
    if (!import.meta.client) return
    sessionStorage.setItem(USER_KEY, userJson)
}

export function clearStoredAuth(): void {
    if (!import.meta.client) return
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export function hasStoredAuth(): boolean {
    return !!getStoredToken()
}
