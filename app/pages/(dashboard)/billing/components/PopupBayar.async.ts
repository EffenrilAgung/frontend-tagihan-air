import { defineAsyncComponent } from 'vue'

export const PopupBayar = defineAsyncComponent(
    () => import('./PopupBayar.vue'),
)
