<template>
    <div class="space-y-4 ">
        <!-- Search & Filter Bar -->
        <div v-if="searchable || filterable" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <!-- Search Input -->
            <div v-if="searchable" class="relative w-full sm:max-w-xs">
                <SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input v-model="searchQueryModel" :placeholder="searchPlaceholder || 'Cari...'"
                    class="h-9 w-full pl-9 pr-8" />
                <button v-if="searchQueryModel" @click="searchQueryModel = ''"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <XIcon class="size-4" />
                </button>
            </div>

            <!-- Filter Dropdown -->
            <div v-if="filterable && filterOptions.length" class="flex flex-wrap items-center gap-2">
                <Select v-for="filter in filterOptions" :key="filter.key" :model-value="getFilterValue(filter.key)"
                    @update:model-value="(val) => setFilterValue(filter.key, String(val ?? ''))">
                    <SelectTrigger class="h-9 w-full sm:w-45">
                        <SelectValue :placeholder="filter.placeholder || `Filter ${filter.label}`" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua {{ filter.label }}</SelectItem>
                        <SelectItem v-for="option in filter.options" :key="option.value" :value="String(option.value)">
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading">
            <TableSkeleton :columns="skeletonColumns" :rows="skeletonRows" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredData.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <InboxIcon class="mb-3 size-12 text-muted-foreground/50" />
            <span class="text-muted-foreground">
                {{ emptyMessage || 'Tidak ada data.' }}
            </span>
        </div>

        <!-- Table -->
        <div v-else class="overflow-hidden rounded-lg border">
            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead v-for="(col, colIndex) in visibleColumns" :key="col.key" :class="[
                                col.align === 'center' && 'text-center',
                                col.align === 'right' && 'text-right',
                                col.sortable && 'cursor-pointer select-none hover:text-foreground',
                                colIndex === 0 && 'pl-4',
                                colIndex === visibleColumns.length - 1 && 'pr-4',
                            ]" :style="col.width ? { width: col.width, minWidth: col.width } : undefined"
                                @click="col.sortable && toggleSort(col.key)">
                                <div class="flex items-center gap-1.5"
                                    :class="col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''">
                                    {{ col.label }}
                                    <ArrowUpDownIcon v-if="col.sortable && sortKey !== col.key"
                                        class="size-3.5 text-muted-foreground/50" />
                                    <template v-else-if="col.sortable && sortKey === col.key">
                                        <ArrowUpIcon v-if="sortOrder === 'asc'" class="size-3.5" />
                                        <ArrowDownIcon v-else class="size-3.5" />
                                    </template>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="(row, rowIndex) in paginatedData" :key="rowIndex"
                            @click="$emit('rowClick', row)">
                            <TableCell v-for="(col, colIndex) in visibleColumns" :key="col.key" :class="[
                                col.align === 'center' && 'text-center',
                                col.align === 'right' && 'text-right',
                                colIndex === 0 && 'pl-4',
                                colIndex === visibleColumns.length - 1 && 'pr-4',
                            ]">
                                <!-- Slot for custom cell rendering -->
                                <slot :name="`cell-${col.key}`" :row="row" :value="resolveNestedValue(row, col.key)"
                                    :column="col">
                                    {{ formatCellValue(resolveNestedValue(row, col.key), col) }}
                                </slot>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <!-- Mobile Card View -->
            <div class="block md:hidden divide-y">
                <div v-for="(row, rowIndex) in paginatedData" :key="rowIndex"
                    class="p-4 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer"
                    @click="$emit('rowClick', row)">
                    <div v-for="col in visibleMobileColumns" :key="col.key" class="flex items-start gap-2"
                        :class="col.hideOnMobile ? 'hidden' : ''">
                        <span class="text-xs text-muted-foreground shrink-0 min-w-[90px] font-medium">
                            {{ col.label }}
                        </span>
                        <span class="text-sm text-right flex-1 break-words">
                            <slot :name="`cell-${col.key}`" :row="row" :value="resolveNestedValue(row, col.key)"
                                :column="col">
                                {{ formatCellValue(resolveNestedValue(row, col.key), col) }}
                            </slot>
                        </span>
                    </div>
                    <!-- Row actions slot for mobile -->
                    <slot name="mobile-actions" :row="row">
                        <div v-if="$slots['cell-actions'] || actionsLabel"
                            class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                            <slot name="cell-actions" :row="row" :value="row" :column="{ key: 'actions' }" />
                        </div>
                    </slot>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="paginated && totalPages > 0"
            class="flex max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <!-- Items per page & info -->
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <span class="hidden sm:inline">
                    Menampilkan {{ pageInfo.start }} - {{ pageInfo.end }} dari {{ filteredData.length }}
                </span>
                <span class="sm:hidden">
                    {{ pageInfo.start }}-{{ pageInfo.end }}/{{ filteredData.length }}
                </span>
                <div v-if="pageSizeOptions.length" class="flex items-center gap-1">
                    <span class="hidden sm:inline">|</span>
                    <Select :model-value="String(pageSizeModel)"
                        @update:model-value="(val) => pageSizeModel = Number(val)">
                        <SelectTrigger class="h-8 w-[70px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="opt in pageSizeOptions" :key="opt" :value="String(opt)">
                                {{ opt }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <!-- Page Navigation -->
            <div
                class="flex min-w-0 max-w-full items-center justify-center gap-0.5 overflow-x-auto pb-1 sm:justify-end sm:gap-1"
            >
                <Button variant="outline" size="icon-sm" class="shrink-0 touch-manipulation" :disabled="currentPageModel <= 1" @click="currentPageModel = 1"
                    aria-label="Halaman pertama">
                    <ChevronsLeftIcon class="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" class="shrink-0 touch-manipulation" :disabled="currentPageModel <= 1" @click="currentPageModel--"
                    aria-label="Halaman sebelumnya">
                    <ChevronLeftIcon class="size-4" />
                </Button>

                <!-- Page Numbers -->
                <template v-for="page in visiblePageNumbers" :key="page">
                    <span v-if="page === '...'" class="shrink-0 px-1 text-sm text-muted-foreground">...</span>
                    <Button v-else :variant="page === currentPageModel ? 'default' : 'outline'" size="icon-sm"
                        class="shrink-0 touch-manipulation" @click="goToPage(page)" :class="page === currentPageModel ? 'pointer-events-none' : ''">
                        {{ page }}
                    </Button>
                </template>

                <Button variant="outline" size="icon-sm" class="shrink-0 touch-manipulation" :disabled="currentPageModel >= totalPages"
                    @click="currentPageModel++" aria-label="Halaman selanjutnya">
                    <ChevronRightIcon class="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" class="shrink-0 touch-manipulation" :disabled="currentPageModel >= totalPages"
                    @click="currentPageModel = totalPages" aria-label="Halaman terakhir">
                    <ChevronsRightIcon class="size-4" />
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    SearchIcon,
    XIcon,
    InboxIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from 'lucide-vue-next'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TableSkeleton from '~/components/dashboard/TableSkeleton.vue'

// ─── Types ───────────────────────────────────────────────────────

export interface TableColumn {
    /** Unique key for the column. Supports dot notation: "user.name" */
    key: string
    /** Display label in the header */
    label: string
    /** Whether this column is sortable */
    sortable?: boolean
    /** CSS width value e.g. "120px", "10rem" */
    width?: string
    /** Text alignment */
    align?: 'left' | 'center' | 'right'
    /** Hide entire column on mobile (< md breakpoint) */
    hideOnMobile?: boolean
    /** Custom formatter (overrides default formatting) */
    format?: (value: unknown, row: Record<string, unknown>) => string
}

export interface FilterOption {
    /** Column key to filter on */
    key: string
    /** Filter label shown in the UI */
    label: string
    /** Placeholder text for the filter select */
    placeholder?: string
    /** Available filter choices */
    options: { label: string; value: string }[]
}

export interface PageInfo {
    start: number
    end: number
}

// ─── Props ───────────────────────────────────────────────────────

interface Props {
    /** Array of data to display */
    data: Record<string, unknown>[]
    /** Column configuration */
    columns: TableColumn[]
    /** Loading state */
    loading?: boolean
    /** Number of skeleton rows while loading */
    skeletonRows?: number
    /** Message shown when there's no data (after filtering) */
    emptyMessage?: string

    // ── Search ──
    /** Enable search bar */
    searchable?: boolean
    /** Search placeholder text */
    searchPlaceholder?: string
    /** Keys to search on (defaults to first column key) */
    searchKeys?: string[]
    /** External search query (v-model) */
    searchQuery?: string

    // ── Filter ──
    /** Enable filter dropdowns */
    filterable?: boolean
    /** Filter configuration */
    filterOptions?: FilterOption[]
    /** External filter values (v-model) */
    filterValues?: Record<string, string>

    // ── Pagination ──
    /** Enable pagination */
    paginated?: boolean
    /** Items per page */
    pageSize?: number
    /** Page size options */
    pageSizeOptions?: number[]
    /** Current page (v-model) */
    currentPage?: number
    /** Label for the actions column */
    actionsLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    columns: () => [],
    loading: false,
    skeletonRows: 5,
    emptyMessage: 'Tidak ada data.',
    searchable: false,
    searchPlaceholder: 'Cari...',
    searchKeys: () => [],
    searchQuery: '',
    filterable: false,
    filterOptions: () => [],
    filterValues: () => ({}),
    paginated: true,
    pageSize: 10,
    pageSizeOptions: () => [5, 10, 25, 50],
    currentPage: 1,
    actionsLabel: '',
})

