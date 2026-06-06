<template>
    <div class="space-y-4">
        <!-- Table Header -->
        <div class="flex gap-4 pb-3 border-b">
            <Skeleton v-for="col in columns" :key="'header-' + col.id" class="h-4"
                :style="{ width: col.width || '100px' }" />
        </div>

        <!-- Table Rows -->
        <div v-for="row in rows" :key="'row-' + row" class="flex gap-4 py-3 border-b last:border-0">
            <Skeleton v-for="col in columns" :key="'cell-' + row + '-' + col.id" class="h-4"
                :style="{ width: col.width || '100px' }" :class="col.class || ''" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

interface Column {
    id: string
    width?: string
    class?: string
}

interface Props {
    columns: Column[]
    rows?: number
}

withDefaults(defineProps<Props>(), {
    rows: 5
})
</script>
