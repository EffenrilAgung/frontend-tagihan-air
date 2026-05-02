/**
 * Form shape for creating/editing pelanggan in the frontend.
 */
export interface PelangganForm {
    id_pelanggan: string
    nama: string
    no_hp: string
    tarif_id: number
    status_aktif: boolean
}

/**
 * Frontend Pelanggan model — the shape returned by the composable.
 * Matches the Laravel PelangganResource response.
 */
export interface Pelanggan {
    id: number
    id_pelanggan: string
    nama: string
    no_hp: string
    tarif_id: number
    /** Nested tarif relation (loaded when available) */
    tarif?: {
        id: number
        nama_kategori: string
        harga_per_m3: number
        created_at: string
        updated_at: string
    } | null
    status_aktif: boolean
    created_at: Date
    updated_at: Date
}

/**
 * Raw shape from the Laravel PelangganResource endpoint.
 * Only used internally by the composable for the API→frontend mapping.
 */
export interface PelangganRaw {
    id: number
    id_pelanggan: string
    nama: string
    no_hp: string
    tarif_id: number
    tarif?: {
        id: number
        nama_kategori: string
        harga_per_m3: number
        created_at: string
        updated_at: string
    } | null
    status_aktif: boolean
    created_at: string
    updated_at: string
}
