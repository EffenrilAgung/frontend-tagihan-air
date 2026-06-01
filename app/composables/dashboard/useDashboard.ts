import { useCustomerCore } from '~/composables/customer/useCostumer'
import { useBillingCore } from '~/composables/billing/useBilling'
import { usePencatatanMeterCore } from '~/composables/pencatatan-meter/usePencatatanMeter'
import type { Pelanggan } from '~/types/customers'
import type { PencatatanMeter } from '~/types/pencatatan-meter'

export interface DashboardStats {
    totalRevenue: number
    activeCustomers: number
    pendingBills: number
    avgConsumption: number
    collectionRate: number
    overdueAmount: number
}

export interface RecentCustomerRow {
    name: string
    meter: string
    reading: string
    status: string
    statusClass: string
}

export interface ConsumptionMonth {
    label: string
    totalM3: number
}

export interface DashboardActivity {
    label: string
    time: string
    dotClass: string
}

function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime()
    const minutes = Math.floor(diffMs / 60000)
    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes} menit lalu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam lalu`
    const days = Math.floor(hours / 24)
    return `${days} hari lalu`
}

function buildRecentCustomers(
    pelanggan: Pelanggan[],
    pencatatan: PencatatanMeter[],
): RecentCustomerRow[] {
    const lastMeterByPelanggan = new Map<number, number>()
    for (const row of pencatatan) {
        const pid = row.pelanggan_id
        if (!pid) continue
        const current = lastMeterByPelanggan.get(pid) ?? -1
        if (row.meter_akhir >= current) {
            lastMeterByPelanggan.set(pid, row.meter_akhir)
        }
    }

    return [...pelanggan]
        .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
        .slice(0, 5)
        .map((p) => {
            const meterAkhir = lastMeterByPelanggan.get(p.id)
            const isActive = p.status_aktif
            const hasReading = meterAkhir !== undefined
            let status = 'Tidak Aktif'
            let statusClass = 'bg-red-100 text-red-800'
            if (isActive && hasReading) {
                status = 'Active'
                statusClass = 'bg-green-100 text-green-800'
            } else if (isActive) {
                status = 'Pending'
                statusClass = 'bg-amber-100 text-amber-800'
            }
            return {
                name: p.nama,
                meter: p.id_pelanggan,
                reading: hasReading ? `${meterAkhir} m³` : '—',
                status,
                statusClass,
            }
        })
}

function buildConsumptionTrend(pencatatan: PencatatanMeter[]): ConsumptionMonth[] {
    const monthMap = new Map<string, number>()
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    for (const row of pencatatan) {
        const d = new Date(row.tanggal_pencatatan)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthMap.set(key, (monthMap.get(key) ?? 0) + (row.pemakaian_m3 ?? 0))
    }

    const sortedKeys = [...monthMap.keys()].sort().slice(-6)
    return sortedKeys.map((key) => {
        const [year, month] = key.split('-')
        const label = `${monthLabels[Number(month) - 1]} ${year}`
        return { label, totalM3: monthMap.get(key) ?? 0 }
    })
}

function buildActivities(
    pelanggan: Pelanggan[],
    pencatatan: PencatatanMeter[],
    pembayaranCount: number,
): DashboardActivity[] {
    const items: { at: Date; label: string; dotClass: string }[] = []

    for (const p of pelanggan.slice(0, 3)) {
        items.push({
            at: p.created_at,
            label: `Pelanggan baru: ${p.nama}`,
            dotClass: 'bg-green-500',
        })
    }
    for (const pm of pencatatan.slice(0, 3)) {
        items.push({
            at: pm.created_at,
            label: `Pencatatan meter: ${pm.pelanggan?.nama ?? 'Pelanggan'}`,
            dotClass: 'bg-blue-500',
        })
    }
    if (pembayaranCount > 0) {
        items.push({
            at: new Date(),
            label: `${pembayaranCount} pembayaran tercatat`,
            dotClass: 'bg-amber-500',
        })
    }

    return items
        .sort((a, b) => b.at.getTime() - a.at.getTime())
        .slice(0, 4)
        .map((item) => ({
            label: item.label,
            time: formatRelativeTime(item.at),
            dotClass: item.dotClass,
        }))
}

export function useDashboard() {
    const { getCustomers } = useCustomerCore()
    const { getPembayaran, getUnpaidBills } = useBillingCore()
    const { getPencatatanMeter } = usePencatatanMeterCore()

    const loading = ref(true)
    const error = ref<string | null>(null)

    const stats = ref<DashboardStats>({
        totalRevenue: 0,
        activeCustomers: 0,
        pendingBills: 0,
        avgConsumption: 0,
        collectionRate: 0,
        overdueAmount: 0,
    })

    const recentCustomers = ref<RecentCustomerRow[]>([])
    const consumptionTrend = ref<ConsumptionMonth[]>([])
    const activities = ref<DashboardActivity[]>([])

    async function loadDashboard() {
        loading.value = true
        error.value = null
        try {
            const [pelanggan, pembayaran, unpaid, pencatatan] = await Promise.all([
                getCustomers(),
                getPembayaran(),
                getUnpaidBills(),
                getPencatatanMeter(),
            ])

            const totalRevenue = pembayaran.reduce((sum, p) => sum + (p.jumlah_dibayar ?? 0), 0)
            const activeCustomers = pelanggan.filter((p) => p.status_aktif).length
            const pendingBills = unpaid.length
            const totalPemakaian = pencatatan.reduce((sum, p) => sum + (p.pemakaian_m3 ?? 0), 0)
            const avgConsumption = pencatatan.length
                ? Math.round(totalPemakaian / pencatatan.length)
                : 0
            const totalBills = pembayaran.length + unpaid.length
            const collectionRate = totalBills
                ? Math.round((pembayaran.length / totalBills) * 1000) / 10
                : 100
            const overdueAmount = unpaid.reduce((sum, b) => sum + (b.total_setelah_denda ?? 0), 0)

            const todayRevenue = pembayaran
                .filter((p) => {
                    const d = new Date(p.tanggal_bayar)
                    const now = new Date()
                    return d.toDateString() === now.toDateString()
                })
                .reduce((sum, p) => sum + (p.jumlah_dibayar ?? 0), 0)

            stats.value = {
                totalRevenue,
                activeCustomers,
                pendingBills,
                avgConsumption,
                collectionRate,
                overdueAmount,
            }

            recentCustomers.value = buildRecentCustomers(pelanggan, pencatatan)
            consumptionTrend.value = buildConsumptionTrend(pencatatan)
            activities.value = buildActivities(pelanggan, pencatatan, pembayaran.length)

            // Expose today revenue via stats extension for aside
            ;(stats.value as DashboardStats & { revenueToday?: number }).revenueToday = todayRevenue
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Gagal memuat data dashboard'
            error.value = message
            throw e
        } finally {
            loading.value = false
        }
    }

    const revenueToday = computed(() => {
        return (stats.value as DashboardStats & { revenueToday?: number }).revenueToday ?? 0
    })

    return {
        loading,
        error,
        stats,
        revenueToday,
        recentCustomers,
        consumptionTrend,
        activities,
        loadDashboard,
    }
}
