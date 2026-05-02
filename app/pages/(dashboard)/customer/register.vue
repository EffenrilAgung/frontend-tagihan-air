<template>
    <WrapContent title="Daftar Pelanggan Baru">
        <template #content>
            <!-- Loading Skeleton -->
            <div v-if="loading" class="space-y-6">
                <div class="space-y-4">
                    <div v-for="i in 4" :key="i" class="space-y-2">
                        <Skeleton class="h-4 w-28" />
                        <Skeleton class="h-10 w-full rounded-md" />
                        <Skeleton v-if="i === 2" class="h-4 w-48" />
                    </div>
                    <!-- Submit button skeleton -->
                    <Skeleton class="h-10 w-24 rounded-md" />
                </div>
            </div>

            <!-- Actual Form -->
            <template v-else>
                <FieldSet>
                    <FieldGroup>
                        <Field>
                            <FieldLabel for="nama-pelanggan">
                                Nama Pelanggan
                            </FieldLabel>
                            <Input id="nama-pelanggan" type="text" placeholder="Masukkan nama pelanggan" />

                        </Field>
                        <Field>
                            <FieldLabel for="no-hp">
                                Nomor HP
                            </FieldLabel>
                            <Input id="no-hp" type="text" placeholder="Masukkan nomor HP" />
                            <FieldDescription>
                                Masukkan nomor HP yang valid.
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel for="tarif">
                                Tarif
                            </FieldLabel>
                            <Select>
                                <SelectTrigger class="w-[180px]">
                                    <SelectValue placeholder="Pilih tarif" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tarif</SelectLabel>
                                        <SelectItem value="R1">
                                            R1
                                        </SelectItem>
                                        <SelectItem value="R2">
                                            R2
                                        </SelectItem>
                                        <SelectItem value="B1">
                                            B1
                                        </SelectItem>
                                        <SelectItem value="B2">
                                            B2
                                        </SelectItem>
                                        <SelectItem value="P1">
                                            P1
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel for="status">
                                Status
                            </FieldLabel>
                            <Select>
                                <SelectTrigger class="w-[180px]">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="Aktif">
                                            Aktif
                                        </SelectItem>
                                        <SelectItem value="Tidak Aktif">
                                            Tidak Aktif
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field orientation="horizontal">
                            <Button type="submit">
                                Submit
                            </Button>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </template>
        </template>
    </WrapContent>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import WrapContent from '~/components/dashboard/WrapContent.vue';
import { Button } from '~/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select'

const loading = ref(true)

onMounted(() => {
    setTimeout(() => {
        loading.value = false
    }, 500)
})
</script>