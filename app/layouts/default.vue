<template>
  <SidebarProvider>
    <SidebarMobileRouteClose />
    <div class="flex min-h-svh w-full min-w-0 overflow-x-hidden">
      <!-- Sidebar -->
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader class="relative z-10 h-16 border-b border-border bg-white px-4 sm:px-6">
          <div class="flex h-full min-w-0 items-center">
            <NuxtLink to="/dashboard" class="flex min-w-0 items-center gap-2 font-semibold">
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span class="text-sm font-bold">S</span>
              </div>
              <span class="truncate text-base sm:text-lg">Tagihan Air</span>
            </NuxtLink>
          </div>
        </SidebarHeader>

        <SidebarContent class="bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/dashboard" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-layout-dashboard">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                  <span>Dashboard</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <button class="flex items-center gap-2" @click="customerMenuOpen = !customerMenuOpen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-users">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Customers</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-chevron-down transition-transform"
                    :class="customerMenuOpen ? 'rotate-180' : ''">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </SidebarMenuButton>
              <SidebarMenuSub v-if="customerMenuOpen">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton as-child>
                    <NuxtLink to="/customer" class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-list">
                        <line x1="8" x2="21" y1="6" y2="6" />
                        <line x1="8" x2="21" y1="12" y2="12" />
                        <line x1="8" x2="21" y1="18" y2="18" />
                        <line x1="3" x2="3.01" y1="6" y2="6" />
                        <line x1="3" x2="3.01" y1="12" y2="12" />
                        <line x1="3" x2="3.01" y1="18" y2="18" />
                      </svg>
                      <span>List</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

              </SidebarMenuSub>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/tarif" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-gauge">
                    <path d="m12 14 4-4" />
                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                  </svg>
                  <span>Tarif</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/pencatatan-meter" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-move-diagonal">
                    <path d="M11 19H5V13" />
                    <path d="M13 5H19V11" />
                    <path d="M18 6L6 18" />
                  </svg>
                  <span>Pencatatan Meter</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/billing" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-credit-card">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  <span>Billing</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/reports" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-bar-chart">
                    <line x1="12" x2="12" y1="20" y2="10" />
                    <line x1="18" x2="18" y1="20" y2="4" />
                    <line x1="6" x2="6" y1="20" y2="16" />
                  </svg>
                  <span>Reports</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/settings" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-settings">
                    <path
                      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Settings</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter class="relative border-t border-border bg-white p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2 min-w-0">
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {{ userInitial }}
              </div>
              <div class="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span class="truncate text-sm font-medium">{{ user?.nama || 'User' }}</span>
                <span class="truncate text-xs text-muted-foreground">{{ user?.email || '' }}</span>
              </div>
            </div>
            <SidebarMenuAction as-child>
              <button class="rounded-md p-1 hover:bg-muted" @click="accountMenuOpen = !accountMenuOpen">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="lucide lucide-chevron-down transition-transform" :class="accountMenuOpen ? 'rotate-180' : ''">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </SidebarMenuAction>
          </div>
          <!-- Dropdown menu -->
          <div v-if="accountMenuOpen"
            class="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-md shadow-lg z-50">
            <div class="py-1">
              <NuxtLink to="/settings"
                class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="lucide lucide-settings">
                  <path
                    d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Settings</span>
              </NuxtLink>
              <button
                class="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-destructive"
                @click="handleLogout">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="lucide lucide-log-out">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <!-- Main Content Area -->
      <SidebarInset class="flex min-w-0 flex-1 flex-col">
        <!-- Header -->
        <header
          class="sticky top-0 z-10 flex h-14 min-h-14 items-center justify-between gap-3 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:h-16 sm:min-h-16 sm:px-6"
        >
          <div class="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger
              class="-ml-0.5 h-10 w-10 shrink-0 touch-manipulation md:h-7 md:w-7"
            />
            <h1 class="truncate text-base font-semibold sm:text-lg">
              {{ currentPageTitle }}
            </h1>
          </div>

          <div class="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              class="touch-manipulation rounded-full p-2.5 hover:bg-muted sm:p-2"
              aria-label="Notifikasi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-bell">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <div
              class="hidden h-8 w-8 shrink-0 rounded-full bg-muted sm:block"
              aria-hidden="true"
            />
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6">
          <slot />
        </main>
      </SidebarInset>
    </div>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import SidebarMobileRouteClose from '@/components/dashboard/SidebarMobileRouteClose.vue'

const route = useRoute()
const { user, logout } = useAuth()

const customerMenuOpen = ref(false)
const accountMenuOpen = ref(false)

const routeTitleMap: Record<string, string> = {
  '/': 'Masuk',
  '/dashboard': 'Dashboard',
  '/customer': 'Daftar Pelanggan',
  '/customer/register': 'Registrasi Pelanggan',
  '/tarif': 'Tarif',
  '/pencatatan-meter': 'Pencatatan Meter',
  '/billing': 'Pembayaran',
  '/reports': 'Laporan',
  '/settings': 'Pengaturan',
}

const currentPageTitle = computed(() => routeTitleMap[route.path] ?? 'Dashboard')

const userInitial = computed(() => {
  if (user.value?.nama) {
    return user.value.nama.charAt(0).toUpperCase()
  }
  return 'U'
})

watch(
    () => route.path,
    () => {
        accountMenuOpen.value = false
    },
)

async function handleLogout() {
  accountMenuOpen.value = false
  await logout()
}
</script>

<style>
/* Custom styles for sidebar */
:root {
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3rem;
}
</style>