<template>
  <div class="space-y-6">
    <!-- Loading Skeleton -->
    <DashboardSkeleton v-if="loading" />

    <!-- Actual Content -->
    <template v-else>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
          <button type="button"
            class="touch-manipulation rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:py-2">
            Export Data
          </button>
          <button type="button"
            class="touch-manipulation rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:py-2">
            Add New
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Total Revenue" value="25,400,000" isCurrency />
            <StatCard title="Active Customers" value="1,245" />
            <StatCard title="Pending Bills" value="43" />
            <StatCard title="Avg. Consumption" value="125 m³" />
            <StatCard title="Collection Rate" value="98.2%" />
            <StatCard title="Overdue Amount" value="3,200,000" isCurrency />
          </div>

          <!-- Recent Customers -->
          <div class="rounded-lg border bg-card p-4 sm:p-6">
            <h3 class="mb-4 text-lg font-semibold">Recent Customers</h3>
            <!-- Mobile: stacked cards -->
            <ul class="divide-y rounded-lg border sm:hidden">
              <li v-for="(row, i) in recentCustomerRows" :key="i" class="p-3">
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
                    <th class="text-left py-3 font-medium">Name</th>
                    <th class="text-left py-3 font-medium">Meter ID</th>
                    <th class="text-left py-3 font-medium">Last Reading</th>
                    <th class="text-left py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b">
                    <td class="py-3">John Doe</td>
                    <td class="py-3">MTR-001</td>
                    <td class="py-3">150 m³</td>
                    <td class="py-3"><span
                        class="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">Active</span></td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-3">Jane Smith</td>
                    <td class="py-3">MTR-002</td>
                    <td class="py-3">210 m³</td>
                    <td class="py-3"><span
                        class="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">Active</span></td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-3">Robert Johnson</td>
                    <td class="py-3">MTR-003</td>
                    <td class="py-3">95 m³</td>
                    <td class="py-3"><span
                        class="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">Pending</span></td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-3">Maria Garcia</td>
                    <td class="py-3">MTR-004</td>
                    <td class="py-3">180 m³</td>
                    <td class="py-3"><span
                        class="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">Active</span></td>
                  </tr>
                  <tr>
                    <td class="py-3">David Lee</td>
                    <td class="py-3">MTR-005</td>
                    <td class="py-3">0 m³</td>
                    <td class="py-3"><span
                        class="rounded-full bg-red-100 px-3 py-1 text-xs text-red-800">Inactive</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Chart Placeholder -->
          <div class="rounded-lg border bg-card p-4 sm:p-6">
            <h3 class="mb-4 text-lg font-semibold">Consumption Trend</h3>
            <div class="flex h-48 items-center justify-center rounded-md bg-muted sm:h-64">
              <p class="px-4 text-center text-sm text-muted-foreground">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <!-- Aside -->
        <div class="lg:col-span-1">
          <DashboardAside />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardAside from '@/components/dashboard/DashboardAside.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'

const loading = ref(true)

const recentCustomerRows = [
  { name: 'John Doe', meter: 'MTR-001', reading: '150 m³', status: 'Active', statusClass: 'bg-green-100 text-green-800' },
  { name: 'Jane Smith', meter: 'MTR-002', reading: '210 m³', status: 'Active', statusClass: 'bg-green-100 text-green-800' },
  { name: 'Robert Johnson', meter: 'MTR-003', reading: '95 m³', status: 'Pending', statusClass: 'bg-amber-100 text-amber-800' },
  { name: 'Maria Garcia', meter: 'MTR-004', reading: '180 m³', status: 'Active', statusClass: 'bg-green-100 text-green-800' },
  { name: 'David Lee', meter: 'MTR-005', reading: '0 m³', status: 'Inactive', statusClass: 'bg-red-100 text-red-800' },
]

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1500)
})
</script>