<template>
  <WrapContent title="Laporan Pembayaran">
    <template #actions>
      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <label class="shrink-0 text-sm text-muted-foreground">Dari</label>
          <Input v-model="filterStart" type="date" class="min-w-0 flex-1 sm:w-40 sm:flex-none" />
        </div>
        <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <label class="shrink-0 text-sm text-muted-foreground">Sampai</label>
          <Input v-model="filterEnd" type="date" class="min-w-0 flex-1 sm:w-40 sm:flex-none" />
        </div>
        <Button variant="outline" size="sm" class="touch-manipulation" :disabled="loading" @click="loadReport">
          Tampilkan
        </Button>
      </div>
    </template>
    <template #content>
      <div v-if="summary" class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Jumlah Transaksi</p>
          <p class="text-2xl font-bold">{{ summary.count }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Total Dibayar</p>
          <p class="text-2xl font-bold text-primary">{{ formatCurrency(summary.totalPaid) }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Total Denda</p>
          <p class="text-2xl font-bold">{{ formatCurrency(summary.totalDenda) }}</p>
        </div>
      </div>

      <ReusableTable
        :data="items as any"
        :columns="columns"
        :loading="loading"
        :skeleton-rows="5"
        empty-message="Tidak ada pembayaran pada periode ini."
        paginated
        :page-size="10"
      >
        <template #cell-index="{ row }">
          {{ items.indexOf(row as any) + 1 }}
        </template>
        <template #cell-pelanggan="{ value }">
          <div class="flex flex-col">
            <span class="font-medium">{{ (value as any)?.nama ?? '-' }}</span>
            <span class="text-xs text-muted-foreground">{{ (value as any)?.id_pelanggan ?? '' }}</span>
          </div>
        </template>
        <template #cell-tanggal_bayar="{ value }">
          {{ formatDate(new Date(value as string), 'DD MMMM YYYY') }}
        </template>
        <template #cell-jumlah_dibayar="{ value }">
          {{ formatCurrency(value as number) }}
        </template>
        <template #cell-denda_rp="{ value }">
          {{ formatCurrency(value as number) }}
        </template>
      </ReusableTable>
    </template>
  </WrapContent>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import WrapContent from '~/components/dashboard/WrapContent.vue'
import ReusableTable from '~/components/dashboard/ReusableTable.vue'
import type { TableColumn } from '~/components/dashboard/ReusableTable.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useBillingCore } from '~/composables/billing/useBilling'
import type { Pembayaran } from '~/types/billing'
import { formatCurrency, formatDate } from '~/utils/utils'

const { getPembayaranByPeriode } = useBillingCore()

const loading = ref(false)
const items = ref<Pembayaran[]>([])

const now = new Date()
const filterStart = ref(
  new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
)
const filterEnd = ref(now.toISOString().slice(0, 10))

const columns: TableColumn[] = [
  { key: 'index', label: 'No', width: '60px', align: 'center' },
  { key: 'pelanggan', label: 'Pelanggan' },
  { key: 'tanggal_bayar', label: 'Tanggal Bayar', sortable: true },
  { key: 'metode_bayar', label: 'Metode', hideOnMobile: true },
  { key: 'jumlah_dibayar', label: 'Jumlah', align: 'right' },
  { key: 'denda_rp', label: 'Denda', align: 'right', hideOnMobile: true },
]

const summary = computed(() => {
  if (!items.value.length) return null
  return {
    count: items.value.length,
    totalPaid: items.value.reduce((s, p) => s + (p.jumlah_dibayar ?? 0), 0),
    totalDenda: items.value.reduce((s, p) => s + (p.denda_rp ?? 0), 0),
  }
})

async function loadReport() {
  if (!filterStart.value || !filterEnd.value) {
    toast.error('Pilih rentang tanggal')
    return
  }
  loading.value = true
  try {
    items.value = await getPembayaranByPeriode(filterStart.value, filterEnd.value)
  } catch (err: unknown) {
    const message = (err as { message?: string })?.message ?? 'Gagal memuat laporan'
    toast.error(message)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadReport())
</script>
