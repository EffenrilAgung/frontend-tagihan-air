<script setup lang="ts">
import type { SidebarProps } from "."
import { cn } from "@/lib/utils"
import { SIDEBAR_WIDTH_MOBILE, useSidebar } from "./utils"
import { onMounted, ref } from "vue"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SidebarProps>(), {
  side: "left",
  variant: "sidebar",
  collapsible: "offcanvas",
})

const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

// Prevent hydration mismatch: the mobile sheet variant must only render
// after the component has mounted on the client (post-hydration).
// During SSR and the initial client-side hydration pass, the desktop
// v-else branch is always rendered so the HTML matches exactly.
const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
})
</script>

<template>
  <div v-if="collapsible === 'none'" data-slot="sidebar"
    :class="cn('flex h-full w-(--sidebar-width) flex-col bg-white text-foreground', props.class)"
    v-bind="$attrs">
    <slot />
  </div>

  <LazySheet v-else-if="isHydrated && isMobile" :open="openMobile" v-bind="$attrs" @update:open="setOpenMobile">
    <LazySheetContent data-sidebar="sidebar" data-slot="sidebar" data-mobile="true" :side="side"
      class="z-100 w-(--sidebar-width) border-border bg-white p-0 text-foreground shadow-xl [&>button]:hidden" :style="{
        '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
      }">
      <LazySheetHeader class="sr-only">
        <LazySheetTitle>Sidebar</LazySheetTitle>
        <LazySheetDescription>Displays the mobile sidebar.</LazySheetDescription>
      </LazySheetHeader>
      <div class="flex h-full w-full flex-col bg-white pt-[env(safe-area-inset-top)]">
        <slot />
      </div>
    </LazySheetContent>
  </LazySheet>

  <div v-else class="group peer hidden text-foreground md:block" data-slot="sidebar" :data-state="state"
    :data-collapsible="state === 'collapsed' ? collapsible : ''" :data-variant="variant" :data-side="side">
    <!-- This is what handles the sidebar gap on desktop  -->
    <div :class="cn(
      'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
      'group-data-[collapsible=offcanvas]:w-0',
      'group-data-[side=right]:rotate-180',
      variant === 'floating' || variant === 'inset'
        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
    )" />
    <div :class="cn(
      'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
      side === 'left'
        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
      // Adjust the padding for floating and inset variants.
      variant === 'floating' || variant === 'inset'
        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
      props.class,
    )" v-bind="$attrs">
      <div data-sidebar="sidebar"
        class="flex h-full w-full flex-col bg-white group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-border group-data-[variant=floating]:shadow-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
