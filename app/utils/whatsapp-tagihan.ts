import type { PencatatanMeter } from '~/types/pencatatan-meter'

const DENDA_PROYEKSI_PERSEN = 10

export function formatNumberWa(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatRpWa(value: number): string {
  return `Rp ${formatNumberWa(value)}`
}

export function resolveFotoUrl(path: string | null | undefined, apiBase: string): string | null {
  if (!path) return null

  const origin = apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '')

  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path)
      if (url.pathname.includes('/storage/')) {
        return `${origin}${url.pathname}`
      }
    } catch {
      return path
    }
    return path
  }

  const normalized = path.replace(/^\/+/, '').replace(/^storage\//, '')
  return `${origin}/storage/${normalized}`
}

export function normalizeWhatsAppPhone(noHp: string | null | undefined): string | null {
  if (!noHp) return null

  const digits = noHp.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

export function buildTagihanWaMessage(pencatatan: PencatatanMeter): string {
  const nama = (pencatatan.pelanggan?.nama ?? 'Pelanggan').toUpperCase()
  const pemakaian = pencatatan.pemakaian_m3
  const tarif = pencatatan.tarif_saat_ini
  const totalDasar = pencatatan.total_tagihan_dasar
  const totalDenda = pencatatan.hasil_setelah_denda
    ?? Math.round(totalDasar * (1 + DENDA_PROYEKSI_PERSEN / 100))

  return [
    '[foto meteran]',
    nama,
    `${pencatatan.meter_akhir} - ${pencatatan.meter_awal} = ${pemakaian}`,
    `${pemakaian} × ${formatNumberWa(tarif)} = ${formatRpWa(totalDasar)}`,
    `Jika denda ${DENDA_PROYEKSI_PERSEN}% = ${formatRpWa(totalDenda)}`,
  ].join('\n')
}

export function openWhatsAppPersonalShare(options: { phone?: string | null; text: string }): boolean {
  const normalized = normalizeWhatsAppPhone(options.phone)
  if (!normalized) return false

  const encoded = encodeURIComponent(options.text)
  window.open(`https://wa.me/${normalized}?text=${encoded}`, '_blank', 'noopener,noreferrer')
  return true
}

export async function fetchFotoBlob(
  pencatatan: PencatatanMeter,
  apiBase: string,
): Promise<Blob | null> {
  const fotoUrl = resolveFotoUrl(pencatatan.foto_meteran_path, apiBase)
  if (!fotoUrl) return null

  try {
    const response = await fetch(fotoUrl)
    if (!response.ok) return null
    return await response.blob()
  } catch {
    return null
  }
}

/** Salin teks tagihan; jika ada foto, sertakan gambar di clipboard (browser mendukung). */
export async function copyTagihanToClipboard(
  pencatatan: PencatatanMeter,
  apiBase: string,
): Promise<'text-and-image' | 'text-only'> {
  const text = buildTagihanWaMessage(pencatatan)
  const imageBlob = await fetchFotoBlob(pencatatan, apiBase)

  if (imageBlob && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    const mime = imageBlob.type || 'image/jpeg'
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          [mime]: imageBlob,
        }),
      ])
      return 'text-and-image'
    } catch {
      // Lanjut ke fallback teks saja
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
  }

  return 'text-only'
}
