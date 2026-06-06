<template>
    <div>
        <!-- Tabs: horizontal scroll on narrow screens -->
        <div class="mb-4 border-b sm:mb-6">
            <div class="-mx-1 flex gap-1 overflow-x-auto px-1 pb-px sm:gap-6">
                <button v-for="tab in tabs" :key="tab.key" type="button" @click="activeTab = tab.key"
                    class="shrink-0 touch-manipulation whitespace-nowrap px-2 pb-3 text-sm font-medium transition-colors sm:px-0"
                    :class="activeTab === tab.key ? 'relative text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary' : 'text-muted-foreground hover:text-foreground'">
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- Tab: Unpaid Bills -->
        <div v-if="activeTab === 'unpaid'">
            <WrapContent title="Tagihan Belum Dibayar">
                <template #actions>
                    <template v-if="loadingUnpaid">
                        <Skeleton class="h-9 w-40 rounded-md" />
                    </template>
                </template>
                <template #content>
                    <ReusableTable :data="unpaidBills as any" :columns="unpaidColumns" :loading="loadingUnpaid"
                        :skeleton-rows="5"
                        empty-message="Semua tagihan sudah dibayar. Tidak ada tagihan yang belum dibayar." searchable
                        :search-keys="['pelanggan.nama', 'pelanggan.id_pelanggan']"
                        search-placeholder="Cari nama/ID pelanggan..." paginated :page-size="10"
                        :page-size-options="[5, 10, 25, 50]">
                        <template #cell-index="{ row }">
                            {{ (unpaidBills as any[]).indexOf(row as any) + 1 }}
                        </template>
                        <template #cell-pelanggan="{ value }">
                            <div class="flex flex-col">
                                <span class="font-medium">{{ (value as any)?.nama || '-' }}</span>
                                <span class="text-xs text-muted-foreground">{{ (value as any)?.id_pelanggan || ''
                                }}</span>
                            </div>
                        </template>
                        <template #cell-tanggal_pencatatan="{ value }">
                            {{ formatDate(new Date(value as string), dateFormat) }}
                        </template>
                        <template #cell-pemakaian_m3="{ value }">
                            <span class="font-semibold">{{ value }} M³</span>
                        </template>
                        <template #cell-total_tagihan_dasar="{ value }">
                            {{ formatCurrency(value as number) }}
                        </template>
                        <template #cell-denda_rp="{ row }">
                            <span v-if="(row as any).denda_persen > 0" class="text-red-600">
                                {{ formatCurrency((row as any).denda_rp) }}
                                <span class="text-xs">({{ ((row as any).denda_persen * 100).toFixed(0) }}%)</span>
                            </span>
                            <span v-else class="text-muted-foreground">-</span>
                        </template>
                        <template #cell-total_setelah_denda="{ value }">
                            <span class="font-semibold text-primary">{{ formatCurrency(value as number) }}</span>
                        </template>
                        <template #cell-actions="{ row }">
                            <Button size="sm" class="bg-emerald-500 hover:bg-emerald-600 text-white"
                                @click.stop="openBayar(row as any)">
                                Bayar
                            </Button>
                        </template>
                        <template #mobile-actions="{ row }">
                            <div class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                                <Button size="sm" class="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    @click.stop="openBayar(row as any)">
                                    Bayar
                                </Button>
                            </div>
                        </template>
                    </ReusableTable>
                </template>
            </WrapContent>
        </div>

        <!-- Tab: Payment History -->
        <div v-if="activeTab === 'history'">
            <WrapContent title="Riwayat Pembayaran">
                <template #actions>
                    <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
                        <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                            <label class="shrink-0 text-sm text-muted-foreground">Dari</label>
                            <Input type="date" v-model="filterStart" class="min-w-0 flex-1 sm:w-40 sm:flex-none" />
                        </div>
                        <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                            <label class="shrink-0 text-sm text-muted-foreground">Sampai</label>
                            <Input type="date" v-model="filterEnd" class="min-w-0 flex-1 sm:w-40 sm:flex-none" />
                        </div>
                        <div class="flex gap-2">
                            <Button variant="outline" size="sm" class="touch-manipulation flex-1 sm:flex-none" @click="applyFilter">Filter</Button>
                            <Button v-if="filterApplied" variant="ghost" size="sm" class="touch-manipulation flex-1 sm:flex-none" @click="resetFilter">Reset</Button>
                        </div>
                    </div>
                </template>
                <template #content>
                    <ReusableTable :data="pembayaranList as any" :columns="historyColumns" :loading="loadingHistory"
                        :skeleton-rows="5" empty-message="Belum ada riwayat pembayaran." paginated :page-size="10"
                        :page-size-options="[5, 10, 25, 50]">
                        <template #cell-index="{ row }">
                            {{ (pembayaranList as any[]).indexOf(row as any) + 1 }}
                        </template>
                        <template #cell-pelanggan="{ value }">
                            <div class="flex flex-col">
                                <span class="font-medium">{{ (value as any)?.nama || '-' }}</span>
                                <span class="text-xs text-muted-foreground">{{ (value as any)?.id_pelanggan || ''
                                    }}</span>
                            </div>
                        </template>
                        <template #cell-tanggal_bayar="{ value }">
                            <span class="font-medium">{{ formatDate(new Date(value as string), dateFormat) }}</span>
                        </template>
                        <template #cell-metode_bayar="{ value }">
                            <span class="capitalize">{{ value || '-' }}</span>
                        </template>
                        <template #cell-jumlah_dibayar="{ value }">
                            <span class="font-semibold text-primary">{{ formatCurrency(value as number) }}</span>
                        </template>
                        <template #cell-denda_rp="{ row }">
                            <span v-if="(row as any).denda_rp > 0" class="text-red-600">
                                {{ formatCurrency((row as any).denda_rp) }}
                            </span>
                            <span v-else class="text-muted-foreground">-</span>
                        </template>
                        <template #cell-catatan="{ value }">
                            <span class="text-muted-foreground max-w-[200px] truncate block">{{ value || '-' }}</span>
                        </template>
                        <template #cell-actions="{ row }">
                            <Button size="sm" variant="destructive" @click.stop="openDeletePembayaran(row as any)">
                                Hapus
                            </Button>
                        </template>
                        <template #mobile-actions="{ row }">
                            <div class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                                <Button size="sm" variant="destructive" @click.stop="openDeletePembayaran(row as any)">
                                    Hapus
                                </Button>
                            </div>
                        </template>
                    </ReusableTable>
                </template>
            </WrapContent>
        </div>

        <!-- Payment Popup Modal -->
        <template v-if="showPopupBayar">
            <PopupBayar :open="true" :selected-bill="selectedBill" :on-process="handleProcessPayment"
                @close="closePopupBayar" @saved="onPaymentSaved" />
        </template>

        <!-- Delete Payment Confirmation -->
        <AlertDialog v-model:open="showDeleteAlert">
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Pembayaran</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus pembayaran
                        <span class="font-semibold">{{ pembayaranToDelete?.pelanggan?.nama || 'Unknown' }}</span>?
                        Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel :disabled="isDeleting">Batal</AlertDialogCancel>
                    <AlertDialogAction :disabled="isDeleting" class="bg-red-500 hover:bg-red-600 text-white"
                        @click="confirmDelete">
                        <template v-if="isDeleting">
                            <Loader2Icon class="mr-2 size-4 animate-spin" />
                            Menghapus...
                        </template>
                        <template v-else>
                            Ya, Hapus
                        </template>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2Icon } from 'lucide-vue-next'
