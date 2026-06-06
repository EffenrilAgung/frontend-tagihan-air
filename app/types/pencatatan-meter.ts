/**
 * Form shape for creating/editing pencatatan meter in the frontend.
 */
export interface PencatatanMeterForm {
    pelanggan_id: number
    tanggal_pencatatan: string
    meter_awal: number
    meter_akhir: number
    foto_meteran?: File | null
}

/**
 * Frontend PencatatanMeter model — the shape returned by the composable.
 * Matches the Laravel PencatatanMeterResource response.
 */
export interface PencatatanMeter {
    id: number
    pelanggan_id: number
    /** Nested pelanggan relation (loaded when available) */
    pelanggan?: {
        id: number
        id_pelanggan: string
        nama: string
        no_hp: string
        tarif?: {
            id: number
            nama_kategori: string
            harga_per_m3: number
        } | null
    } | null
    tanggal_pencatatan: string
    meter_awal: number
    meter_akhir: number
    pemakaian_m3: number
    tarif_saat_ini: number
    total_tagihan_dasar: number
    denda_persen: number | null
    hasil_pembulatan: number
    hasil_setelah_denda: number | null
    foto_meteran_path: string | null
    status_bayar: boolean
    created_at: Date
    updated_at: Date
}

/**
 * Raw shape from the Laravel PencatatanMeterResource endpoint.
 * Only used internally by the composable for the API→frontend mapping.
 */
export interface PencatatanMeterRaw {
    id: number
    pelanggan_id: number
    pelanggan?: {
        id: number
        id_pelanggan: string
        nama: string
        no_hp: string
        tarif?: {
            id: number
            nama_kategori: string
            harga_per_m3: number
        } | null
    } | null
    tanggal_pencatatan: string
    meter_awal: number
    meter_akhir: number
    pemakaian_m3: number
    tarif_saat_ini: number
    total_tagihan_dasar: number
    denda_persen: number | null
    hasil_pembulatan: number
    hasil_setelah_denda: number | null
    foto_meteran_path: string | null
    status_bayar: boolean
    created_at: string
    updated_at: string
}
