<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { Camera, Trash2, Loader2 } from 'lucide-vue-next'
import DashboardAvatar from './DashboardAvatar.vue'
import type { User } from '~/types/users'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  user: User | null
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [file: File]
  remove: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const markedForRemoval = ref(false)

const displayUser = computed(() => {
  if (!props.user) return null
  if (markedForRemoval.value && !previewUrl.value) {
    return { ...props.user, foto_profil: null }
  }
  return props.user
})

watch(
  () => props.user?.foto_profil,
  () => {
    if (!markedForRemoval.value) {
      revokePreview()
    }
  },
)

function revokePreview() {
  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
}

onBeforeUnmount(revokePreview)

function openPicker() {
  if (props.disabled || props.loading) return
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    return
  }

  markedForRemoval.value = false
  revokePreview()
  previewUrl.value = URL.createObjectURL(file)
  emit('select', file)
  input.value = ''
}

function removePhoto() {
  markedForRemoval.value = true
  revokePreview()
  emit('remove')
}

defineExpose({ clearPreview: revokePreview })
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative">
      <DashboardAvatar
        :user="displayUser"
        size="xl"
        :preview-url="previewUrl"
      />
      <button
        type="button"
        class="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
        :disabled="disabled || loading"
        aria-label="Ubah foto profil"
        @click="openPicker"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <Camera v-else class="size-4" />
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="sr-only"
        @change="onFileChange"
      />
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2">
      <Button type="button" variant="outline" size="sm" :disabled="disabled || loading" @click="openPicker">
        <Camera class="mr-1.5 size-4" />
        Unggah Foto
      </Button>
      <Button
        v-if="user?.foto_profil || previewUrl"
        type="button"
        variant="ghost"
        size="sm"
        class="text-destructive hover:text-destructive"
        :disabled="disabled || loading"
        @click="removePhoto"
      >
        <Trash2 class="mr-1.5 size-4" />
        Hapus Foto
      </Button>
    </div>
    <p class="text-center text-xs text-muted-foreground">
      JPG, PNG, atau WebP. Maks. 2 MB.
    </p>
  </div>
</template>
