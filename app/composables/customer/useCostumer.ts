import { useApi } from '~/composables/auth/useApi'
import type { ResponseWithServer } from '~/types/response-server'
import type { Pelanggan, PelangganForm, PelangganRaw } from '~/types/customers'

export const useCustomerCore = () => {
    const api = useApi()

    /**
     * Fetch all customers from the backend.
     * The API returns a Laravel Resource Collection.
     */
    const getCustomers = async (): Promise<Pelanggan[]> => {
        const response = await api.get<PelangganRaw[]>('/pelanggan')

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data pelanggan')
        }

        // Parse raw dates into Date objects
        const rawData = Array.isArray(response.data) ? response.data : (response.data as any).data ?? []
        return rawData.map((item: PelangganRaw) => ({
            ...item,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }))
    }

    /**
     * Create a new customer.
     */
    const createCustomer = async (form: PelangganForm): Promise<ResponseWithServer<Pelanggan>> => {
        const response = await api.post<Pelanggan>('/pelanggan', {
            id_pelanggan: form.id_pelanggan,
            nama: form.nama,
            no_hp: form.no_hp,
            tarif_id: form.tarif_id,
            status_aktif: form.status_aktif,
        })

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal membuat pelanggan baru')
        }

        return response
    }

    /**
     * Update an existing customer.
     */
    const updateCustomer = async (id: number, form: PelangganForm): Promise<ResponseWithServer<Pelanggan>> => {
        const response = await api.put<Pelanggan>(`/pelanggan/${id}`, {
            id_pelanggan: form.id_pelanggan,
            nama: form.nama,
            no_hp: form.no_hp,
            tarif_id: form.tarif_id,
            status_aktif: form.status_aktif,
        })

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal memperbarui pelanggan')
        }

        return response
    }

    /**
     * Fetch a single customer by ID.
     */
    const getCustomerById = async (id: number): Promise<ResponseWithServer<Pelanggan>> => {
        const response = await api.get<Pelanggan>(`/pelanggan/${id}`)

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data pelanggan')
        }

        return response
    }

    /**
     * Delete a customer by ID.
     */
    const deleteCustomer = async (id: number): Promise<{ status: boolean; message?: string }> => {
        const response = await api.delete(`/pelanggan/${id}`)

        if (!response.success) {
            throw new Error(response.message || 'Gagal menghapus pelanggan')
        }

        return { status: true, message: response.message }
    }

    return { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerById }
}
