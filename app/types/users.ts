/**
 * Type definitions for user and auth responses from the Laravel backend.
 */
export interface User {
    id: number
    nama: string
    email: string
    peran: string
    foto_profil: string | null
    created_at: string
    updated_at: string
}

export interface LoginResponse {
    user: User
    token: string
}

export interface AuthState {
    user: User | null
    token: string | null
}
