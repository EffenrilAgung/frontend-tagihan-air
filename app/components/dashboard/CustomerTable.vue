<script setup lang="ts">

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
  customers: Customer[]
}

const _props = defineProps<Props>()

// Define emits for parent component interaction
const emit = defineEmits<{
  openInputDialog: [customer: Customer]
}>()

// Method to handle opening the input dialog
const openInputDialog = (customer: Customer) => {
  emit('openInputDialog', customer)
}
</script>

<template>
  <Card>
    <CardContent class="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama Pelanggan</TableHead>
            <TableHead>Meter Awal</TableHead>
            <TableHead>Meter Akhir</TableHead>
            <TableHead>Pemakaian (m³)</TableHead>
            <TableHead>Total Tagihan (Rp)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="customer in customers" :key="customer.id">
            <TableCell>{{ customer.id }}</TableCell>
            <TableCell class="font-medium">{{ customer.name }}</TableCell>
            <TableCell>{{ customer.initialMeter }}</TableCell>
            <TableCell>{{ customer.finalMeter }}</TableCell>
            <TableCell>{{ customer.usage }}</TableCell>
            <TableCell>Rp {{ customer.billing.toLocaleString('id-ID') }}</TableCell>
            <TableCell>
              <span
:class="{
                'px-2 py-1 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100': customer.status === 'Paid',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100': customer.status === 'Pending'
              }">
                {{ customer.status }}
              </span>
            </TableCell>
            <TableCell>
              <Button size="sm" @click="openInputDialog(customer)">Input</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>