// ─── Emits ───────────────────────────────────────────────────────

const emit = defineEmits<{
    /** Emitted when a row is clicked */
    rowClick: [row: Record<string, unknown>]
    /** v-model for search query */
    'update:searchQuery': [value: string]
    /** v-model for filter values */
    'update:filterValues': [value: Record<string, string>]
    /** v-model for current page */
    'update:currentPage': [value: number]
    /** v-model for page size */
    'update:pageSize': [value: number]
}>()

// ─── Internal State ─────────────────────────────────────────────

const internalSearchQuery = ref('')
const internalFilterValues = ref<Record<string, string>>({})
const internalCurrentPage = ref(1)
const internalPageSize = ref(props.pageSize)
const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// ─── Computed: Columns (visible) ───────────────────────────────

const visibleColumns = computed(() => props.columns)

const visibleMobileColumns = computed(() =>
    // "actions" dirender terpisah di slot mobile-actions agar tidak dobel.
    props.columns.filter(col => !col.hideOnMobile && col.key !== 'actions')
)

const skeletonColumns = computed(() =>
    props.columns.map(col => ({
        id: col.key,
        width: col.width || 'auto',
    }))
)

// ─── Computed: Search ──────────────────────────────────────────

const searchQueryModel = computed({
    get: () => props.searchQuery ?? internalSearchQuery.value,
    set: (val: string) => {
        if (props.searchQuery !== undefined) {
            emit('update:searchQuery', val)
        } else {
            internalSearchQuery.value = val
        }
        // Reset to page 1 on search
        currentPageModel.value = 1
    },
})

