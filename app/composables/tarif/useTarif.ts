
import { useApi } from '~/composables/auth/useApi'
import type { ResponseWithServer } from '~/types/response-server'
import type { Tarif, TarifForm } from '~/types/tarif'

export const useTarifCore = () => {
    const api = useApi()

    /**
     * Fetch all tarif from the backend.
     * The API returns a Laravel Resource Collection wrapped inside `ResponseWithServer`.
     */
    const getTarif = async (): Promise<Tarif[]> => {
        const response = await api.get<Tarif[]>('/tarif')

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data tarif')
        }

        return response.data
    }

    /**
     * Create a new tarif.
     * Sends `harga_per_m3` to the API (mapped from `harga_m2` in the form).
     */
    const createTarif = async (form: TarifForm): Promise<ResponseWithServer<Tarif>> => {
        const response = await api.post<Tarif>('/tarif', {
            nama_kategori: form.nama_kategori,
            harga_per_m3: form.harga_m2,
        })

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal membuat tarif baru')
        }

        return response
    }

    /**
     * Update an existing tarif.
     */
    const updateTarif = async (id: number, form: TarifForm): Promise<ResponseWithServer<Tarif>> => {
        const response = await api.put<Tarif>(`/tarif/${id}`, {
            nama_kategori: form.nama_kategori,
            harga_per_m3: form.harga_m2,
        })

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal memperbarui tarif')
        }

        return response
    }

    /**
     * Fetch a single tarif by ID.
     */
    const getTarifById = async (id: number): Promise<ResponseWithServer<Tarif>> => {
        const response = await api.get<Tarif>(`/tarif/${id}`)

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data tarif')
        }

        return response
    }

    /**
     * Delete a tarif by ID.
     */
    const deleteTarif = async (id: number): Promise<{ status: boolean; message?: string }> => {
        const response = await api.delete(`/tarif/${id}`)

        if (!response.success) {
            throw new Error(response.message || 'Gagal menghapus tarif')
        }

        return { status: true, message: response.message }
    }

    return { getTarif, createTarif, updateTarif, deleteTarif, getTarifById }
}
