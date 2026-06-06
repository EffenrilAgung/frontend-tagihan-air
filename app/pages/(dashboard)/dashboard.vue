<template>
  <div class="space-y-6">
    <DashboardSkeleton v-if="loading" />

    <template v-else>
      <div v-if="error" class="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {{ error }}
        <button type="button" class="ml-2 underline" @click="loadDashboard">Coba lagi</button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
          <NuxtLink
            to="/billing"
            class="touch-manipulation rounded-md border border-input bg-background px-4 py-2.5 text-center text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:py-2"
          >
            Lihat Tagihan
          </NuxtLink>
          <NuxtLink
            to="/customer"
            class="touch-manipulation rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:py-2"
          >
            Tambah Pelanggan
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Pendapatan" :value="stats.totalRevenue" isCurrency />
            <StatCard title="Pelanggan Aktif" :value="stats.activeCustomers" />
            <StatCard title="Tagihan Belum Bayar" :value="stats.pendingBills" />
            <StatCard title="Rata-rata Pemakaian" :value="`${stats.avgConsumption} m³`" />
            <StatCard title="Tingkat Penagihan" :value="`${stats.collectionRate}%`" />
            <StatCard title="Total Tunggakan" :value="stats.overdueAmount" isCurrency />
          </div>

          <div class="rounded-lg border bg-card p-4 sm:p-6">
            <h3 class="mb-4 text-lg font-semibold">Pelanggan Terbaru</h3>
            <p v-if="recentCustomers.length === 0" class="text-sm text-muted-foreground">
              Belum ada data pelanggan.
            </p>
            <template v-else>
              <ul class="divide-y rounded-lg border sm:hidden">
                <li v-for="(row, i) in recentCustomers" :key="i" class="p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-medium">{{ row.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ row.meter }}</p>
                    </div>
                    <span :class="row.statusClass" class="shrink-0 rounded-full px-2.5 py-0.5 text-xs">{{ row.status }}</span>
                  </div>
                  <p class="mt-2 text-sm text-muted-foreground">Terakhir: {{ row.reading }}</p>
                </li>
              </ul>
              <div class="hidden overflow-x-auto sm:block">
                <table class="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr class="border-b">
                      <th class="py-3 text-left font-medium">Nama</th>
                      <th class="py-3 text-left font-medium">ID Pelanggan</th>
                      <th class="py-3 text-left font-medium">Bacaan Terakhir</th>
                      <th class="py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in recentCustomers" :key="i" class="border-b last:border-0">
                      <td class="py-3">{{ row.name }}</td>
                      <td class="py-3">{{ row.meter }}</td>
                      <td class="py-3">{{ row.reading }}</td>
                      <td class="py-3">
                        <span :class="row.statusClass" class="rounded-full px-3 py-1 text-xs">{{ row.status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>

          <div class="rounded-lg border bg-card p-4 sm:p-6">
            <h3 class="mb-4 text-lg font-semibold">Tren Pemakaian Air</h3>
            <div v-if="consumptionTrend.length === 0" class="flex h-48 items-center justify-center rounded-md bg-muted sm:h-64">
              <p class="px-4 text-center text-sm text-muted-foreground">Belum ada data pencatatan meter.</p>
            </div>
            <div v-else class="flex h-48 items-end justify-between gap-2 px-2 sm:h-64">
              <div
                v-for="month in consumptionTrend"
                :key="month.label"
                class="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  class="w-full max-w-12 rounded-t-md bg-primary/80 transition-all"
                  :style="{ height: `${barHeight(month.totalM3)}%`, minHeight: month.totalM3 > 0 ? '4px' : '0' }"
                  :title="`${month.totalM3} m³`"
                />
                <span class="text-center text-[10px] text-muted-foreground sm:text-xs">{{ month.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <DashboardAside
            :active-customers="stats.activeCustomers"
            :pending-bills="stats.pendingBills"
            :revenue-today="revenueToday"
            :activities="activities"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardAside from '@/components/dashboard/DashboardAside.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import { useDashboard } from '~/composables/dashboard/useDashboard'
import { toast } from 'vue-sonner'

const {
  loading,
  error,
  stats,
  revenueToday,
  recentCustomers,
  consumptionTrend,
  activities,
  loadDashboard,
} = useDashboard()

const maxConsumption = computed(() => {
  const values = consumptionTrend.value.map((m) => m.totalM3)
  return Math.max(...values, 1)
})

function barHeight(totalM3: number): number {
  return Math.round((totalM3 / maxConsumption.value) * 100)
}

onMounted(async () => {
  try {
    await loadDashboard()
  } catch {
    toast.error('Gagal memuat data dashboard')
  }
})
</script>
