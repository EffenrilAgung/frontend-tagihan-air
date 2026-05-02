<template>
    <WrapContent title="Pencatatan Meter Air">
        <template #actions>
            <!-- Show skeleton buttons when loading -->
            <template v-if="loading">
                <Skeleton class="h-9 w-28 rounded-md" />
                <Skeleton class="h-9 w-40 rounded-md bg-primary/20" />
            </template>
            <template v-else>
                <button
                    class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    @click="openAdd">
                    <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                        Input Meter Baru
                    </span>
                </button>
            </template>
        </template>
        <template #content>
            <ReusableTable :data="pencatatanList as any" :columns="tableColumns" :loading="loading" :skeleton-rows="5"
                empty-message='Belum ada data pencatatan meter. Klik "Input Meter Baru" untuk menambahkan data pertama.'
                searchable :search-keys="['pelanggan.nama', 'pelanggan.id_pelanggan']"
                search-placeholder="Cari nama/ID pelanggan..." paginated :page-size="10"
                :page-size-options="[5, 10, 25, 50]">
                <!-- Custom cell: Nomor urut -->
                <template #cell-index="{ row, column }">
                    {{ (pencatatanList as any[]).indexOf(row as any) + 1 }}
                </template>

                <!-- Custom cell: Pelanggan -->
                <template #cell-pelanggan="{ value }">
                    <div class="flex flex-col">
                        <span class="font-medium">{{ (value as any)?.nama || '-' }}</span>
                        <span class="text-xs text-muted-foreground">{{ (value as any)?.id_pelanggan || '' }}</span>
                    </div>
                </template>

                <!-- Custom cell: Tanggal -->
                <template #cell-tanggal_pencatatan="{ value }">
                    {{ formatDate(new Date(value as string), 'DD MMMM YYYY') }}
                </template>

                <!-- Custom cell: Pemakaian -->
                <template #cell-pemakaian_m3="{ value }">
                    <span class="font-semibold">{{ value }} M³</span>
                </template>

                <!-- Custom cell: Tagihan Dasar -->
                <template #cell-total_tagihan_dasar="{ value }">
                    {{ formatCurrency(value as number) }}
                </template>

                <!-- Custom cell: Foto -->
                <template #cell-foto_meteran_path="{ row, value }">
                    <div class="flex justify-center">
                        <button v-if="value" @click.stop="openFotoPreview(row as any)"
                            class="rounded-md bg-muted p-1.5 hover:bg-muted/80 transition-colors"
                            title="Lihat foto meteran">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <rect width="18" height="14" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </button>
                        <span v-else class="text-muted-foreground">-</span>
                    </div>
                </template>

                <!-- Custom cell: Status Bayar -->
                <template #cell-status_bayar="{ value }">
                    <span :class="[
                        'rounded-full px-3 py-1 text-xs font-medium',
                        value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]">
                        {{ value ? 'Lunas' : 'Belum Bayar' }}
                    </span>
                </template>

                <!-- Custom cell: Tanggal Update -->
                <template #cell-updated_at="{ value }">
                    {{ formatDate(typeof value === 'string' ? new Date(value) : (value as Date), 'DD MMMM YYYY, HH.mm')
                    }}
                </template>

                <!-- Custom cell: Actions -->
                <template #cell-actions="{ row }">
                    <div class="flex items-center gap-2">
                        <Button size="sm" class="bg-green-500 hover:bg-green-600 text-white"
                            @click.stop="openEdit((row as any).id)">
                            Edit
                        </Button>
                        <Button size="sm" variant="destructive" @click.stop="openDelete(row as any)">
                            Delete
                        </Button>
                    </div>
                </template>

                <!-- Mobile actions -->
                <template #mobile-actions="{ row }">
                    <div class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                        <Button size="sm" class="bg-green-500 hover:bg-green-600 text-white"
                            @click.stop="openEdit((row as any).id)">
                            Edit
                        </Button>
                        <Button size="sm" variant="destructive" @click.stop="openDelete(row as any)">
                            Delete
                        </Button>
                    </div>
                </template>
            </ReusableTable>
        </template>
    </WrapContent>

    <!-- Popup Modal -->
    <template v-if="showPopup">
        <PencatatanMeterPopup :open="true" :pencatatan="selectedPencatatan" :pelanggan-options="pelangganOptions"
            :last-meter-readings="lastMeterReadings" :on-create="handleCreate" :on-update="handleUpdate"
            @close="closePopup" @saved="onSaved" />
    </template>


    <!-- Delete Confirmation AlertDialog -->
    <AlertDialog v-model:open="showDeleteAlert">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Hapus Pencatatan Meter</AlertDialogTitle>
                <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus pencatatan meter pelanggan
                    <span class="font-semibold">"{{ pencatatanToDelete?.pelanggan?.nama || 'Unknown' }}"</span>?
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

    <!-- Foto Preview Dialog -->
    <Dialog v-model:open="showFotoPreview">
        <DialogContent class="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Foto Meteran</DialogTitle>
                <DialogDescription>
                    Pelanggan: {{ fotoPreviewPelanggan }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex justify-center">
                <img v-if="fotoPreviewUrl" :src="fotoPreviewUrl" alt="Foto meteran"
                    class="max-h-96 rounded-md border object-contain" />
                <span v-else class="text-muted-foreground">Tidak ada foto tersedia</span>
            </div>
            <DialogFooter>
                <Button variant="outline" @click="showFotoPreview = false">Tutup</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2Icon } from 'lucide-vue-next'
