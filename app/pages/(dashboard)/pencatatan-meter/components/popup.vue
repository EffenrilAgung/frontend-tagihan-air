<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="!isSaving && $emit('close')" />

        <!-- Modal Card -->
        <div
            class="relative mx-0 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border bg-popover text-popover-foreground shadow-lg sm:mx-4 sm:max-h-[90vh] sm:max-w-xl sm:rounded-lg">
            <div class="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
                <h3 class="text-base font-semibold sm:text-sm">{{ isEdit ? 'Edit Pencatatan Meter' : 'Input Pencatatan Meter' }}</h3>
                <button class="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    :disabled="isSaving" @click="$emit('close')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
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
                        <div class="space-y-3">
                            <input
                                id="edit-foto"
                                ref="fotoInputRef"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                class="sr-only"
                                @change="handleFileChange"
                            />
                            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    class="w-full touch-manipulation sm:w-auto"
                                    :disabled="isSaving"
                                    @click="triggerFotoPicker"
                                >
                                    {{ hasFoto ? 'Ganti Foto' : 'Ambil / Pilih Foto' }}
                                </Button>
                                <Button
                                    v-if="hasFoto"
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    class="w-full touch-manipulation sm:w-auto"
                                    :disabled="isSaving"
                                    @click="clearFoto"
                                >
                                    Hapus Foto
                                </Button>
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Semua format gambar dari kamera HP didukung. Maks. 100 MB.
                            </p>
                        </div>
                        <!-- Preview foto -->
                        <div v-if="previewUrl" class="mt-3 overflow-hidden rounded-lg border bg-muted/20 p-2">
                            <ImageWithLoader :src="previewUrl" alt="Preview foto meteran"
                                img-class="mx-auto max-h-56 w-full rounded-md object-contain sm:max-h-40"
                                skeleton-class="h-56 w-full rounded-md sm:h-40" />
                        </div>
                    </Field>

                    <!-- Actions -->
                    <Field orientation="horizontal" class="sticky bottom-0 gap-2 border-t bg-popover pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                        <Button variant="outline" size="sm" class="flex-1 touch-manipulation" @click="$emit('close')" :disabled="isSaving">Batal</Button>
                        <Button size="sm" class="flex-1 touch-manipulation" @click="handleSave" :disabled="!isFormValid || isSaving">
                            <Loader2 v-if="isSaving" class="mr-2 size-4 animate-spin" />
                            {{ isSaving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan') }}
                        </Button>
                    </Field>
                </FieldGroup>
            </FieldSet>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ImageWithLoader from '@/components/ui/image/ImageWithLoader.vue'
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
import { toApiError } from '~/types/response-server'
import type { PencatatanMeter, PencatatanMeterForm } from '~/types/pencatatan-meter'
import type { Pelanggan } from '~/types/customers'
import { formatCurrency, getLocalDateString } from '~/utils/utils'

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

const todayDate = ref<string>(getLocalDateString())

const fotoInputRef = ref<HTMLInputElement | null>(null)

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

const MAX_FOTO_SIZE = 100 * 1024 * 1024

function triggerFotoPicker() {
    fotoInputRef.value?.click()
}

// File handling
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.size > MAX_FOTO_SIZE) {
        toast.error('Ukuran foto maksimal 100 MB')
        target.value = ''
        return
    }

    form.foto_meteran = file
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
        previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const clearFoto = () => {
    form.foto_meteran = null
    previewUrl.value = null
    if (fotoInputRef.value) {
        fotoInputRef.value.value = ''
    }
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
        todayDate.value = getLocalDateString()
        if (fotoInputRef.value) {
            fotoInputRef.value.value = ''
        }
        if (props.pencatatan) {
            // Edit mode
            form.pelanggan_id = props.pencatatan.pelanggan_id
            form.tanggal_pencatatan = props.pencatatan.tanggal_pencatatan?.split('T')[0]
                || props.pencatatan.tanggal_pencatatan?.slice(0, 10)
                || todayDate.value
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
    } catch (error: unknown) {
        console.error('Gagal menyimpan pencatatan:', error)

        handleApiError(error, 'Terjadi kesalahan saat menyimpan data')

        const apiError = toApiError(error)
        const errMsg = apiError.message || 'Terjadi kesalahan saat menyimpan data'
        errorMessage.value = errMsg

        if (apiError.status === 422 && apiError.errors) {
            const errors: string[] = []
            for (const [, messages] of Object.entries(apiError.errors)) {
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
