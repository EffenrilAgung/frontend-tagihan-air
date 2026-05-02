<template>
    <div class="space-y-6">
        <!-- Header Skeleton -->
        <div class="flex items-center justify-between">
            <Skeleton class="h-9 w-40" />
            <div class="flex items-center gap-2">
                <Skeleton class="h-9 w-28 rounded-md" />
                <Skeleton class="h-9 w-24 rounded-md" />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="i in 6" :key="i" class="rounded-lg border bg-card p-6">
                        <Skeleton class="h-4 w-24 mb-3" />
                        <Skeleton class="h-8 w-32" />
                    </div>
                </div>

                <!-- Customer Table Skeleton -->
                <div class="rounded-lg border bg-card p-6">
                    <Skeleton class="h-6 w-44 mb-4" />
                    <div class="space-y-3">
                        <!-- Table Header -->
                        <div class="flex gap-4 pb-3 border-b">
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-4 w-20" />
                        </div>
                        <!-- Table Rows -->
                        <div v-for="i in 5" :key="i" class="flex gap-4 py-3 border-b last:border-0">
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                </div>

                <!-- Chart Skeleton -->
                <div class="rounded-lg border bg-card p-6">
                    <Skeleton class="h-6 w-44 mb-4" />
                    <Skeleton class="h-64 w-full rounded-md" />
                </div>
            </div>

            <!-- Aside Skeleton -->
            <div class="lg:col-span-1 space-y-6">
                <div v-for="section in 3" :key="'aside-' + section" class="rounded-lg border bg-card p-6">
                    <Skeleton class="h-5 w-40 mb-4" />
                    <div class="space-y-4">
                        <div v-for="j in 3" :key="'item-' + section + '-' + j">
                            <Skeleton class="h-4 w-28 mb-1" />
                            <Skeleton class="h-7 w-20" />
                        </div>
                        <Skeleton v-if="section === 3" class="h-9 w-full rounded-md mt-2" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>
