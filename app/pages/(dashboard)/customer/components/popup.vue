<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="!isSaving && !loading && $emit('close')" />

        <!-- Modal Card -->
        <div class="relative bg-popover text-popover-foreground w-full max-w-md rounded-lg border p-6 shadow-lg mx-4">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-sm">{{ isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan' }}</h3>
                <button
                    class="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    :disabled="isSaving || loading"
                    @click="$emit('close')"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <!-- Loading state saat fetch data edit -->
            <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-8">
                <Loader2 class="size-8 animate-spin text-muted-foreground" />
                <p class="text-sm text-muted-foreground">Memuat data pelanggan...</p>
            </div>

            <!-- Form -->
            <FieldSet v-else>
                <FieldGroup>
                    <Field>
                        <FieldLabel for="edit-id-pelanggan">ID Pelanggan</FieldLabel>
                        <Input id="edit-id-pelanggan" v-model="form.id_pelanggan" type="text"
                            placeholder="Masukkan ID pelanggan" :disabled="isSaving" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-nama">Nama Pelanggan</FieldLabel>
                        <Input id="edit-nama" v-model="form.nama" type="text" placeholder="Masukkan nama pelanggan"
                            :disabled="isSaving" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-no-hp">Nomor HP</FieldLabel>
                        <Input id="edit-no-hp" v-model="form.no_hp" type="text" placeholder="Masukkan nomor HP"
                            :disabled="isSaving" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-tarif">Tarif</FieldLabel>
                        <Select :model-value="form.tarif_id ? String(form.tarif_id) : ''"
                            @update:model-value="(val) => form.tarif_id = Number(val)" :disabled="isSaving">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Pilih tarif" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Tarif</SelectLabel>
                                    <SelectItem v-for="tarif in tarifOptions" :key="tarif.id" :value="String(tarif.id)">
                                        {{ tarif.nama_kategori }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel for="edit-status">Status</FieldLabel>
                        <Select v-model="selectedStatus" :disabled="isSaving">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field orientation="horizontal" class="gap-2">
                        <Button variant="outline" size="sm" @click="$emit('close')" :disabled="isSaving">Batal</Button>
                        <Button size="sm" @click="handleSave" :disabled="isSaving">
                            <Loader2 v-if="isSaving" class="mr-2 size-4 animate-spin" />
                            {{ isSaving ? 'Menyimpan...' : (isEdit ? 'Simpan' : 'Tambah') }}
                        </Button>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
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
import type { Pelanggan, PelangganForm } from '~/types/customers'
import type { Tarif } from '~/types/tarif'

const props = defineProps<{
    open: boolean
    pelanggan?: Pelanggan | null
    tarifOptions: Tarif[]
    loading?: boolean
    isEditMode?: boolean
    onSave: (pelangganId: number | null, form: PelangganForm) => Promise<Pelanggan>
}>()

const emit = defineEmits<{
    close: []
    saved: [pelanggan: Pelanggan]
}>()

const { handleApiError } = useNotification()

const isEdit = computed(() => props.isEditMode ?? (props.pelanggan !== null && props.pelanggan !== undefined))

const selectedStatus = ref<'Aktif' | 'Tidak Aktif'>('Aktif')
const isSaving = ref(false)

const form = reactive<PelangganForm>({
    id_pelanggan: '',
    nama: '',
    no_hp: '',
    tarif_id: 0,
    status_aktif: true,
})

watch(() => props.open, (isOpen) => {
    if (isOpen && props.pelanggan) {
        form.id_pelanggan = props.pelanggan.id_pelanggan
        form.nama = props.pelanggan.nama
        form.no_hp = props.pelanggan.no_hp
        form.tarif_id = props.pelanggan.tarif_id
        form.status_aktif = props.pelanggan.status_aktif
        selectedStatus.value = props.pelanggan.status_aktif ? 'Aktif' : 'Tidak Aktif'
    } else if (isOpen && !props.pelanggan) {
        form.id_pelanggan = ''
        form.nama = ''
        form.no_hp = ''
        form.tarif_id = 0
        form.status_aktif = true
        selectedStatus.value = 'Aktif'
    }
}, { immediate: true })

watch(selectedStatus, (val) => {
    form.status_aktif = val === 'Aktif'
})

const handleSave = async () => {
    if (isSaving.value) return

    isSaving.value = true
    try {
        const result = await props.onSave(props.pelanggan?.id ?? null, { ...form })
        emit('saved', result)
        emit('close')
    } catch (error) {
        handleApiError(error, 'Terjadi kesalahan saat menyimpan data pelanggan')
    } finally {
        isSaving.value = false
    }
}
</script>
