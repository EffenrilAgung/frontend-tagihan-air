<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImageOff } from 'lucide-vue-next'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const props = defineProps<{
    src: string | null | undefined
    alt?: string
    imgClass?: string
    skeletonClass?: string
}>()

const isLoading = ref(false)
const hasError = ref(false)

watch(() => props.src, () => {
    hasError.value = false
    isLoading.value = !!props.src
}, { immediate: true })

function onLoad() { isLoading.value = false }
function onError() { isLoading.value = false; hasError.value = true }
</script>

<template>
    <div class="relative flex items-center justify-center">
        <Skeleton v-if="isLoading" :class="skeletonClass ?? 'h-32 w-full rounded-md'" />
        <div v-else-if="hasError || !src" class="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff class="size-8" />
            <span class="text-xs">Gagal memuat gambar</span>
        </div>
        <img
            v-show="!isLoading && !hasError && src"
            :src="src!"
            :alt="alt ?? ''"
            :class="imgClass"
            @load="onLoad"
            @error="onError"
        />
    </div>
</template>
