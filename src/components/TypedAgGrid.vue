<!-- components/TypedAgGrid.vue -->
<template>
  <AgGridVue ref="gridRef" v-bind="mergedProps" v-on="listeners">
    <template v-for="(slotFn, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </AgGridVue>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { ref, computed, useAttrs, useSlots } from 'vue'
import type { GridOptions } from 'ag-grid-community'

// 1. Получаем пропсы от пользователя
const props = defineProps<GridOptions>()

// 2. Дополнительные непредусмотренные атрибуты
const attrs = useAttrs()

// 3. Сливаем всё вместе (prop имеет приоритет над attrs)
const mergedProps = computed(() => ({
  ...attrs,
  ...props,
}))

// 4. Отлавливаем слушателей событий
const listeners = attrs

// 5. Для работы со слотами
const slots = useSlots()

// 6. Ссылка на внутренний AgGrid
const gridRef = ref<InstanceType<typeof AgGridVue> | null>(null)
</script>