import WrapContent from '~/components/dashboard/WrapContent.vue'
import Button from '~/components/ui/button/Button.vue'
import Skeleton from '~/components/ui/skeleton/Skeleton.vue'
import Input from '~/components/ui/input/Input.vue'
import ReusableTable from '~/components/dashboard/ReusableTable.vue'
import type { TableColumn } from '~/components/dashboard/ReusableTable.vue'
import type { Pembayaran, PembayaranForm, UnpaidBill } from '~/types/billing'
import PopupBayar from './components/PopupBayar.vue'
import { useBillingCore } from '~/composables/billing/useBilling'
import { formatCurrency, formatDate } from '~/utils/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const dateFormat = 'DD MMMM YYYY'

// Tabs
const tabs = [
    { key: 'unpaid', label: 'Tagihan Belum Dibayar' },
    { key: 'history', label: 'Riwayat Pembayaran' },
]
const activeTab = ref('unpaid')

// Unpaid Bills
const loadingUnpaid = ref(true)
const unpaidBills = ref<UnpaidBill[]>([])
const selectedBill = ref<UnpaidBill | null>(null)
const showPopupBayar = ref(false)

// Payment History
const loadingHistory = ref(true)
const pembayaranList = ref<Pembayaran[]>([])
const filterStart = ref('')
const filterEnd = ref('')
const filterApplied = ref(false)

// Delete Payment
const isDeleting = ref(false)
const showDeleteAlert = ref(false)
const pembayaranToDelete = ref<Pembayaran | null>(null)

const { getPembayaran, createPembayaran, deletePembayaran, getUnpaidBills, getPembayaranByPeriode } = useBillingCore()

