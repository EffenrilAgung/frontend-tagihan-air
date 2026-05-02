import { useApi } from '~/composables/auth/useApi'
import type { Pembayaran, PembayaranForm, UnpaidBill } from '~/types/billing'

export const useBillingCore = () => {
    const api = useApi()

    /**
     * Fetch all payments.
     */
    const getPembayaran = async (): Promise<Pembayaran[]> => {
        const response = await api.get<Pembayaran[]>('/pembayaran')
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data pembayaran')
        }
        return Array.isArray(response.data) ? response.data : (response.data as any).data ?? []
    }

    /**
     * Fetch a single payment by ID.
     */
    const getPembayaranById = async (id: number): Promise<Pembayaran | null> => {
        const response = await api.get<Pembayaran>(`/pembayaran/${id}`)
        if (!response.success) return null
        return response.data ?? null
    }

    /**
     * Process a payment.
     */
    const createPembayaran = async (data: PembayaranForm): Promise<Pembayaran> => {
        const response = await api.post<Pembayaran>('/pembayaran', {
            pencatatan_meter_id: data.pencatatan_meter_id,
            tanggal_bayar: data.tanggal_bayar,
            metode_bayar: data.metode_bayar,
            catatan: data.catatan || undefined,
        })
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal memproses pembayaran')
        }
        return response.data
    }

    /**
     * Delete / revert a payment.
     */
    const deletePembayaran = async (id: number): Promise<void> => {
        const response = await api.delete(`/pembayaran/${id}`)
        if (!response.success) {
            throw new Error(response.message || 'Gagal menghapus pembayaran')
        }
    }

    /**
     * Fetch all unpaid bills.
     */
    const getUnpaidBills = async (): Promise<UnpaidBill[]> => {
        const response = await api.get<UnpaidBill[]>('/pembayaran/unpaid-bills')
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil tagihan belum dibayar')
        }
        return Array.isArray(response.data) ? response.data : (response.data as any).data ?? []
    }

    /**
     * Fetch payments by date range.
     */
    const getPembayaranByPeriode = async (startDate: string, endDate: string): Promise<Pembayaran[]> => {
        const url = `/pembayaran/by-periode?start_date=${startDate}&end_date=${endDate}`
        const response = await api.get<Pembayaran[]>(url)
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil laporan pembayaran')
        }
        return Array.isArray(response.data) ? response.data : (response.data as any).data ?? []
    }

    /**
     * Fetch payment history for a customer.
     */
    const getPembayaranByPelanggan = async (pelangganId: number): Promise<Pembayaran[]> => {
        const response = await api.get<Pembayaran[]>(`/pelanggan/${pelangganId}/pembayaran`)
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil riwayat pembayaran')
        }
        return Array.isArray(response.data) ? response.data : (response.data as any).data ?? []
    }

    return {
        getPembayaran,
        getPembayaranById,
        createPembayaran,
        deletePembayaran,
        getUnpaidBills,
        getPembayaranByPeriode,
        getPembayaranByPelanggan,
    }
}
