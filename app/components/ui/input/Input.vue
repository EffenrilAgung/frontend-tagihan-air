<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
}>()

const emit = defineEmits<{
  "update:modelValue": [payload: string | number]
}>()

const attrs = useAttrs()

/** :value + @input — konsisten di SSR dan client (hindari hydration mismatch) */
const value = computed(() => {
  const v = props.modelValue ?? props.defaultValue
  return v === undefined || v === null ? "" : String(v)
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}
</script>

<template>
  <input
    v-bind="attrs"
    :value="value"
    data-slot="input"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      'rounded-sm border-slate-200 bg-slate-50 focus:ring-1 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200',
      props.class,
    )"
    @input="onInput"
  >
</template>
