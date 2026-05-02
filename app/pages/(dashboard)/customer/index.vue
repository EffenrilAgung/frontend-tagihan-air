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
        <template #cell-index="{ row, column }">
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
    <CustomerPopup :open="true" :pelanggan="selectedPelanggan" :tarif-options="tarifOptions" @close="closePopup"
      @save="(id, form) => savePelanggan(id, form)" />
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
import { type Pelanggan, type PelangganForm } from '~/types/customers';
import type { Tarif } from '~/types/tarif';
import CustomerPopup from './components/popup.vue';
import { useCustomerCore } from '~/composables/customer/useCostumer';
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
  selectedPelanggan.value = null;
  showPopup.value = true;
};

const openEdit = async (id: number) => {
  console.log('Opening edit for Pelanggan ID:', id);
  try {
    const response = await getCustomerById(id);
    if (!response.data) {
      throw new Error('Data pelanggan tidak ditemukan');
    }
    console.log('Fetched Pelanggan for Edit:', response.data);
    selectedPelanggan.value = response.data;
    showPopup.value = true;
  } catch (error) {
    console.error('Gagal memuat data pelanggan untuk edit:', error);
  }
};

const closePopup = () => {
  showPopup.value = false;
  selectedPelanggan.value = null;
};

const savePelanggan = (pelangganId: number | null, form: PelangganForm) => {
  if (pelangganId) {
    // Update existing pelanggan
    updateCustomer(pelangganId, form).then((response) => {
      if (response.data) {
        const index = pelanggans.value.findIndex(p => p.id === pelangganId);
        if (index !== -1) {
          pelanggans.value[index] = response.data;
        }
      }
    }).catch((error) => {
      console.error('Gagal memperbarui pelanggan:', error);
      toast.error('Gagal memperbarui pelanggan');
    }).finally(() => {
      closePopup();
    });
  } else {
    // Add new pelanggan
    createCustomer(form).then((response) => {
      if (response.data) {
        pelanggans.value.push(response.data);
      }
    }).catch((error) => {
      console.error('Gagal menambahkan pelanggan baru:', error);
      toast.error('Gagal menambahkan pelanggan baru');
    }).finally(() => {
      closePopup();
    });
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
  } finally {
    loading.value = false
  }
});
</script>