// ─── Computed: Filters ─────────────────────────────────────────

const filterValuesModel = computed({
    get: () => {
        if (Object.keys(props.filterValues).length > 0) {
            return props.filterValues
        }
        return internalFilterValues.value
    },
    set: (val: Record<string, string>) => {
        if (Object.keys(props.filterValues).length > 0) {
            emit('update:filterValues', val)
        } else {
            internalFilterValues.value = val
        }
        currentPageModel.value = 1
    },
})

// ─── Computed: Sorting & Filtering ─────────────────────────────

const filteredData = computed(() => {
    let result = [...props.data]

    // Apply search
    const query = searchQueryModel.value.toLowerCase().trim()
    if (query) {
        const firstColKey = props.columns[0]?.key
        const keys = props.searchKeys.length
            ? props.searchKeys
            : firstColKey
                ? [firstColKey]
                : []

        if (keys.length) {
            result = result.filter(row =>
                keys.some(key => {
                    const value = resolveNestedValue(row, key)
                    return String(value ?? '').toLowerCase().includes(query)
                })
            )
        }
    }

    // Apply filters
    const activeFilters = filterValuesModel.value
    Object.entries(activeFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
            result = result.filter(row => {
                const cellValue = String(resolveNestedValue(row, key) ?? '')
                return cellValue === value
            })
        }
    })

    // Apply sorting
    if (sortKey.value) {
        result.sort((a, b) => {
            const aVal = resolveNestedValue(a, sortKey.value)
            const bVal = resolveNestedValue(b, sortKey.value)

            // Handle dates
            if (aVal instanceof Date && bVal instanceof Date) {
                return sortOrder.value === 'asc'
                    ? aVal.getTime() - bVal.getTime()
                    : bVal.getTime() - aVal.getTime()
            }

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
            }

            // Handle strings
            const aStr = String(aVal ?? '').toLowerCase()
            const bStr = String(bVal ?? '').toLowerCase()
            return sortOrder.value === 'asc'
                ? aStr.localeCompare(bStr, 'id')
                : bStr.localeCompare(aStr, 'id')
        })
    }

    return result
})

