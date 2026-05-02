/**
 * Form shape for creating/editing tarif in the frontend.
 * Uses `harga_m2` as the frontend field name (mapped to `harga_per_m3` for the API).
 */
export interface TarifForm {
    nama_kategori: string
    harga_m2: number
}

/**
 * Frontend Tarif model — the shape returned by the composable.
 * Field `harga_m2` is mapped from the API's `harga_per_m3` in the composable layer.
 */
export interface Tarif {
    id: number
    nama_kategori: string
    harga_per_m3: number
    created_at: Date
    updated_at: Date
}

/**
 * Raw shape from the Laravel TarifResource endpoint.
 * Only used internally by the composable for the API→frontend mapping.
 */
export interface TarifRaw {
    id: number
    nama_kategori: string
    harga_per_m3: number
    created_at: string
    updated_at: string
}
