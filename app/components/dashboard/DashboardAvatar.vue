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

const sizeClasses: Record<string, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-24 w-24 text-3xl ring-4 ring-background shadow-md',
}

/**
 * Warna latar avatar berdasarkan hash nama — menghasilkan
 * kombinasi bg + text yang konsisten per user.
 */
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
  if (!props.user?.nama) return 'bg-muted text-muted-foreground'
  let hash = 0
  for (let i = 0; i < props.user.nama.length; i++) {
    hash = props.user.nama.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % avatarColors.length
  return avatarColors[idx]
})

const initial = computed(() => {
  if (props.user?.nama) {
    return props.user.nama.charAt(0).toUpperCase()
  }
  return '?'
})

const avatarUrl = computed(() => {
  if (props.previewUrl) return props.previewUrl
  if (!props.user?.foto_profil) return null
  const foto = props.user.foto_profil
  if (foto.startsWith('http://') || foto.startsWith('https://')) {
    return foto
  }
  const appOrigin = apiBase.replace(/\/api\/?$/, '')
  const path = foto.replace(/^\/+/, '').replace(/^storage\//, '')
  return `${appOrigin.replace(/\/+$/, '')}/storage/${path}`
})

const imageError = ref(false)
</script>

<template>
  <div
    :class="cn(
      'relative shrink-0 overflow-hidden rounded-full',
      sizeClasses[size],
      !avatarUrl || imageError ? colorClass : '',
      props.class,
    )"
    :title="user?.nama ?? 'Pengguna'"
  >
    <img
      v-if="avatarUrl && !imageError"
      :src="avatarUrl"
      :alt="user?.nama ?? 'Avatar'"
      class="h-full w-full object-cover"
      @error="imageError = true"
    />
    <span
      v-else
      class="flex h-full w-full items-center justify-center font-bold"
    >
      {{ initial }}
    </span>
  </div>
</template>
