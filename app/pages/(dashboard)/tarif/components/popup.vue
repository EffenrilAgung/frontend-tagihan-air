<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

        <!-- Modal Card -->
        <div class="relative bg-popover text-popover-foreground w-full max-w-md rounded-lg border p-6 shadow-lg mx-4">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-sm">{{ isEdit ? 'Edit Tarif' : 'Tambah Tarif' }}</h3>
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
                        <FieldLabel for="edit-nama-kategori">Nama Kategori</FieldLabel>
                        <Input id="edit-nama-kategori" v-model="form.nama_kategori" type="text"
                            placeholder="Masukkan nama kategori" />
                    </Field>
                    <Field>
                        <FieldLabel for="edit-harga-m2">Harga M2 (Rp)</FieldLabel>
                        <Input id="edit-harga-m2" v-model.number="form.harga_m2" type="number"
                            placeholder="Masukkan harga per M2" />
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
import { reactive, watch } from 'vue'
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Tarif, TarifForm } from '~/types/tarif'

const props = defineProps<{
    open: boolean
    tarif?: Tarif | null
}>()

const emit = defineEmits<{
    close: []
    save: [tarifId: number | null, form: TarifForm]
}>()

const isEdit = props.tarif !== null && props.tarif !== undefined

const form = reactive<TarifForm>({
    nama_kategori: '',
    harga_m2: 0,
})

// Sync form when modal opens with a different tarif
watch(() => props.open, (isOpen) => {
    if (isOpen && props.tarif) {
        form.nama_kategori = props.tarif.nama_kategori
        form.harga_m2 = props.tarif.harga_per_m3
    } else if (isOpen && !props.tarif) {
        form.nama_kategori = ''
        form.harga_m2 = 0
    }
}, { immediate: true })

const handleSave = () => {
    emit('save', props.tarif?.id ?? null, { ...form })
    emit('close')
}
</script>
