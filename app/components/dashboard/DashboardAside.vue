<script setup lang="ts">
import StatCard from './StatCard.vue'
</script>

<template>
  <aside class="w-full space-y-4 sm:space-y-6 lg:w-80">
    <div class="rounded-lg border bg-card p-4 sm:p-6">
      <h3 class="mb-4 text-lg font-semibold">Dashboard Overview</h3>
      <div class="space-y-4">
        <StatCard title="Total Customers" value="1,245" />
        <StatCard title="Active Meters" value="892" />
        <StatCard title="Pending Bills" value="43" isCurrency />
        <StatCard title="Revenue Today" value="5,250,000" isCurrency />
      </div>
    </div>

    <div class="rounded-lg border bg-card p-4 sm:p-6">
      <h3 class="mb-4 text-lg font-semibold">Recent Activity</h3>
      <ul class="space-y-3">
        <li class="flex gap-2 text-sm max-[380px]:flex-col max-[380px]:gap-1 sm:items-center">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="h-2 w-2 shrink-0 rounded-full bg-green-500"></div>
            <span class="min-w-0">New customer registered</span>
          </div>
          <span class="shrink-0 text-muted-foreground max-[380px]:pl-5 sm:ml-auto">10 min ago</span>
        </li>
        <li class="flex gap-2 text-sm max-[380px]:flex-col max-[380px]:gap-1 sm:items-center">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="h-2 w-2 shrink-0 rounded-full bg-blue-500"></div>
            <span class="min-w-0">Meter reading submitted</span>
          </div>
          <span class="shrink-0 text-muted-foreground max-[380px]:pl-5 sm:ml-auto">1 hour ago</span>
        </li>
        <li class="flex gap-2 text-sm max-[380px]:flex-col max-[380px]:gap-1 sm:items-center">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="h-2 w-2 shrink-0 rounded-full bg-amber-500"></div>
            <span class="min-w-0">Bill payment received</span>
          </div>
          <span class="shrink-0 text-muted-foreground max-[380px]:pl-5 sm:ml-auto">2 hours ago</span>
        </li>
        <li class="flex gap-2 text-sm max-[380px]:flex-col max-[380px]:gap-1 sm:items-center">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="h-2 w-2 shrink-0 rounded-full bg-red-500"></div>
            <span class="min-w-0">Overdue bill reminder sent</span>
          </div>
          <span class="shrink-0 text-muted-foreground max-[380px]:pl-5 sm:ml-auto">5 hours ago</span>
        </li>
      </ul>
    </div>

    <div class="rounded-lg border bg-card p-4 sm:p-6">
      <h3 class="mb-4 text-lg font-semibold">Quick Actions</h3>
      <div class="space-y-2">
        <button type="button" class="touch-manipulation w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:py-2">
          Add New Customer
        </button>
        <button type="button" class="touch-manipulation w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:py-2">
          Generate Report
        </button>
        <button type="button" class="touch-manipulation w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:py-2">
          Send Notifications
        </button>
      </div>
    </div>
  </aside>
</template>