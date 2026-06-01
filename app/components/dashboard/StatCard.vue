<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

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
  if (props.isDifference && typeof props.value === 'number') {
    return props.value >= 0 ? 'text-emerald-600' : 'text-red-600'
  }
  return 'text-emerald-600 dark:text-emerald-400'
})
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div :class="cn('text-xl font-bold sm:text-2xl', valueClass)">
        {{ formattedValue }}
      </div>
    </CardContent>
  </Card>
</template>