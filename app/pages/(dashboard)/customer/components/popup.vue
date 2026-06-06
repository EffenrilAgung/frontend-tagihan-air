<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

        <!-- Modal Card -->
        <div class="relative bg-popover text-popover-foreground w-full max-w-md rounded-lg border p-6 shadow-lg mx-4">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-sm">{{ isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan' }}</h3>
                <button class="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    @click="$emit('close')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel for="edit-id-pelanggan">ID Pelanggan</FieldLabel>
                        <Input id="edit-id-pelanggan" v-model="form.id_pelanggan" type="text"
                            placeholder="Masukkan ID pelanggan" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-nama">Nama Pelanggan</FieldLabel>
                        <Input id="edit-nama" v-model="form.nama" type="text" placeholder="Masukkan nama pelanggan" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-no-hp">Nomor HP</FieldLabel>
                        <Input id="edit-no-hp" v-model="form.no_hp" type="text" placeholder="Masukkan nomor HP" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-tarif">Tarif</FieldLabel>
                        <Select :model-value="form.tarif_id ? String(form.tarif_id) : ''" @update:model-value="(val) => form.tarif_id = Number(val)">
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
                        <Select v-model="selectedStatus">
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
                        <Button variant="outline" size="sm" @click="$emit('close')">Cancel</Button>
                        <Button size="sm" @click="handleSave">{{ isEdit ? 'Save' : 'Add' }}</Button>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
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
}>()

const emit = defineEmits<{
    close: []
    save: [pelangganId: number | null, form: PelangganForm]
}>()

const isEdit = props.pelanggan !== null && props.pelanggan !== undefined

const selectedStatus = ref<'Aktif' | 'Tidak Aktif'>('Aktif')

const form = reactive<PelangganForm>({
    id_pelanggan: '',
    nama: '',
    no_hp: '',
    tarif_id: 0,
    status_aktif: true,
})

// Sync form when modal opens
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

// Sync status_aktif when selectedStatus changes
watch(selectedStatus, (val) => {
    form.status_aktif = val === 'Aktif'
})

const handleSave = () => {
    emit('save', props.pelanggan?.id ?? null, { ...form })
    emit('close')
}
</script>
