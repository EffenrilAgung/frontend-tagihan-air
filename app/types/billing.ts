export interface Pembayaran {
    id: number
    pencatatan_meter_id: number
    pelanggan_id: number
    pelanggan?: {
        id: number
        id_pelanggan: string
        nama: string
        no_hp: string
    }
    pencatatan_meter?: {
        id: number
        tanggal_pencatatan: string
        meter_awal: number
        meter_akhir: number
        pemakaian_m3: number
        total_tagihan_dasar: number
    }
    jumlah_tagihan: number
    denda_persen: number
    denda_rp: number
    jumlah_dibayar: number
    tanggal_bayar: string
    metode_bayar: string
    catatan: string | null
    created_at: string
    updated_at: string
}

export interface PembayaranForm {
    pencatatan_meter_id: number | null
    tanggal_bayar: string
    metode_bayar: string
    catatan: string
}

export interface UnpaidBill {
    id: number
    pelanggan: {
        id: number
        id_pelanggan: string
        nama: string
        no_hp: string
    } | null
    tanggal_pencatatan: string
    meter_awal: number
    meter_akhir: number
    pemakaian_m3: number
    total_tagihan_dasar: number
    denda_persen: number
    denda_rp: number
    total_setelah_denda: number
    status_bayar: boolean
}

export interface LaporanBayarItem {
    id: number
    pelanggan: { nama: string; id_pelanggan: string } | null
    jumlah_tagihan: number
    denda_rp: number
    jumlah_dibayar: number
    tanggal_bayar: string
    metode_bayar: string
}
