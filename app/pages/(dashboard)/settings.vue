<template>
  <WrapContent title="Pengaturan Akun">
    <template #content>
      <div v-if="!isMounted || pageLoading" class="mx-auto max-w-2xl space-y-6">
        <Skeleton class="h-48 w-full rounded-xl" />
        <Skeleton class="h-64 w-full rounded-xl" />
      </div>

      <div v-else class="mx-auto max-w-2xl space-y-6">
        <!-- Header profil -->
        <div class="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div class="bg-gradient-to-br from-primary/90 via-primary to-primary/70 px-6 pb-16 pt-8 text-primary-foreground">
            <p class="text-sm font-medium opacity-90">Profil Akun</p>
            <h2 class="mt-1 text-2xl font-bold tracking-tight">{{ user?.nama ?? 'Pengguna' }}</h2>
            <p class="mt-0.5 text-sm opacity-90">{{ user?.email }}</p>
          </div>
          <div class="-mt-12 flex flex-col items-center px-6 pb-6">
            <ProfileAvatarPicker
              :user="user"
              :loading="saving && !!pendingFoto"
              :disabled="saving"
              @select="onFotoSelect"
              @remove="onFotoRemove"
            />
            <span
              class="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary"
            >
              {{ peranLabel }}
            </span>
            <p v-if="memberSince" class="mt-2 text-xs text-muted-foreground">
              Bergabung {{ memberSince }}
            </p>
          </div>
        </div>

        <!-- Form data profil -->
        <form class="rounded-xl border bg-card p-6 shadow-sm" @submit.prevent="saveProfile">
          <h3 class="mb-1 text-lg font-semibold">Informasi Profil</h3>
          <p class="mb-6 text-sm text-muted-foreground">
            Perbarui nama dan email yang digunakan untuk masuk ke sistem.
          </p>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="profile-nama">Nama Lengkap</Label>
              <Input
                id="profile-nama"
                v-model="form.nama"
                type="text"
                placeholder="Nama lengkap"
                required
                :disabled="saving"
              />
            </div>
            <div class="space-y-2">
              <Label for="profile-email">Email</Label>
              <Input
                id="profile-email"
                v-model="form.email"
                type="email"
                placeholder="email@contoh.com"
                required
                :disabled="saving"
              />
            </div>
          </div>

          <Separator class="my-6" />

          <button
            type="button"
            class="flex w-full items-center justify-between text-left"
            @click="showPasswordSection = !showPasswordSection"
          >
            <div>
              <h3 class="text-lg font-semibold">Keamanan</h3>
              <p class="text-sm text-muted-foreground">Ubah password akun Anda</p>
            </div>
            <ChevronDown
              class="size-5 shrink-0 text-muted-foreground transition-transform"
              :class="showPasswordSection ? 'rotate-180' : ''"
            />
          </button>

          <div v-show="showPasswordSection" class="mt-4 space-y-4">
            <div class="space-y-2">
              <Label for="current-password">Password Saat Ini</Label>
              <Input
                id="current-password"
                v-model="form.current_password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="saving"
              />
            </div>
            <div class="space-y-2">
              <Label for="new-password">Password Baru</Label>
              <Input
                id="new-password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                placeholder="Minimal 8 karakter"
                :disabled="saving"
              />
            </div>
            <div class="space-y-2">
              <Label for="confirm-password">Konfirmasi Password Baru</Label>
              <Input
                id="confirm-password"
                v-model="form.password_confirmation"
                type="password"
                autocomplete="new-password"
                placeholder="Ulangi password baru"
                :disabled="saving"
              />
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" :disabled="saving" @click="resetForm">
              Batalkan Perubahan
            </Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 size-4 animate-spin" />
              Simpan Perubahan
            </Button>
          </div>
        </form>

        <!-- Sesi -->
        <div class="rounded-xl border bg-card p-6 shadow-sm">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold">Sesi Aktif</h3>
              <p class="mt-1 text-sm text-muted-foreground">
                Keluar dari perangkat ini. Anda perlu login kembali untuk mengakses dashboard.
              </p>
            </div>
            <Button variant="destructive" class="shrink-0" :disabled="loggingOut" @click="handleLogout">
              <LogOut v-if="!loggingOut" class="mr-2 size-4" />
              <Loader2 v-else class="mr-2 size-4 animate-spin" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </template>
  </WrapContent>
