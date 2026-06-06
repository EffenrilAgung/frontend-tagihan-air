<template>
    <div class="space-y-4 sm:space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ title }}</h1>
            <div
                class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
                <slot name="actions" />
            </div>
        </div>

        <!-- Content goes here -->
        <div class="rounded-lg border bg-card p-4 sm:p-6">
            <slot name="content">No content provided</slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface Props {
    title: string
}

withDefaults(defineProps<Props>(), {
    title: "Default Title"
})
</script>