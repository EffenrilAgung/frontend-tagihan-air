<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

        <!-- Modal Card -->
        <div
            class="relative bg-popover text-popover-foreground w-full max-w-xl rounded-lg border p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-sm">{{ isEdit ? 'Edit Pencatatan Meter' : 'Input Pencatatan Meter' }}</h3>
                <button class="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    @click="$emit('close')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <!-- Inline Error Notification -->
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

            <!-- Form -->
            <FieldSet>
                <FieldGroup>
                    <!-- Pelanggan Select -->
                    <Field>
                        <FieldLabel for="edit-pelanggan">Pelanggan</FieldLabel>
                        <Select :model-value="form.pelanggan_id ? String(form.pelanggan_id) : ''"
                            @update:model-value="(val) => { const numVal = Number(val); if (numVal) { form.pelanggan_id = numVal; onPelangganChange(numVal) } }"
                            :disabled="isEdit">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Pilih pelanggan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Pelanggan</SelectLabel>
                                    <SelectItem v-for="pelanggan in pelangganOptions" :key="pelanggan.id"
                                        :value="String(pelanggan.id)">
                                        {{ pelanggan.id_pelanggan }} - {{ pelanggan.nama }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <p v-if="selectedPelangganInfo" class="text-xs text-muted-foreground mt-1">
                            Tarif: {{ selectedPelangganInfo.tarif?.nama_kategori || '-' }} |
                            Meter Awal Terakhir: {{ selectedPelangganInfo.meterAwalTerakhir ?? '-' }}
                        </p>
                    </Field>

                    <!-- Tanggal Pencatatan -->
                    <Field>
                        <FieldLabel for="edit-tanggal">Tanggal Pencatatan</FieldLabel>
                        <Input id="edit-tanggal" v-model="form.tanggal_pencatatan" type="date" :max="todayDate" />
                    </Field>

                    <!-- Meter Awal -->
                    <Field>
                        <FieldLabel for="edit-meter-awal">Meter Awal</FieldLabel>
                        <Input id="edit-meter-awal" v-model.number="form.meter_awal" type="number" min="0"
                            placeholder="Masukkan angka meter awal" />
                    </Field>

                    <!-- Meter Akhir -->
                    <Field>
                        <FieldLabel for="edit-meter-akhir">Meter Akhir</FieldLabel>
                        <Input id="edit-meter-akhir" v-model.number="form.meter_akhir" type="number" min="0"
                            placeholder="Masukkan angka meter akhir" />
                    </Field>

                    <!-- Warning when meter awal > meter akhir -->
                    <p v-if="form.meter_awal > 0 && form.meter_akhir > 0 && form.meter_awal > form.meter_akhir"
                        class="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">
                        Meter awal tidak boleh lebih besar dari meter akhir
                    </p>

                    <!-- Info pemakaian (live preview) -->
                    <div v-else-if="form.meter_akhir > 0 && form.meter_akhir >= form.meter_awal"
                        class="rounded-md bg-muted px-4 py-3 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground">Pemakaian:</span>
                            <span class="font-semibold">{{ form.meter_akhir - form.meter_awal }} M³</span>
                        </div>
                        <div v-if="selectedPelangganInfo?.tarif" class="flex items-center justify-between mt-1">
                            <span class="text-muted-foreground">Estimasi Tagihan Dasar:</span>
                            <span class="font-semibold">{{ formatCurrency(pemakaian *
                                selectedPelangganInfo.tarif.harga_per_m3) }}</span>
                        </div>
                    </div>


                    <!-- Foto Meteran -->
                    <Field>
                        <FieldLabel for="edit-foto">Foto Meteran <span
                                class="text-xs text-muted-foreground">(opsional)</span></FieldLabel>
                        <div class="flex items-center gap-3">
                            <Input id="edit-foto" type="file" accept="image/*" @change="handleFileChange"
                                class="flex-1" />
                            <Button v-if="hasFoto" variant="ghost" size="icon" @click="clearFoto" class="shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </Button>
                        </div>
                        <!-- Preview foto -->
                        <div v-if="previewUrl" class="mt-2">
                            <img :src="previewUrl" alt="Preview foto meteran"
                                class="max-h-32 rounded-md border object-cover" />
                        </div>
                    </Field>

                    <!-- Actions -->
                    <Field orientation="horizontal" class="gap-2 pt-2">
                        <Button variant="outline" size="sm" @click="$emit('close')">Batal</Button>
                        <Button size="sm" @click="handleSave" :disabled="!isFormValid">
                            {{ isEdit ? 'Simpan Perubahan' : 'Simpan' }}
                        </Button>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { PencatatanMeter, PencatatanMeterForm } from '~/types/pencatatan-meter'
import type { Pelanggan } from '~/types/customers'
import { formatCurrency } from '~/utils/utils'

const props = defineProps<{
    open: boolean
    pencatatan?: PencatatanMeter | null
    pelangganOptions: Pelanggan[]
    /** Map of pelanggan_id -> last meter_akhir value for prepopulating meter_awal */
    lastMeterReadings?: Record<number, number>
    /** Function to create a new pencatatan meter */
    onCreate: (form: PencatatanMeterForm) => Promise<PencatatanMeter>
    /** Function to update an existing pencatatan meter */
    onUpdate: (id: number, form: PencatatanMeterForm) => Promise<PencatatanMeter>
}>()

const emit = defineEmits<{
    close: []
    saved: [pencatatan: PencatatanMeter]
}>()

const { handleApiError } = useNotification()

const isEdit = props.pencatatan !== null && props.pencatatan !== undefined

const todayDate = ref<string>(new Date().toISOString().split('T')[0] ?? '')

/** Inline error notification state - cleared automatically when user interacts with form */
const errorMessage = ref<string>('')
const fieldErrors = ref<string[]>([])
const clearError = () => {
    errorMessage.value = ''
    fieldErrors.value = []
}

const selectedPelangganInfo = ref<{
    tarif: { nama_kategori: string; harga_per_m3: number } | null
    meterAwalTerakhir: number | null
} | null>(null)

const form = reactive<PencatatanMeterForm>({
    pelanggan_id: 0,
    tanggal_pencatatan: todayDate.value,
    meter_awal: 0,
    meter_akhir: 0,
    foto_meteran: null,
})

const isSaving = ref(false)

const previewUrl = ref<string | null>(null)

const pemakaian = computed<number>(() => {
    return Math.max(0, form.meter_akhir - form.meter_awal)
})


const hasFoto = computed<boolean>(() => {
    return (form.foto_meteran instanceof File) || previewUrl.value !== null
})

const isFormValid = computed<boolean>(() => {
    return (
        form.pelanggan_id > 0 &&
        form.tanggal_pencatatan !== '' &&
        form.meter_awal >= 0 &&
        form.meter_akhir >= form.meter_awal
    )
})

// Get pelanggan info when selected
const onPelangganChange = (pelangganId: number) => {
    const pelanggan = props.pelangganOptions.find(p => p.id === pelangganId)
    if (pelanggan) {
        selectedPelangganInfo.value = {
            tarif: pelanggan.tarif || null,
            meterAwalTerakhir: props.lastMeterReadings?.[pelangganId] ?? null,
        }
        // Auto-fill meter_awal with last reading if available and not editing
        if (!isEdit && selectedPelangganInfo.value.meterAwalTerakhir !== null) {
            form.meter_awal = selectedPelangganInfo.value.meterAwalTerakhir
        } else if (!isEdit) {
            form.meter_awal = 0
        }
    } else {
        selectedPelangganInfo.value = null
    }
}

// File handling
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        form.foto_meteran = file
        // Create preview
        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
            previewUrl.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const clearFoto = () => {
    form.foto_meteran = null
    previewUrl.value = null
}

// Clear inline error when any form field changes
watch(
    () => [form.pelanggan_id, form.tanggal_pencatatan, form.meter_awal, form.meter_akhir],
    () => {
        if (errorMessage.value) clearError()
    },
)

// Sync form when modal opens
watch(() => props.open, (isOpen) => {
    if (isOpen) {
        clearError()
        if (props.pencatatan) {
            // Edit mode
            form.pelanggan_id = props.pencatatan.pelanggan_id
            form.tanggal_pencatatan = props.pencatatan.tanggal_pencatatan
            form.meter_awal = props.pencatatan.meter_awal
            form.meter_akhir = props.pencatatan.meter_akhir
            form.foto_meteran = null

            // Set pelanggan info
            const pelanggan = props.pelangganOptions.find(p => p.id === props.pencatatan?.pelanggan_id)
            if (pelanggan) {
                selectedPelangganInfo.value = {
                    tarif: pelanggan.tarif || null,
                    meterAwalTerakhir: props.lastMeterReadings?.[pelanggan.id] ?? null,
                }
            }

            // Show existing foto preview if any
            previewUrl.value = props.pencatatan.foto_meteran_path || null
        } else {
            // Add mode
            form.pelanggan_id = 0
            form.tanggal_pencatatan = todayDate.value
            form.meter_awal = 0
            form.meter_akhir = 0
            form.foto_meteran = null
            selectedPelangganInfo.value = null
            previewUrl.value = null
        }
    }
}, { immediate: true })

const handleSave = async () => {
    if (!isFormValid.value || isSaving.value) return

    isSaving.value = true

    try {
        const formData: PencatatanMeterForm = {
            pelanggan_id: form.pelanggan_id,
            tanggal_pencatatan: form.tanggal_pencatatan,
            meter_awal: form.meter_awal,
            meter_akhir: form.meter_akhir,
            foto_meteran: form.foto_meteran ?? undefined,
        }

        const result = props.pencatatan
            ? await props.onUpdate(props.pencatatan.id, formData)
            : await props.onCreate(formData)

        result.created_at = new Date(result.created_at)
        result.updated_at = new Date(result.updated_at)

        emit('saved', result)
    } catch (error: any) {
        console.error('Gagal menyimpan pencatatan:', error)

        // Show toast notification
        handleApiError(error, 'Terjadi kesalahan saat menyimpan data')

        // Also show inline error in the form popup
        const errMsg = error?.message || 'Terjadi kesalahan saat menyimpan data'
        errorMessage.value = errMsg

        // Extract field validation errors (422) for inline display
        if (error?.status === 422 && error?.errors) {
            const errors: string[] = []
            for (const [, messages] of Object.entries(error.errors)) {
                if (Array.isArray(messages)) {
                    errors.push(...messages)
                }
            }
            fieldErrors.value = errors
        } else {
            fieldErrors.value = []
        }
    } finally {
        isSaving.value = false
    }
}
</script>
