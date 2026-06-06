<script setup lang="ts">
import { ref, watch } from 'vue'

// Define the customer interface
interface Customer {
  id: number
  name: string
  initialMeter: number
  finalMeter: number
  usage: number
  billing: number
  status: 'Paid' | 'Pending'
  photo: string
}

// Define component props
interface Props {
  isOpen: boolean
  customer: Customer | null
}

const props = defineProps<Props>()

// Define emits for parent component interaction
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'save', data: { customerId: number; finalMeter: number; photo: File | null }): void
}>()

// Local state
const finalMeter = ref(props.customer?.finalMeter || 0)
const photo = ref<File | null>(null)

// Watch for changes in customer prop
watch(() => props.customer, (newCustomer) => {
  if (newCustomer) {
    finalMeter.value = newCustomer.finalMeter
  }
})

// Handle file input change
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    photo.value = target.files[0]
  }
}

// Handle save action
const handleSave = () => {
  if (props.customer) {
    emit('save', {
      customerId: props.customer.id,
      finalMeter: finalMeter.value,
      photo: photo.value
    })
    handleClose()
  }
}

// Handle close action
const handleClose = () => {
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Input Meteran: {{ customer?.name }}</DialogTitle>
        <DialogDescription>
          Masukkan pembacaan meteran terbaru dan foto meteran.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="final-meter" class="text-right">
            Meter Akhir
          </Label>
          <Input
            id="final-meter"
            v-model="finalMeter"
            type="number"
            class="col-span-3"
            :placeholder="customer?.finalMeter.toString() || 'Masukkan angka'"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="meter-photo" class="text-right">
            Foto Meteran
          </Label>
          <div class="col-span-3">
            <Input 
              id="meter-photo" 
              type="file" 
              accept="image/*" 
              @change="handleFileChange"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="handleClose">Batal</Button>
        <Button type="submit" @click="handleSave">Simpan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>