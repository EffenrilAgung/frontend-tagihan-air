<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

        <!-- Modal Card -->
        <div
            class="relative bg-popover text-popover-foreground w-full max-w-xl rounded-lg border p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-sm">Proses Pembayaran</h3>
                <button class="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    @click="$emit('close')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <!-- Inline Error -->
            <div v-if="errorMessage" class="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3">
                <div class="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="mt-0.5 shrink-0 text-red-500">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <div class="text-sm text-red-700">
                        <p class="font-medium">{{ errorMessage }}</p>
                        <ul v-if="fieldErrors.length > 0" class="mt-1 list-inside list-disc space-y-0.5">
                            <li v-for="(err, idx) in fieldErrors" :key="idx">{{ err }}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Info Tagihan -->
            <div v-if="selectedBill" class="mb-6 rounded-lg border bg-muted/30 p-4">
                <h4 class="mb-2 text-sm font-medium">Detail Tagihan</h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <span class="text-muted-foreground">Pelanggan</span>
                    <span class="text-right font-medium">{{ selectedBill.pelanggan?.nama || '-' }}</span>

                    <span class="text-muted-foreground">ID Pelanggan</span>
                    <span class="text-right font-medium">{{ selectedBill.pelanggan?.id_pelanggan || '-' }}</span>

                    <span class="text-muted-foreground">Periode</span>
                    <span class="text-right font-medium">{{ formatDate(new Date(selectedBill.tanggal_pencatatan),
                        dateFormat) }}</span>

                    <span class="text-muted-foreground">Pemakaian</span>
                    <span class="text-right font-medium">{{ selectedBill.pemakaian_m3 }} M³</span>

                    <span class="text-muted-foreground">Tagihan Dasar</span>
                    <span class="text-right font-medium">{{ formatCurrency(selectedBill.total_tagihan_dasar) }}</span>

                    <span v-if="selectedBill.denda_persen > 0" class="text-muted-foreground text-red-600">Denda ({{
                        (selectedBill.denda_persen * 100).toFixed(0) }}%)</span>
                    <span v-if="selectedBill.denda_persen > 0" class="text-right font-medium text-red-600">{{
                        formatCurrency(selectedBill.denda_rp) }}</span>

                    <span class="text-muted-foreground font-semibold">Total Dibayar</span>
                    <span class="text-right font-semibold text-primary">{{
                        formatCurrency(selectedBill.total_setelah_denda) }}</span>
                </div>
            </div>

            <!-- Form -->
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel for="field-tanggal-bayar">Tanggal Bayar</FieldLabel>
                        <Input id="field-tanggal-bayar" type="date" v-model="form.tanggal_bayar" :max="getToday()" />
                    </Field>

                    <Field>
                        <FieldLabel for="field-metode-bayar">Metode Bayar</FieldLabel>
                        <Select v-model="form.metode_bayar">
                            <SelectTrigger id="field-metode-bayar" class="w-full">
                                <SelectValue placeholder="Pilih metode bayar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="tunai">Tunai</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                    <SelectItem value="edc">EDC</SelectItem>
                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel for="field-catatan">Catatan (opsional)</FieldLabel>
                        <Textarea id="field-catatan" v-model="form.catatan" placeholder="Catatan pembayaran..."
                            rows="2" />
                    </Field>
                </FieldGroup>
            </FieldSet>

            <!-- Actions -->
            <div class="mt-6 flex items-center justify-end gap-2">
                <Button variant="outline" @click="$emit('close')" :disabled="saving">Batal</Button>
                <Button @click="handleSave" :disabled="saving || !form.tanggal_bayar || !form.metode_bayar">
                    <template v-if="saving">
                        <Loader2Icon class="mr-2 size-4 animate-spin" />
                        Memproses...
                    </template>
                    <template v-else>
                        Konfirmasi Pembayaran
                    </template>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2Icon } from 'lucide-vue-next'
import type { PembayaranForm, UnpaidBill, Pembayaran } from '~/types/billing'
import { formatCurrency, formatDate } from '~/utils/utils'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field'

const props = defineProps<{
    open: boolean
    selectedBill: UnpaidBill | null
    onProcess: (form: PembayaranForm) => Promise<Pembayaran>
}>()

const emit = defineEmits<{
    close: []
    saved: [data: Pembayaran]
}>()

const saving = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<string[]>([])
const dateFormat = 'DD MMMM YYYY'

const getToday = (): string => new Date().toISOString().split('T')[0] ?? ''

const form = ref<PembayaranForm>({
    pencatatan_meter_id: null,
    tanggal_bayar: getToday(),
    metode_bayar: 'tunai',
    catatan: '',
})

// Reset form when dialog opens
watch(() => props.open, (isOpen) => {
    if (isOpen && props.selectedBill) {
        form.value = {
            pencatatan_meter_id: props.selectedBill.id,
            tanggal_bayar: getToday(),
            metode_bayar: 'tunai',
            catatan: '',
        }
        errorMessage.value = ''
        fieldErrors.value = []
    }
})

// Auto-clear errors when form changes
watch(form, () => {
    errorMessage.value = ''
    fieldErrors.value = []
}, { deep: true })

const handleSave = async () => {
    if (!form.value.pencatatan_meter_id || !form.value.tanggal_bayar || !form.value.metode_bayar) return

    saving.value = true
    errorMessage.value = ''
    fieldErrors.value = []

    try {
        const result = await props.onProcess(form.value)
        emit('saved', result)
    } catch (error: any) {
        console.error('Gagal memproses pembayaran:', error)

        if (error.errors && typeof error.errors === 'object') {
            // Validation errors from Laravel
            errorMessage.value = error.message || 'Validasi gagal'
            fieldErrors.value = Object.values(error.errors).flat() as string[]
        } else if (error.message) {
            errorMessage.value = error.message
        } else {
            errorMessage.value = 'Terjadi kesalahan saat memproses pembayaran'
        }
    } finally {
        saving.value = false
    }
}
</script>