</template>

<script setup lang="ts">
/** Halaman bergantung localStorage/API — render hanya di client */
definePageMeta({
  ssr: false,
})

import { reactive, ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2, ChevronDown, LogOut } from 'lucide-vue-next'
import WrapContent from '~/components/dashboard/WrapContent.vue'
import ProfileAvatarPicker from '~/components/dashboard/ProfileAvatarPicker.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '~/composables/auth/useAuth'
import type { ProfileUpdateForm } from '~/types/users'
import { formatDate } from '~/utils/utils'

const { user, logout, fetchProfile, updateProfile } = useAuth()

const isMounted = ref(false)
const pageLoading = ref(true)
const saving = ref(false)
const loggingOut = ref(false)
const showPasswordSection = ref(false)
const pendingFoto = ref<File | null>(null)
const removeFoto = ref(false)

const form = reactive<ProfileUpdateForm>({
  nama: '',
  email: '',
  current_password: '',
  password: '',
  password_confirmation: '',
})

const peranLabel = computed(() => {
  const peran = user.value?.peran
  if (peran === 'admin') return 'Administrator'
  if (peran === 'petugas') return 'Petugas'
  return peran ?? 'Pengguna'
})

const memberSince = computed(() => {
  if (!user.value?.created_at) return ''
  const d = new Date(user.value.created_at)
  return formatDate(d, 'MMMM YYYY')
})

function syncFormFromUser() {
  if (!user.value) return
  form.nama = user.value.nama
  form.email = user.value.email
  form.current_password = ''
  form.password = ''
  form.password_confirmation = ''
}

function resetForm() {
  syncFormFromUser()
  pendingFoto.value = null
  removeFoto.value = false
  showPasswordSection.value = false
}

function onFotoSelect(file: File) {
  pendingFoto.value = file
  removeFoto.value = false
}

function onFotoRemove() {
  pendingFoto.value = null
  removeFoto.value = true
}

async function saveProfile() {
  if (!form.nama.trim() || !form.email.trim()) {
    toast.error('Nama dan email wajib diisi')
    return
  }

  const wantsPasswordChange = !!(form.password?.trim() || form.password_confirmation?.trim())
  if (wantsPasswordChange) {
    if (!form.current_password?.trim()) {
      toast.error('Masukkan password saat ini')
      return
    }
    if ((form.password?.length ?? 0) < 8) {
      toast.error('Password baru minimal 8 karakter')
      return
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
  }

  saving.value = true
  try {
    const payload: ProfileUpdateForm = {
      nama: form.nama.trim(),
      email: form.email.trim(),
    }
    if (wantsPasswordChange) {
      payload.current_password = form.current_password
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    await updateProfile(payload, {
      foto: pendingFoto.value,
      removeFoto: removeFoto.value,
    })

    pendingFoto.value = null
    removeFoto.value = false
    showPasswordSection.value = false
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
  } catch (err: unknown) {
    const e = err as { message?: string; errors?: Record<string, string[]> }
    const firstFieldError = e.errors
      ? Object.values(e.errors).flat()[0]
      : undefined
    toast.error(firstFieldError ?? e.message ?? 'Gagal menyimpan profil')
  } finally {
    saving.value = false
  }
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
  } finally {
    loggingOut.value = false
  }
}

watch(user, () => {
  if (!pageLoading.value) {
    syncFormFromUser()
  }
})

onMounted(async () => {
  isMounted.value = true
  try {
    await fetchProfile()
    syncFormFromUser()
  } catch {
    toast.error('Gagal memuat profil')
  } finally {
    pageLoading.value = false
  }
})
</script>
