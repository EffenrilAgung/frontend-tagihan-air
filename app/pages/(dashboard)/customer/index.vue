<template>
  <WrapContent title="Daftar Pelanggan">
    <template #actions>
      <!-- Show skeleton buttons when loading -->
      <template v-if="loading">
        <Skeleton class="h-9 w-28 rounded-md" />
        <Skeleton class="h-9 w-40 rounded-md bg-primary/20" />
      </template>
      <template v-else>
        <button type="button"
          class="touch-manipulation w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto sm:py-2"
          @click="openAdd">
          Tambah Pelanggan
        </button>
      </template>
    </template>
    <template #content>
      <ReusableTable :data="pelanggans as any" :columns="tableColumns" :loading="loading" :skeleton-rows="4"
        empty-message='Belum ada data pelanggan. Klik "Tambah Pelanggan" untuk menambahkan data baru.' searchable
        :search-keys="['nama', 'id_pelanggan', 'no_hp']" search-placeholder="Cari nama/ID/No. HP..." paginated
        :page-size="10" :page-size-options="[5, 10, 25, 50]">
        <!-- Custom cell: Nomor urut -->
        <template #cell-index="{ row }">
          {{ pelanggans.indexOf(row as any) + 1 }}
        </template>

        <!-- Custom cell: Status Aktif -->
        <template #cell-status_aktif="{ value }">
          <span :class="[
            'rounded-full px-3 py-1 text-xs font-medium',
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            {{ value ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </template>

        <!-- Custom cell: Tarif (nested object) -->
        <template #cell-tarif="{ value }">
          {{ formatCurrency(Number(value?.harga_per_m3)) || '-' }}
        </template>

        <!-- Custom cell: Tanggal Update -->
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
    <CustomerPopup :open="true" :pelanggan="selectedPelanggan" :tarif-options="tarifOptions"
      :loading="isEditLoading" :is-edit-mode="isEditMode" :on-save="handleSavePelanggan" @close="closePopup"
      @saved="onPelangganSaved" />
  </template>

  <!-- Delete Confirmation AlertDialog -->
  <AlertDialog v-model:open="showDeleteAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus Pelanggan</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menghapus pelanggan
          <span class="font-semibold">"{{ pelangganToDelete?.nama }}"</span>?
          Tindakan ini tidak dapat dibatalkan.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeleting">Batal</AlertDialogCancel>
        <AlertDialogAction :disabled="isDeleting" class="bg-red-500 hover:bg-red-600 text-white" @click="confirmDelete">
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
import type { Pelanggan, PelangganForm } from '~/types/customers';
import type { Tarif } from '~/types/tarif';
import CustomerPopup from './components/popup.vue';
import { useCustomerCore } from '~/composables/customer/useCostumer';
import { useTarifCore } from '~/composables/tarif/useTarif';
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

const loading = ref(true);
const isDeleting = ref(false);
const isEditLoading = ref(false);
const isEditMode = ref(false);
const pelanggans = ref<Pelanggan[]>([]);
const selectedPelanggan = ref<Pelanggan | null>(null);
const showPopup = ref(false);
const showDeleteAlert = ref(false);
const pelangganToDelete = ref<Pelanggan | null>(null);
const tarifOptions = ref<Tarif[]>([]);

const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerById } = useCustomerCore()
const { getTarif } = useTarifCore()

// Table column definitions
const tableColumns: TableColumn[] = [
  { key: 'index', label: 'No', width: '60px', align: 'center' },
  { key: 'id_pelanggan', label: 'ID Pelanggan', sortable: true },
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'no_hp', label: 'No. HP', sortable: true, hideOnMobile: true },
  { key: 'tarif', label: 'Tarif', sortable: false },
  { key: 'status_aktif', label: 'Status', width: '120px', align: 'center' },
  { key: 'updated_at', label: 'Tanggal Update', sortable: true, width: '200px', hideOnMobile: true },
  { key: 'actions', label: 'Actions', width: '160px', align: 'center' },
]

const openAdd = () => {
  isEditMode.value = false;
  selectedPelanggan.value = null;
  showPopup.value = true;
};

const openEdit = async (id: number) => {
  isEditMode.value = true;
  selectedPelanggan.value = null;
  showPopup.value = true;
  isEditLoading.value = true;
  try {
    const response = await getCustomerById(id);
    if (!response.data) {
      throw new Error('Data pelanggan tidak ditemukan');
    }
    selectedPelanggan.value = response.data;
  } catch {
    closePopup();
    toast.error('Gagal memuat data pelanggan');
  } finally {
    isEditLoading.value = false;
  }
};

const closePopup = () => {
  showPopup.value = false;
  selectedPelanggan.value = null;
  isEditLoading.value = false;
  isEditMode.value = false;
};

const handleSavePelanggan = async (pelangganId: number | null, form: PelangganForm): Promise<Pelanggan> => {
  if (pelangganId) {
    const response = await updateCustomer(pelangganId, form);
    if (!response.data) {
      throw new Error(response.message || 'Gagal memperbarui pelanggan');
    }
    return response.data;
  }

  const response = await createCustomer(form);
  if (!response.data) {
    throw new Error(response.message || 'Gagal menambahkan pelanggan baru');
  }
  return response.data;
};

const onPelangganSaved = (pelanggan: Pelanggan) => {
  const index = pelanggans.value.findIndex(p => p.id === pelanggan.id);
  if (index !== -1) {
    pelanggans.value[index] = pelanggan;
    toast.success('Pelanggan berhasil diperbarui');
  } else {
    pelanggans.value.push(pelanggan);
    toast.success('Pelanggan berhasil ditambahkan');
  }
};

const openDelete = (pelanggan: Pelanggan) => {
  pelangganToDelete.value = pelanggan;
  showDeleteAlert.value = true;
};

const confirmDelete = async () => {
  const pelanggan = pelangganToDelete.value;
  if (!pelanggan || isDeleting.value) return;

  isDeleting.value = true;
  try {
    await deleteCustomer(pelanggan.id);
    pelanggans.value = pelanggans.value.filter(p => p.id !== pelanggan.id);
    showDeleteAlert.value = false;
    pelangganToDelete.value = null;
    toast.success(`Pelanggan "${pelanggan.nama}" berhasil dihapus`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus pelanggan';
    console.error('Gagal menghapus pelanggan:', error);
    toast.error(message);
  } finally {
    isDeleting.value = false;
  }
};

// Reset pelangganToDelete when alert dialog is dismissed
watch(showDeleteAlert, (isOpen) => {
  if (!isOpen) {
    pelangganToDelete.value = null;
  }
});

onMounted(async () => {
  try {
    // Load tarif options for the popup form
    const tarifData = await getTarif()
    tarifOptions.value = tarifData

    // Load customers
    const data = await getCustomers()
    pelanggans.value = data
  } catch (error) {
    console.error('Gagal memuat data:', error)
    toast.error('Gagal memuat data pelanggan')
  } finally {
    loading.value = false
  }
});
</script>
