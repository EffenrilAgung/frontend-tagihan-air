<template>
  <SidebarProvider>
    <ClientOnly>
      <SidebarMobileRouteClose />
      <template #fallback>
        <span class="sr-only" aria-hidden="true" />
      </template>
    </ClientOnly>
    <div class="flex min-h-svh w-full min-w-0 overflow-x-hidden">
      <!-- Sidebar -->
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader class="relative z-10 h-16 border-b border-border bg-white px-4 sm:px-6">
          <div class="flex h-full min-w-0 items-center">
            <NuxtLink to="/dashboard" class="flex min-w-0 items-center gap-2 font-semibold">
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Droplet class="size-4" />
              </div>
              <span class="truncate text-base sm:text-lg">Tagihan Air</span>
            </NuxtLink>
          </div>
        </SidebarHeader>

        <SidebarContent class="bg-white">
          <SidebarMenu>
            <!-- Dashboard -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/dashboard" class="flex items-center gap-2">
                  <LayoutDashboard class="size-4" />
                  <span>Dashboard</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Customers (with submenu) -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <button class="flex w-full items-center gap-2" @click="customerMenuOpen = !customerMenuOpen">
                  <Users class="size-4" />
                  <span>Customers</span>
                  <ChevronDown
                    class="ml-auto size-4 transition-transform"
                    :class="customerMenuOpen ? 'rotate-180' : ''"
                  />
                </button>
              </SidebarMenuButton>
              <SidebarMenuSub v-if="customerMenuOpen">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton as-child>
                    <NuxtLink to="/customer" class="flex items-center gap-2">
                      <List class="size-3.5" />
                      <span>Daftar</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton as-child>
                    <NuxtLink to="/customer/register" class="flex items-center gap-2">
                      <UserPlus class="size-3.5" />
                      <span>Registrasi</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <!-- Tarif -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/tarif" class="flex items-center gap-2">
                  <Gauge class="size-4" />
                  <span>Tarif</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Pencatatan Meter -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/pencatatan-meter" class="flex items-center gap-2">
                  <MoveDiagonal class="size-4" />
                  <span>Pencatatan Meter</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Billing -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/billing" class="flex items-center gap-2">
                  <CreditCard class="size-4" />
                  <span>Billing</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Reports -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/reports" class="flex items-center gap-2">
                  <BarChart3 class="size-4" />
                  <span>Reports</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Settings -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink to="/settings" class="flex items-center gap-2">
                  <Settings class="size-4" />
                  <span>Profil Akun</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <!-- Sidebar Footer — Avatar + Akun -->
        <SidebarFooter class="relative border-t border-border bg-white p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2 min-w-0">
            <div class="flex min-w-0 items-center gap-2">
              <DashboardAvatar :user="user" size="md" />
              <ClientOnly>
                <div class="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                  <span class="truncate text-sm font-medium">{{ user?.nama || 'User' }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{ user?.email || '' }}</span>
                </div>
                <template #fallback>
                  <div class="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                    <span class="truncate text-sm font-medium">User</span>
                    <span class="truncate text-xs text-muted-foreground" />
                  </div>
                </template>
              </ClientOnly>
            </div>
            <button
              class="rounded-md p-1 hover:bg-muted shrink-0"
              @click="accountMenuOpen = !accountMenuOpen"
              aria-label="Akun menu"
            >
              <ChevronDown
                class="size-4 transition-transform"
                :class="accountMenuOpen ? 'rotate-180' : ''"
              />
            </button>
          </div>
          <!-- Dropdown menu akun -->
          <div
            v-if="accountMenuOpen"
            class="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-md shadow-lg z-50"
          >
            <div class="py-1">
              <NuxtLink
                to="/settings"
                class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                @click="accountMenuOpen = false"
              >
                <Settings class="size-4" />
                <span>Profil Akun</span>
              </NuxtLink>
              <button
                class="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-destructive"
                @click="handleLogout"
              >
                <LogOut class="size-4" />
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
            <SidebarTrigger class="-ml-0.5 h-10 w-10 shrink-0 touch-manipulation md:h-7 md:w-7" />
            <h1 class="truncate text-base font-semibold sm:text-lg">
              {{ currentPageTitle }}
            </h1>
          </div>

          <div class="flex shrink-0 items-center gap-1 sm:gap-2">
            <!-- Avatar di header (mobile) -->
            <NuxtLink to="/settings" class="sm:hidden">
              <DashboardAvatar :user="user" size="sm" />
            </NuxtLink>
            <!-- Avatar di header (desktop) -->
            <NuxtLink to="/settings" class="hidden sm:block">
              <DashboardAvatar :user="user" size="md" />
            </NuxtLink>
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
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import SidebarMobileRouteClose from '@/components/dashboard/SidebarMobileRouteClose.vue'
import DashboardAvatar from '@/components/dashboard/DashboardAvatar.vue'
import {
  Droplet,
  LayoutDashboard,
  Users,
  ChevronDown,
  List,
  UserPlus,
  Gauge,
  MoveDiagonal,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-vue-next'

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
  '/settings': 'Profil Akun',
}

const currentPageTitle = computed(() => routeTitleMap[route.path] ?? 'Dashboard')

// Tutup menu saat rute berubah
watch(() => route.path, () => {
  accountMenuOpen.value = false
})

async function handleLogout() {
  accountMenuOpen.value = false
  await logout()
}
</script>

<style>
:root {
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3rem;
}
</style>