import WrapContent from '~/components/dashboard/WrapContent.vue';
import Button from '~/components/ui/button/Button.vue';
import Skeleton from '~/components/ui/skeleton/Skeleton.vue';
import ReusableTable from '~/components/dashboard/ReusableTable.vue';
import type { TableColumn } from '~/components/dashboard/ReusableTable.vue';
import { type PencatatanMeter, type PencatatanMeterForm } from '~/types/pencatatan-meter';
import type { Pelanggan } from '~/types/customers';
import PencatatanMeterPopup from './components/popup.vue';
import { usePencatatanMeterCore } from '~/composables/pencatatan-meter/usePencatatanMeter';
import { useCustomerCore } from '~/composables/customer/useCostumer';
import { formatCurrency, formatDate } from '~/utils/utils';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

const loading = ref(true);
const isDeleting = ref(false);
const pencatatanList = ref<PencatatanMeter[]>([]);
const selectedPencatatan = ref<PencatatanMeter | null>(null);
const showPopup = ref(false);
const showDeleteAlert = ref(false);
const pencatatanToDelete = ref<PencatatanMeter | null>(null);
const showFotoPreview = ref(false);
const fotoPreviewUrl = ref<string | null>(null);
const fotoPreviewPelanggan = ref('');

const { getPencatatanMeter, createPencatatanMeter, updatePencatatanMeter, deletePencatatanMeter, getPencatatanMeterById } = usePencatatanMeterCore()
const { getCustomers } = useCustomerCore()

const pelangganOptions = ref<Pelanggan[]>([])

// Build map of pelanggan_id -> last meter_akhir for auto-fill
const lastMeterReadings = computed<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    for (const item of pencatatanList.value) {
        const pid = item.pelanggan_id
        if (pid && (!map[pid] || item.meter_akhir > map[pid])) {
            map[pid] = item.meter_akhir
        }
    }
    return map
})

