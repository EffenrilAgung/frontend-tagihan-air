<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount, useId } from 'vue'
import { Camera, Trash2, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DashboardAvatar from './DashboardAvatar.vue'
import type { User } from '~/types/users'
import { validateProfileImageFile } from '~/utils/image-file'

const props = defineProps<{
  user: User | null
  disabled?: boolean
  uploading?: boolean
  uploadFile: (file: File) => Promise<void>
  removeFile?: () => Promise<void>
}>()

const inputId = `profile-avatar-${useId().replace(/:/g, '')}`

const previewUrl = ref<string | null>(null)
const markedForRemoval = ref(false)
const inlineError = ref('')

const isBusy = computed(() => !!(props.disabled || props.uploading))

const displayUser = computed(() => {
  if (!props.user) return null
  if (markedForRemoval.value && !previewUrl.value) {
    return { ...props.user, foto_profil: null }
  }
  return props.user
})

watch(
  () => props.user?.foto_profil,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && !markedForRemoval.value) {
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

function resetPickerState() {
  markedForRemoval.value = false
  inlineError.value = ''
  revokePreview()
}

onBeforeUnmount(revokePreview)

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file || isBusy.value) return

  inlineError.value = ''
  const validationError = validateProfileImageFile(file)
  if (validationError) {
    inlineError.value = validationError
    toast.error(validationError)
    return
  }

  markedForRemoval.value = false
  revokePreview()
  previewUrl.value = URL.createObjectURL(file)

  try {
    await props.uploadFile(file)
  } catch {
    resetPickerState()
  }
}

async function handleRemove() {
  if (isBusy.value || !props.removeFile) return
  if (!props.user?.foto_profil && !previewUrl.value) return

  markedForRemoval.value = true
  revokePreview()

  try {
    await props.removeFile()
    markedForRemoval.value = false
  } catch {
    resetPickerState()
  }
}

defineExpose({ resetPickerState })
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative">
      <DashboardAvatar
        :user="displayUser"
        size="xl"
        :preview-url="previewUrl"
      />

      <input
        :id="inputId"
        type="file"
        accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
        class="hidden"
        :disabled="isBusy"
        @change="handleFileChange"
      />

      <label
        :for="isBusy ? undefined : inputId"
        class="absolute bottom-0 right-0 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
        :class="isBusy ? 'pointer-events-none opacity-50' : ''"
        aria-label="Ubah foto profil"
      >
        <Loader2 v-if="uploading" class="size-4 animate-spin" />
        <Camera v-else class="size-4" />
      </label>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2">
      <label
        :for="isBusy ? undefined : inputId"
        class="inline-flex"
        :class="isBusy ? 'pointer-events-none opacity-50' : 'cursor-pointer'"
      >
        <span
          class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
        >
          <Camera class="mr-1.5 size-4" />
          Unggah Foto
        </span>
      </label>

      <button
        v-if="user?.foto_profil || previewUrl"
        type="button"
        class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-destructive hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        :disabled="isBusy"
        @click="handleRemove"
      >
        <Trash2 class="mr-1.5 size-4" />
        Hapus Foto
      </button>
    </div>

    <p v-if="inlineError" class="text-center text-xs text-destructive">
      {{ inlineError }}
    </p>
    <p v-else class="text-center text-xs text-muted-foreground">
      JPG atau PNG. Maks. 2 MB. Foto langsung diunggah setelah dipilih.
    </p>
  </div>
</template>
