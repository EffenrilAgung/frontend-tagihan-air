<template>
  <Dialog :open="open" @update:open="(v) => !v && $emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Bagikan Tagihan</DialogTitle>
        <DialogDescription>
          {{ pencatatan?.pelanggan?.nama ?? 'Pelanggan' }}
          <span v-if="pencatatan?.pelanggan?.no_hp" class="text-muted-foreground">
            · {{ pencatatan.pelanggan.no_hp }}
          </span>
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="overflow-hidden rounded-lg border bg-muted/30">
          <ImageWithLoader
            v-if="fotoUrl"
            :src="fotoUrl"
            alt="Foto meteran"
            img-class="max-h-48 w-full object-contain bg-black/5"
            skeleton-class="h-48 w-full"
          />
          <div
            v-else
            class="flex h-32 items-center justify-center text-sm text-muted-foreground"
          >
            [foto meteran]
          </div>
        </div>

        <div class="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line font-mono">
          {{ messageText }}
        </div>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-col">
        <Button
          class="w-full bg-green-600 hover:bg-green-700 text-white"
          :disabled="copying || sharing"
          @click="handleSharePersonal"
        >
          <Loader2 v-if="sharing" class="mr-2 size-4 animate-spin" />
          <MessageCircle v-else class="mr-2 size-4" />
          Kirim ke Nomor Pribadi
        </Button>
        <Button
          variant="outline"
          class="w-full"
          :disabled="copying || sharing"
          @click="handleCopy"
        >
          <Loader2 v-if="copying" class="mr-2 size-4 animate-spin" />
          <Copy v-else class="mr-2 size-4" />
          Salin Teks &amp; Foto
        </Button>
        <Button variant="ghost" class="w-full" @click="$emit('close')">
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Copy, Loader2, MessageCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ImageWithLoader from '@/components/ui/image/ImageWithLoader.vue'
import type { PencatatanMeter } from '~/types/pencatatan-meter'
import {
  buildTagihanWaMessage,
  copyTagihanToClipboard,
  openWhatsAppPersonalShare,
  resolveFotoUrl,
} from '~/utils/whatsapp-tagihan'

const props = defineProps<{
  open: boolean
  pencatatan: PencatatanMeter | null
  apiBase: string
}>()

defineEmits<{
  close: []
}>()

const copying = ref(false)
const sharing = ref(false)

const messageText = computed(() =>
  props.pencatatan ? buildTagihanWaMessage(props.pencatatan) : '',
)

const fotoUrl = computed(() =>
  props.pencatatan ? resolveFotoUrl(props.pencatatan.foto_meteran_path, props.apiBase) : null,
)

async function handleCopy() {
  if (!props.pencatatan || copying.value) return

  copying.value = true
  try {
    const result = await copyTagihanToClipboard(props.pencatatan, props.apiBase)
    if (result === 'text-and-image') {
      toast.success('Teks dan foto disalin. Tempel di WhatsApp (Ctrl+V / tap & tahan).')
    } else {
      toast.success('Teks tagihan disalin.')
      if (props.pencatatan.foto_meteran_path) {
        toast.info('Foto tidak bisa disalin otomatis di browser ini — lampirkan manual.')
      }
    }
  } catch {
    toast.error('Gagal menyalin ke clipboard')
  } finally {
    copying.value = false
  }
}

function handleSharePersonal() {
  if (!props.pencatatan || sharing.value) return

  const phone = props.pencatatan.pelanggan?.no_hp
  if (!phone?.trim()) {
    toast.error('Nomor HP pelanggan belum diisi')
    return
  }

  sharing.value = true
  try {
    const ok = openWhatsAppPersonalShare({
      phone,
      text: messageText.value,
    })
    if (!ok) {
      toast.error('Nomor HP pelanggan tidak valid')
    }
  } finally {
    sharing.value = false
  }
}
</script>
