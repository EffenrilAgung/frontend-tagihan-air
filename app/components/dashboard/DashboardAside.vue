<script setup lang="ts">
import StatCard from './StatCard.vue'
import type { DashboardActivity } from '~/composables/dashboard/useDashboard'

defineProps<{
  activeCustomers: number
  pendingBills: number
  revenueToday: number
  activities: DashboardActivity[]
}>()
</script>

<template>
  <aside class="w-full space-y-4 sm:space-y-6 lg:w-80">
    <div class="rounded-lg border bg-card p-4 sm:p-6">
      <h3 class="mb-4 text-lg font-semibold">Ringkasan</h3>
      <div class="space-y-4">
        <StatCard title="Total Pelanggan Aktif" :value="activeCustomers" />
        <StatCard title="Tagihan Belum Bayar" :value="pendingBills" />
        <StatCard title="Pendapatan Hari Ini" :value="revenueToday" isCurrency />
      </div>
    </div>

    <div class="rounded-lg border bg-card p-4 sm:p-6">
      <h3 class="mb-4 text-lg font-semibold">Aktivitas Terbaru</h3>
      <p v-if="activities.length === 0" class="text-sm text-muted-foreground">Belum ada aktivitas.</p>
      <ul v-else class="space-y-3">
        <li
          v-for="(item, index) in activities"
          :key="index"
          class="flex gap-2 text-sm max-[380px]:flex-col max-[380px]:gap-1 sm:items-center"
        >
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="h-2 w-2 shrink-0 rounded-full" :class="item.dotClass" />
            <span class="min-w-0">{{ item.label }}</span>
          </div>
          <span class="shrink-0 text-muted-foreground max-[380px]:pl-5 sm:ml-auto">{{ item.time }}</span>
        </li>
      </ul>
    </div>

    <div class="rounded-lg border bg-card p-4 sm:p-6">
      <h3 class="mb-4 text-lg font-semibold">Aksi Cepat</h3>
      <div class="space-y-2">
        <NuxtLink
          to="/customer/register"
          class="flex w-full touch-manipulation items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:py-2"
        >
          Daftar Pelanggan Baru
        </NuxtLink>
        <NuxtLink
          to="/pencatatan-meter"
          class="flex w-full touch-manipulation items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:py-2"
        >
          Input Pencatatan Meter
        </NuxtLink>
        <NuxtLink
          to="/billing"
          class="flex w-full touch-manipulation items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:py-2"
        >
          Proses Pembayaran
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
