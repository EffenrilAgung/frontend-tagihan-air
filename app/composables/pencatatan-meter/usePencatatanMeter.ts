import { useApi } from '~/composables/auth/useApi'
import type { ResponseWithServer } from '~/types/response-server'
import type { PencatatanMeter, PencatatanMeterForm, PencatatanMeterRaw } from '~/types/pencatatan-meter'

export const usePencatatanMeterCore = () => {
    const api = useApi()

    /**
     * Fetch all meter readings from the backend.
     */
    const getPencatatanMeter = async (): Promise<PencatatanMeter[]> => {
        const response = await api.get<PencatatanMeterRaw[]>('/pencatatan-meter')

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data pencatatan meter')
        }

        const rawData = Array.isArray(response.data) ? response.data : (response.data as any).data ?? []
        return rawData.map((item: PencatatanMeterRaw) => ({
            ...item,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }))
    }

    /**
     * Create a new meter reading.
     */
    const createPencatatanMeter = async (form: PencatatanMeterForm): Promise<ResponseWithServer<PencatatanMeter>> => {
        const formData = new FormData()
        formData.append('pelanggan_id', String(form.pelanggan_id))
        formData.append('tanggal_pencatatan', form.tanggal_pencatatan)
        formData.append('meter_awal', String(form.meter_awal))
        formData.append('meter_akhir', String(form.meter_akhir))
        if (form.foto_meteran) {
            formData.append('foto_meteran', form.foto_meteran)
        }

        const response = await api.post<PencatatanMeter>('/pencatatan-meter', formData)

        if (!response.success || !response.data) {
            throw { ...response, message: response.message || 'Gagal menyimpan pencatatan meter' }
        }

        return response
    }

    /**
     * Update an existing meter reading.
     */
    const updatePencatatanMeter = async (id: number, form: PencatatanMeterForm): Promise<ResponseWithServer<PencatatanMeter>> => {
        // Use POST with _method=PUT for FormData file upload support
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('pelanggan_id', String(form.pelanggan_id))
        formData.append('tanggal_pencatatan', form.tanggal_pencatatan)
        formData.append('meter_awal', String(form.meter_awal))
        formData.append('meter_akhir', String(form.meter_akhir))
        if (form.foto_meteran) {
            formData.append('foto_meteran', form.foto_meteran)
        }

        const response = await api.post<PencatatanMeter>(`/pencatatan-meter/${id}`, formData)

        if (!response.success || !response.data) {
            throw { ...response, message: response.message || 'Gagal memperbarui pencatatan meter' }
        }

        return response
    }

    /**
     * Fetch a single meter reading by ID.
     */
    const getPencatatanMeterById = async (id: number): Promise<ResponseWithServer<PencatatanMeter>> => {
        const response = await api.get<PencatatanMeter>(`/pencatatan-meter/${id}`)

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data pencatatan meter')
        }

        return response
    }

    /**
     * Delete a meter reading by ID.
     */
    const deletePencatatanMeter = async (id: number): Promise<{ status: boolean; message?: string }> => {
        const response = await api.delete(`/pencatatan-meter/${id}`)

        if (!response.success) {
            throw new Error(response.message || 'Gagal menghapus pencatatan meter')
        }

        return { status: true, message: response.message }
    }

    /**
     * Upload foto untuk OCR.
     */
    const ocrUpload = async (foto: File): Promise<ResponseWithServer<{
        foto_path: string
        meter_awal: number
        meter_akhir: number
        confidence: number
    }>> => {
        const formData = new FormData()
        formData.append('foto_meteran', foto)

        const response = await api.post<{
            foto_path: string
            meter_awal: number
            meter_akhir: number
            confidence: number
        }>('/ocr-upload', formData)

        if (!response.success) {
            throw new Error(response.message || 'Gagal memproses OCR')
        }

        return response
    }

    return {
        getPencatatanMeter,
        createPencatatanMeter,
        updatePencatatanMeter,
        deletePencatatanMeter,
        getPencatatanMeterById,
        ocrUpload,
    }
}
