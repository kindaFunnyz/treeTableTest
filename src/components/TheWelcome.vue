<script setup lang="ts">
import { type Item, Tree, TreeNode } from '@/Tree.ts'
import { onMounted, ref } from 'vue'
import TreeNodeComp from '@/components/TreeNodeComp.vue'
import type { ColDef } from 'ag-grid-community'
import TypedAgGrid from '@/components/TypedAgGrid.vue'
const tree = ref<Tree | null>(null)
function generateTestItems(): Item[] {
  const items: Item[] = []

  items.push({ id: 2, parent: 1, label: 'first' }, { id: 2, parent: 3, label: 'second' })

  items.push(
    {
      id: '2',
      parent: '1',
      label: 'first',
    },
    {
      id: '2',
      parent: null,
      label: 'nulled',
    },
  )

  items.push(
    { id: 1, parent: null, label: 'first' },
    {
      id: 3,
      parent: 999,
      label: 'third',
    }, // Родителя 999 нет в данных
    {
      id: 4,
      parent: 2,
      label: 'fourth',
    },
    {
      id: 5,
      parent: '2',
      label: 'fifth',
    },
  )

  items.push({ id: 6, parent: null, label: 'sixNP' }, { id: 6, parent: 2, label: 'six' })

  items.push({ id: 7, parent: 7, label: 'seven' })

  items.push({
    id: '2',
    parent: 1,
    label: 'second1par',
  })

  return items
}
function func() {
  const testItems: Item[] = generateTestItems()
  tree.value = new Tree(testItems)
  tree.value.printTree()
}
onMounted(func)
const getNodeKey = (node: TreeNode) => {
  return `${typeof node.id}-${node.id}` // Уникальный ключ с учетом типа
}
const colDefs = ref([
  {
    headerName: 'Категория',
    field: 'category',
    valueGetter: (p) => (p.data.children && p.data.children.length ? 'Группа' : 'Элемент'),
  },
  { headerName: 'Категория', field: 'label' },
])
const autoGroupColumnDef = ref<ColDef>({
  headerName: 'Номер',
  field: 'id',
  cellRendererParams: {
    suppressCount: true,
  },
})
</script>

<template>
  <main>
    <el-button @click="() => func()" />
    <div class="tree-container">
      <h2>Tree Structure</h2>
      <div v-if="tree" class="tree">
        <TreeNodeComp v-for="node in tree.roots" :key="getNodeKey(node)" :node="node" :level="0" />
      </div>
      <div style="width: 100%; height: 700px">
        <TypedAgGrid
          style="width: 100%; height: 100%"
          :rowData="tree?.roots"
          treeDataChildrenField="children"
          :treeData="true"
          :columnDefs="colDefs"
          :autoGroupColumnDef="autoGroupColumnDef"
        ></TypedAgGrid>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tree-container {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.tree {
  text-align: left;
}

.node {
  margin-left: calc(var(--level) * 15px);
  padding: 5px;
  border-left: 1px solid #eee;
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 3px 0;
}

.node-content:hover {
  background-color: #f5f5f5;
}

.expand-icon {
  margin-right: 5px;
  width: 12px;
  text-align: center;
  cursor: pointer;
}

.node-id {
  font-weight: bold;
  margin-right: 5px;
}

.node-type {
  color: #666;
  font-size: 0.8em;
  margin-right: 5px;
}

.node-parent {
  color: #888;
  font-size: 0.9em;
}

.node-fields {
  margin-top: 3px;
  padding-left: 20px;
  font-size: 0.9em;
  color: #555;
}

.children {
  margin-left: 15px;
  transition: all 0.3s ease;
}
</style>
