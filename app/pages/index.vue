<script setup lang="ts">
import { ref } from 'vue'
import { Droplet, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { useAuth } from '~/composables/auth/useAuth'

definePageMeta({
  layout: 'blank',
})

const { login, isAuthenticated } = useAuth()

// If already authenticated, redirect to dashboard
if (isAuthenticated.value) {
  await navigateTo('/dashboard', { replace: true })
}

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  // Reset error
  errorMessage.value = ''

  // Basic validation
  if (!email.value.trim()) {
    errorMessage.value = 'Email harus diisi'
    return
  }
  if (!password.value) {
    errorMessage.value = 'Kata sandi harus diisi'
    return
  }

  isLoading.value = true

  try {
    await login(email.value.trim(), password.value)
    // Navigation happens inside useAuth().login()
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number }
    const msg = error.message || 'Terjadi kesalahan. Silakan coba lagi.'
    errorMessage.value = msg
    toast.error(msg)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-white p-4">
    <div class="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
      <Card class="shadow-xl shadow-slate-100/30 bg-white border border-slate-200 rounded-3xl">
        <CardHeader class="space-y-4 text-center pb-8">
          <div class="flex justify-center">
            <div class="p-4 rounded-3xl bg-emerald-50 text-emerald-600">
              <Droplet class="w-10 h-10" />
            </div>
          </div>
          <CardTitle class="text-3xl font-extrabold text-slate-950 tracking-tight">
            WaterBill Admin
          </CardTitle>
          <CardDescription class="text-slate-600 max-w-xs mx-auto">
            Masuk untuk mengelola penagihan air dan akun pelanggan dengan mudah
          </CardDescription>
        </CardHeader>

        <!-- Error alert -->
        <div v-if="errorMessage" class="px-8 pb-4">
          <div
            class="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <form @submit.prevent="handleLogin">
          <CardContent class="space-y-6">
            <div class="space-y-3">
              <Label for="email" class="text-slate-900 font-semibold text-base">Alamat Email</Label>
              <Input id="email" v-model="email" type="email" placeholder="nama@perusahaan.com"
                class="w-full rounded-xl border-slate-200 bg-slate-50 focus:ring-1 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200 py-3.5 px-4 text-base"
                autocomplete="email" :disabled="isLoading" />
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <Label for="password" class="text-slate-900 font-semibold text-base">Kata Sandi</Label>
                <a href="#" class="text-sm text-emerald-600 hover:text-emerald-800 transition-colors font-semibold">
                  Lupa kata sandi?
                </a>
              </div>
              <div class="relative">
                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••" class="w-full text-base pr-10" autocomplete="current-password"
                  :disabled="isLoading" />
                <button type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  @click="showPassword = !showPassword" tabindex="-1">
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter class="pt-4">
            <Button type="submit" variant="default"
              class="w-full rounded-xl py-6 text-base font-semibold shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-emerald-600 hover:bg-emerald-700"
              :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              <template v-else>Masuk Sekarang</template>
            </Button>
          </CardFooter>
        </form>
        <div class="px-8 pb-10 text-center">
          <p class="text-sm text-slate-500">
            Belum memiliki akun?
            <a href="#" class="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors">
              Hubungi administrator
            </a>
          </p>
        </div>
      </Card>
      <div class="mt-10 text-center text-sm text-slate-400">
        <p>&copy; 2024 WaterBill Admin. Hak Cipta Dilindungi Undang-Undang.</p>
      </div>
    </div>
  </div>
</template>
