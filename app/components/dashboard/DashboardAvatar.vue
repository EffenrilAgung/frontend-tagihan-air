<script setup lang="ts">
import type { User } from '~/types/users'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  user: User | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  class?: string
  previewUrl?: string | null
}>(), {
  size: 'md',
  previewUrl: null,
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

/** User & foto dari localStorage — render setelah mount agar SSR = hydration. */
const isClientReady = ref(false)
onMounted(() => {
  isClientReady.value = true
})

const resolvedUser = computed(() => (isClientReady.value ? props.user : null))

const sizeClasses: Record<string, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-24 w-24 text-3xl ring-4 ring-background shadow-md',
}

const avatarColors = [
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-amber-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-teal-500 text-white',
  'bg-indigo-500 text-white',
  'bg-rose-500 text-white',
]

const colorClass = computed(() => {
  if (!resolvedUser.value?.nama) return 'bg-muted text-muted-foreground'
  let hash = 0
  for (let i = 0; i < resolvedUser.value.nama.length; i++) {
    hash = resolvedUser.value.nama.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % avatarColors.length
  return avatarColors[idx]
})

const initial = computed(() => {
  if (resolvedUser.value?.nama) {
    return resolvedUser.value.nama.charAt(0).toUpperCase()
  }
  return '?'
})

const storageOrigin = computed(() =>
  apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, ''),
)

function resolveStorageUrl(foto: string): string {
  const origin = storageOrigin.value

  if (foto.startsWith('http://') || foto.startsWith('https://')) {
    try {
      const url = new URL(foto)
      if (url.pathname.includes('/storage/')) {
        return `${origin}${url.pathname}`
      }
    } catch {
      return foto
    }
    return foto
  }

  const path = foto.replace(/^\/+/, '').replace(/^storage\//, '')
  return `${origin}/storage/${path}`
}

const avatarUrl = computed(() => {
  if (!isClientReady.value) return null
  if (props.previewUrl) return props.previewUrl
  if (!resolvedUser.value?.foto_profil) return null
  return resolveStorageUrl(resolvedUser.value.foto_profil)
})

const imageError = ref(false)
const imageLoading = ref(false)

watch(avatarUrl, (url) => {
  if (!isClientReady.value) {
    imageLoading.value = false
    return
  }
  imageError.value = false
  imageLoading.value = !!url
})

watch(isClientReady, (ready) => {
  if (ready && avatarUrl.value) {
    imageError.value = false
    imageLoading.value = true
  }
})

/** Tampilkan inisial (bukan Skeleton) agar SSR/hydration selalu konsisten. */
const showInitial = computed(
  () => !isClientReady.value || !avatarUrl.value || imageError.value || imageLoading.value,
)

function onImageLoad() {
  imageLoading.value = false
}

function onImageError() {
  imageLoading.value = false
  imageError.value = true
}
</script>

<template>
  <div
    :class="cn(
      'relative shrink-0 overflow-hidden rounded-full',
      sizeClasses[size],
      showInitial ? colorClass : '',
      props.class,
    )"
    :title="resolvedUser?.nama ?? 'Pengguna'"
  >
    <img
      v-if="isClientReady && avatarUrl && !imageError"
      :src="avatarUrl"
      :alt="resolvedUser?.nama ?? 'Avatar'"
      class="h-full w-full object-cover"
      :class="{ 'opacity-0': imageLoading }"
      @load="onImageLoad"
      @error="onImageError"
    />
    <span
      v-if="showInitial"
      class="flex h-full w-full items-center justify-center font-bold"
    >
      {{ initial }}
    </span>
  </div>
</template>
