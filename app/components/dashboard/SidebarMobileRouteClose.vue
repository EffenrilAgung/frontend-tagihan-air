<script setup lang="ts">
/**
 * Di dalam SidebarProvider: tutup sheet sidebar saat rute berubah (mobile),
 * agar konten tidak tertutup panel setelah tap menu.
 */
import { watch } from 'vue'
import { useSidebar } from '@/components/ui/sidebar/utils'

const route = useRoute()
const { isMobile, setOpenMobile } = useSidebar()

watch(
    () => route.fullPath,
    () => {
        if (isMobile.value) {
            setOpenMobile(false)
        }
    },
)
</script>

<template>
    <span class="sr-only" aria-hidden="true" />
</template>