// ─── Computed: Pagination ──────────────────────────────────────

const pageSizeModel = computed({
    get: () => internalPageSize.value,
    set: (val: number) => {
        internalPageSize.value = val
        emit('update:pageSize', val)
        currentPageModel.value = 1
    },
})

const currentPageModel = computed({
    get: () => {
        if (props.currentPage !== undefined) {
            return props.currentPage
        }
        return internalCurrentPage.value
    },
    set: (val: number) => {
        if (props.currentPage !== undefined) {
            emit('update:currentPage', val)
        } else {
            internalCurrentPage.value = val
        }
    },
})

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredData.value.length / pageSizeModel.value))
)

const paginatedData = computed(() => {
    if (!props.paginated) return filteredData.value

    const start = (currentPageModel.value - 1) * pageSizeModel.value
    const end = start + pageSizeModel.value
    return filteredData.value.slice(start, end)
})

const pageInfo = computed<PageInfo>(() => {
    if (filteredData.value.length === 0) return { start: 0, end: 0 }
    const start = (currentPageModel.value - 1) * pageSizeModel.value + 1
    const end = Math.min(currentPageModel.value * pageSizeModel.value, filteredData.value.length)
    return { start, end }
})

// ─── Computed: Pagination Number Logic ─────────────────────────

const visiblePageNumbers = computed<(number | string)[]>(() => {
    const total = totalPages.value
    const current = currentPageModel.value
    const pages: (number | string)[] = []

    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
        return pages
    }

    // Always show first page
    pages.push(1)

    if (current > 3) pages.push('...')

    // Pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    if (current < total - 2) pages.push('...')

    // Always show last page
    if (total > 1) pages.push(total)

    return pages
})

// ─── Methods ────────────────────────────────────────────────────

function getFilterValue(key: string): string {
    return filterValuesModel.value[key] || 'all'
}

function setFilterValue(key: string, value: string) {
    const current = { ...filterValuesModel.value }
    current[key] = value
    // Trigger update through the computed setter
    if (Object.keys(props.filterValues).length > 0) {
        emit('update:filterValues', current)
    } else {
        internalFilterValues.value = current
    }
    currentPageModel.value = 1
}

function resolveNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[part]
        }
        return undefined
    }, obj)
}

function formatCellValue(value: unknown, column: TableColumn): string {
    // Use custom formatter if provided
    if (column.format) {
        return column.format(value, {} as Record<string, unknown>)
    }

    if (value === null || value === undefined) return '-'

    // Format Date
    if (value instanceof Date) {
        return value.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // Format numbers
    if (typeof value === 'number') {
        return value.toLocaleString('id-ID')
    }

    return String(value)
}

function goToPage(page: number | string) {
    if (typeof page === 'number') {
        currentPageModel.value = page
    }
}

function toggleSort(key: string) {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = key
        sortOrder.value = 'asc'
    }
}

// Reset to page 1 when external data changes
watch(
    () => props.data.length,
    () => {
        currentPageModel.value = 1
    }
)
</script>
