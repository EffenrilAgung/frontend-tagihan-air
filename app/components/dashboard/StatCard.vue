<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  isCurrency?: boolean
  isDifference?: boolean
}

const props = defineProps<Props>()

const formattedValue = computed(() => {
  if (props.isCurrency && typeof props.value === 'number') {
    return `Rp ${props.value.toLocaleString('id-ID')}`
  }
  return props.value
})

const valueClass = computed(() => {
  if (props.isDifference) {
    if (typeof props.value === 'number') {
      return props.value >= 0 ? 'text-green-500' : 'text-red-500'
    }
  }
  return 'text-slate-900 dark:text-white'
})
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-xl font-bold sm:text-2xl" :class="valueClass">{{ formattedValue }}</div>
    </CardContent>
  </Card>
</template>