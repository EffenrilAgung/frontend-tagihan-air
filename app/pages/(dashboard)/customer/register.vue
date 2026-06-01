<template>
    <WrapContent title="Daftar Pelanggan Baru">
        <template #content>
            <div v-if="loading" class="space-y-6">
                <div class="space-y-4">
                    <div v-for="i in 4" :key="i" class="space-y-2">
                        <Skeleton class="h-4 w-28" />
                        <Skeleton class="h-10 w-full rounded-md" />
                    </div>
                    <Skeleton class="h-10 w-24 rounded-md" />
                </div>
            </div>

            <form v-else class="max-w-lg" @submit.prevent="handleSubmit">
                <FieldSet>
                    <FieldGroup>
                        <Field>
                            <FieldLabel for="id-pelanggan">ID Pelanggan</FieldLabel>
                            <Input
                                id="id-pelanggan"
                                v-model="form.id_pelanggan"
                                type="text"
                                placeholder="Contoh: PLG-001"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel for="nama-pelanggan">Nama Pelanggan</FieldLabel>
                            <Input
                                id="nama-pelanggan"
                                v-model="form.nama"
                                type="text"
                                placeholder="Masukkan nama pelanggan"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel for="no-hp">Nomor HP</FieldLabel>
                            <Input
                                id="no-hp"
                                v-model="form.no_hp"
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                            <FieldDescription>Masukkan nomor HP yang valid.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel for="tarif">Tarif</FieldLabel>
                            <Select
                                :model-value="form.tarif_id ? String(form.tarif_id) : ''"
                                @update:model-value="(val) => form.tarif_id = Number(val)"
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="Pilih tarif" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tarif</SelectLabel>
                                        <SelectItem
                                            v-for="tarif in tarifOptions"
                                            :key="tarif.id"
                                            :value="String(tarif.id)"
                                        >
                                            {{ tarif.nama_kategori }} — {{ formatCurrency(tarif.harga_per_m3) }}/m³
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p v-if="tarifOptions.length === 0" class="mt-1 text-xs text-amber-600">
                                Belum ada tarif. Tambahkan tarif terlebih dahulu di menu Tarif.
                            </p>
                        </Field>
                        <Field>
                            <FieldLabel for="status">Status</FieldLabel>
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
                        <Field orientation="horizontal" class="gap-2 pt-2">
                            <Button type="button" variant="outline" @click="navigateTo('/customer')">
                                Batal
                            </Button>
                            <Button type="submit" :disabled="saving || !form.tarif_id">
                                <Loader2 v-if="saving" class="mr-2 size-4 animate-spin" />
                                Simpan
                            </Button>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </form>
        </template>
    </WrapContent>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import WrapContent from '~/components/dashboard/WrapContent.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { PelangganForm } from '~/types/customers'
import type { Tarif } from '~/types/tarif'
import { useCustomerCore } from '~/composables/customer/useCostumer'
import { useTarifCore } from '~/composables/tarif/useTarif'
import { formatCurrency } from '~/utils/utils'

const loading = ref(true)
const saving = ref(false)
const tarifOptions = ref<Tarif[]>([])
const selectedStatus = ref<'Aktif' | 'Tidak Aktif'>('Aktif')

const form = reactive<PelangganForm>({
    id_pelanggan: '',
    nama: '',
    no_hp: '',
    tarif_id: 0,
    status_aktif: true,
})

const { createCustomer } = useCustomerCore()
const { getTarif } = useTarifCore()

watch(selectedStatus, (val) => {
    form.status_aktif = val === 'Aktif'
})

onMounted(async () => {
    try {
        tarifOptions.value = await getTarif()
    } catch {
        toast.error('Gagal memuat daftar tarif')
    } finally {
        loading.value = false
    }
})

async function handleSubmit() {
    if (!form.id_pelanggan.trim() || !form.nama.trim() || !form.no_hp.trim() || !form.tarif_id) {
        toast.error('Lengkapi semua field yang wajib diisi')
        return
    }

    saving.value = true
    try {
        await createCustomer({ ...form })
        toast.success('Pelanggan berhasil didaftarkan')
        await navigateTo('/customer')
    } catch (err: unknown) {
        const message = (err as { message?: string })?.message ?? 'Gagal mendaftarkan pelanggan'
        toast.error(message)
    } finally {
        saving.value = false
    }
}
</script>