// Columns for unpaid bills table
const unpaidColumns: TableColumn[] = [
    { key: 'index', label: 'No', width: '60px', align: 'center' },
    { key: 'tanggal_pencatatan', label: 'Periode', sortable: true, width: '140px' },
    { key: 'pelanggan', label: 'Pelanggan', sortable: false },
    { key: 'pemakaian_m3', label: 'Pemakaian', sortable: true, align: 'right', width: '100px' },
    { key: 'total_tagihan_dasar', label: 'Tagihan', sortable: true, align: 'right', width: '120px', hideOnMobile: true },
    { key: 'denda_rp', label: 'Denda', align: 'right', width: '120px', hideOnMobile: true },
    { key: 'total_setelah_denda', label: 'Total', sortable: true, align: 'right', width: '120px' },
    { key: 'actions', label: 'Aksi', width: '100px', align: 'center' },
]

// Columns for payment history table
const historyColumns: TableColumn[] = [
    { key: 'index', label: 'No', width: '60px', align: 'center' },
    { key: 'tanggal_bayar', label: 'Tgl Bayar', sortable: true, width: '140px' },
    { key: 'pelanggan', label: 'Pelanggan', sortable: false },
    { key: 'metode_bayar', label: 'Metode', width: '100px' },
    { key: 'jumlah_dibayar', label: 'Jumlah', sortable: true, align: 'right', width: '120px' },
    { key: 'denda_rp', label: 'Denda', align: 'right', width: '100px', hideOnMobile: true },
    { key: 'catatan', label: 'Catatan', width: '160px', hideOnMobile: true },
    { key: 'actions', label: 'Aksi', width: '100px', align: 'center' },
]

// Payment popup
const openBayar = (bill: UnpaidBill) => {
    selectedBill.value = bill
    showPopupBayar.value = true
}

const closePopupBayar = () => {
    showPopupBayar.value = false
    selectedBill.value = null
}

const handleProcessPayment = async (form: PembayaranForm): Promise<Pembayaran> => {
    return await createPembayaran(form)
}

const onPaymentSaved = (data: Pembayaran) => {
    // Remove from unpaid bills list
    if (selectedBill.value) {
        unpaidBills.value = unpaidBills.value.filter(b => b.id !== selectedBill.value!.id)
    }
    // Prepend to history
    pembayaranList.value.unshift(data)
    toast.success('Pembayaran berhasil diproses')
    closePopupBayar()
}

// Delete payment
const openDeletePembayaran = (pembayaran: Pembayaran) => {
    pembayaranToDelete.value = pembayaran
    showDeleteAlert.value = true
}

const confirmDelete = async () => {
    const pembayaran = pembayaranToDelete.value
    if (!pembayaran || isDeleting.value) return

    isDeleting.value = true
    try {
        await deletePembayaran(pembayaran.id)
        pembayaranList.value = pembayaranList.value.filter(p => p.id !== pembayaran.id)
        await loadUnpaidBills()
        showDeleteAlert.value = false
        pembayaranToDelete.value = null
        toast.success('Pembayaran berhasil dihapus')
    } catch (error: any) {
        const message = error?.message || 'Gagal menghapus pembayaran'
        toast.error(message)
    } finally {
        isDeleting.value = false
    }
}

// Filter by periode
const applyFilter = async () => {
    if (!filterStart.value && !filterEnd.value) {
        toast.warning('Pilih rentang tanggal terlebih dahulu')
        return
    }

    loadingHistory.value = true
    filterApplied.value = true
    try {
        pembayaranList.value = await getPembayaranByPeriode(
            filterStart.value,
            filterEnd.value
        )
    } catch (error) {
        toast.error('Gagal memfilter pembayaran')
    } finally {
        loadingHistory.value = false
    }
}

const resetFilter = () => {
    filterStart.value = ''
    filterEnd.value = ''
    filterApplied.value = false
    loadPaymentHistory()
}

const loadPaymentHistory = async () => {
    loadingHistory.value = true
    try {
        pembayaranList.value = await getPembayaran()
    } catch (error) {
        toast.error('Gagal memuat riwayat pembayaran')
    } finally {
        loadingHistory.value = false
    }
}

const loadUnpaidBills = async () => {
    loadingUnpaid.value = true
    try {
        unpaidBills.value = await getUnpaidBills()
    } catch (error) {
        toast.error('Gagal memuat tagihan belum dibayar')
    } finally {
        loadingUnpaid.value = false
    }
}

// Reset pembayaranToDelete when alert dialog is dismissed
watch(showDeleteAlert, (isOpen) => {
    if (!isOpen) {
        pembayaranToDelete.value = null
    }
})

onMounted(async () => {
    await loadUnpaidBills()
    await loadPaymentHistory()
})
</script>