// Table column definitions
const tableColumns: TableColumn[] = [
    { key: 'index', label: 'No', width: '60px', align: 'center' },
    { key: 'tanggal_pencatatan', label: 'Tanggal', sortable: true, width: '140px' },
    { key: 'pelanggan', label: 'Pelanggan', sortable: false },
    { key: 'meter_awal', label: 'Meter Awal', sortable: true, align: 'right', width: '100px' },
    { key: 'meter_akhir', label: 'Meter Akhir', sortable: true, align: 'right', width: '100px' },
    { key: 'pemakaian_m3', label: 'Pemakaian', sortable: true, align: 'right', width: '100px' },
    { key: 'total_tagihan_dasar', label: 'Tagihan', sortable: true, align: 'right', width: '120px', hideOnMobile: true },
    { key: 'foto_meteran_path', label: 'Foto', width: '60px', align: 'center' },
    { key: 'status_bayar', label: 'Status', width: '120px', align: 'center' },
    { key: 'updated_at', label: 'Update', sortable: true, width: '160px', hideOnMobile: true },
    { key: 'actions', label: 'Actions', width: '160px', align: 'center' },
]

const openAdd = () => {
    selectedPencatatan.value = null;
    showPopup.value = true;
};

const openEdit = async (id: number) => {
    try {
        const response = await getPencatatanMeterById(id);
        if (!response.data) {
            throw new Error('Data pencatatan meter tidak ditemukan');
        }
        selectedPencatatan.value = response.data;
        showPopup.value = true;
    } catch (error) {
        console.error('Gagal memuat data pencatatan untuk edit:', error);
        toast.error('Gagal memuat data pencatatan meter');
    }
};

const closePopup = () => {
    showPopup.value = false;
    selectedPencatatan.value = null;
};

const handleCreate = async (form: PencatatanMeterForm): Promise<PencatatanMeter> => {
    const response = await createPencatatanMeter(form)
    if (!response.data) {
        throw new Error(response.message || 'Gagal menyimpan pencatatan meter')
    }
    return response.data
}

const handleUpdate = async (id: number, form: PencatatanMeterForm): Promise<PencatatanMeter> => {
    const response = await updatePencatatanMeter(id, form)
    if (!response.data) {
        throw new Error(response.message || 'Gagal memperbarui pencatatan meter')
    }
    return response.data
}

const onSaved = (pencatatan: PencatatanMeter) => {
    const index = pencatatanList.value.findIndex(p => p.id === pencatatan.id)
    if (index !== -1) {
        pencatatanList.value[index] = pencatatan
        toast.success('Pencatatan meter berhasil diperbarui')
    } else {
        pencatatanList.value.push(pencatatan)
        toast.success('Pencatatan meter berhasil disimpan')
    }
    closePopup()
};


const openDelete = (pencatatan: PencatatanMeter) => {
    pencatatanToDelete.value = pencatatan;
    showDeleteAlert.value = true;
};

const confirmDelete = async () => {
    const pencatatan = pencatatanToDelete.value;
    if (!pencatatan || isDeleting.value) return;

    isDeleting.value = true;
    try {
        await deletePencatatanMeter(pencatatan.id);
        pencatatanList.value = pencatatanList.value.filter(p => p.id !== pencatatan.id);
        showDeleteAlert.value = false;
        pencatatanToDelete.value = null;
        toast.success('Pencatatan meter berhasil dihapus');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal menghapus pencatatan meter';
        console.error('Gagal menghapus pencatatan:', error);
        toast.error(message);
    } finally {
        isDeleting.value = false;
    }
};

const openFotoPreview = (pencatatan: PencatatanMeter) => {
    fotoPreviewUrl.value = pencatatan.foto_meteran_path;
    fotoPreviewPelanggan.value = pencatatan.pelanggan?.nama || 'Unknown';
    showFotoPreview.value = true;
};

// Reset pencatatanToDelete when alert dialog is dismissed
watch(showDeleteAlert, (isOpen) => {
    if (!isOpen) {
        pencatatanToDelete.value = null;
    }
});

onMounted(async () => {
    try {
        // Load pelanggan options for the popup form
        const pelangganData = await getCustomers()
        // Only show active customers
        pelangganOptions.value = pelangganData.filter(p => p.status_aktif)

        // Load pencatatan meter
        const data = await getPencatatanMeter()
        pencatatanList.value = data
    } catch (error) {
        console.error('Gagal memuat data:', error)
        toast.error('Gagal memuat data pencatatan meter');
    } finally {
        loading.value = false
    }
});
</script>
