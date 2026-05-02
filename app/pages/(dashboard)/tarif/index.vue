<template>
    <WrapContent title="Daftar Tarif Air">
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
                    Tambah Tarif
                </button>
            </template>
        </template>
        <template #content>
            <ReusableTable :data="tarifs as any" :columns="tableColumns" :loading="loading" :skeleton-rows="4"
                empty-message='Belum ada data tarif. Klik "Tambah Tarif" untuk menambahkan data baru.' searchable
                :search-keys="['nama_kategori']" search-placeholder="Cari nama kategori..." paginated :page-size="10"
                :page-size-options="[5, 10, 25, 50]">
                <!-- Custom cell: Nomor urut -->
                <template #cell-index="{ row, column }">
                    {{ tarifs.indexOf(row as any) + 1 }}
                </template>

                <!-- Custom cell: Harga per M3 (formatted currency) -->
                <template #cell-harga_per_m3="{ value }">
                    {{ formatCurrency(value as number) }}
                </template>

                <!-- Custom cell: Tanggal Update (formatted date) -->
                <template #cell-updated_at="{ value }">
                    {{ formatDate(value as Date, 'DD MMMM YYYY, HH.mm') }}
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
            </ReusableTable>
        </template>
    </WrapContent>

    <!-- Centered Modal (outside WrapContent, so it renders properly) -->
    <template v-if="showPopup">
        <TarifPopup :open="true" :tarif="selectedTarif" @close="closePopup" @save="(id, form) => saveTarif(id, form)" />
    </template>

    <!-- Delete Confirmation AlertDialog -->
    <AlertDialog v-model:open="showDeleteAlert">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Hapus Tarif</AlertDialogTitle>
                <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus tarif
                    <span class="font-semibold">"{{ tarifToDelete?.nama_kategori }}"</span>?
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2Icon } from 'lucide-vue-next'
import WrapContent from '~/components/dashboard/WrapContent.vue';
import Button from '~/components/ui/button/Button.vue';
import Skeleton from '~/components/ui/skeleton/Skeleton.vue';
import ReusableTable from '~/components/dashboard/ReusableTable.vue';
import type { TableColumn } from '~/components/dashboard/ReusableTable.vue';
import { type Tarif, type TarifForm } from '~/types/tarif';
import TarifPopup from './components/popup.vue';
import { useTarifCore } from '~/composables/tarif/useTarif';
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

const loading = ref(true);
const isDeleting = ref(false);
const tarifs = ref<Tarif[]>([]);
const selectedTarif = ref<Tarif | null>(null);
const showPopup = ref(false);
const showDeleteAlert = ref(false);
const tarifToDelete = ref<Tarif | null>(null);

const { getTarif, createTarif, updateTarif, deleteTarif, getTarifById } = useTarifCore()

// Table column definitions
const tableColumns: TableColumn[] = [
    { key: 'index', label: 'No', width: '60px', align: 'center' },
    { key: 'nama_kategori', label: 'Nama Kategori', sortable: true },
    { key: 'harga_per_m3', label: 'Harga M3', sortable: true, align: 'right' },
    { key: 'updated_at', label: 'Tanggal Update', sortable: true, width: '200px', hideOnMobile: true },
    { key: 'actions', label: 'Actions', width: '160px', align: 'center' },
]

const openAdd = () => {
    selectedTarif.value = null;
    showPopup.value = true;
};

const openEdit = async (id: number) => {
    console.log('Opening edit for Tarif ID:', id);
    try {
        const response = await getTarifById(id);
        if (!response.data) {
            throw new Error('Data tarif tidak ditemukan');
        }
        console.log('Fetched Tarif for Edit:', response.data);
        selectedTarif.value = response.data;
        showPopup.value = true;
    } catch (error) {
        console.error('Gagal memuat data tarif untuk edit:', error);
    }
};
console.log('Selected Tarif for Edit:', selectedTarif.value);

const closePopup = () => {
    showPopup.value = false;
    selectedTarif.value = null;
};

const saveTarif = (tarifId: number | null, form: TarifForm) => {
    if (tarifId) {
        // Update existing tarif
        updateTarif(tarifId, form).then((response) => {
            if (response.data) {
                const index = tarifs.value.findIndex(t => t.id === tarifId);
                if (index !== -1) {
                    tarifs.value[index] = response.data;
                }
            }
        }).catch((error) => {
            console.error('Gagal memperbarui tarif:', error);
            // TODO: tampilkan notifikasi error ke user
        }).finally(() => {
            closePopup();
        });
    } else {
        // Add new tarif
        createTarif(form).then((response) => {
            if (response.data) {
                tarifs.value.push(response.data);
            }
        }).catch((error) => {
            console.error('Gagal menambahkan tarif baru:', error);
            // TODO: tampilkan notifikasi error ke user
        }).finally(() => {
            closePopup();
        });
    }
};

const openDelete = (tarif: Tarif) => {
    tarifToDelete.value = tarif;
    showDeleteAlert.value = true;
};

const confirmDelete = async () => {
    const tarif = tarifToDelete.value;
    if (!tarif || isDeleting.value) return;

    isDeleting.value = true;
    try {
        await deleteTarif(tarif.id);
        tarifs.value = tarifs.value.filter(t => t.id !== tarif.id);
        showDeleteAlert.value = false;
        tarifToDelete.value = null;
        toast.success(`Tarif "${tarif.nama_kategori}" berhasil dihapus`);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal menghapus tarif';
        console.error('Gagal menghapus tarif:', error);
        toast.error(message);
    } finally {
        isDeleting.value = false;
    }
};

// Reset tarifToDelete when alert dialog is dismissed (click outside, Escape key, or Cancel)
watch(showDeleteAlert, (isOpen) => {
    if (!isOpen) {
        tarifToDelete.value = null;
    }
});

onMounted(async () => {
    try {
        const data = await getTarif()
        tarifs.value = data
    } catch (error) {
        console.error('Gagal memuat data tarif:', error)
        // TODO: tampilkan notifikasi error ke user
    } finally {
        loading.value = false
    }
});
</script>