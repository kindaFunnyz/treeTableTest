<script setup lang="ts">
import { type Item, Tree, TreeNode } from '@/Tree.ts'
import { ref } from 'vue'
import TreeNodeComp from '@/components/TreeNodeComp.vue'
const tree = ref<Tree | null>(null)
function generateTestItems(): Item[] {
  const items: Item[] = []

  // Добавляем элементы с числовым id=2
  items.push(
    { id: 2, parent: 1, otherFields: { type: 'number', value: 'first 2' } },
    { id: 2, parent: 3, otherFields: { type: 'number', value: 'duplicate 2' } }, // Дубликат
  )

  // Добавляем элементы со строковым id='2'
  items.push(
    {
      id: '2',
      parent: '1',
      otherFields: { type: 'string', value: 'string 2' },
    },
    {
      id: '2',
      parent: null,
      otherFields: { type: 'string', value: 'root string 2' },
    }, // Дубликат
  )

  // Добавляем элементы с разными родителями (некоторые будут заглушками)
  items.push(
    { id: 1, parent: null, otherFields: { type: 'root', value: 'root 1' } },
    {
      id: 3,
      parent: 999,
      otherFields: { type: 'child', value: 'child with phantom parent' },
    }, // Родителя 999 нет в данных
    {
      id: 4,
      parent: 2,
      otherFields: { type: 'mixed', value: 'child of number 2' },
    },
    {
      id: 5,
      parent: '2',
      otherFields: { type: 'mixed', value: 'child of string 2' },
    },
  )

  // Добавляем явные дубликаты с разными parent
  items.push(
    { id: 6, parent: null, otherFields: { value: 'original 6' } },
    { id: 6, parent: 2, otherFields: { value: 'duplicate 6' } }, // Переопределит original
  )

  // Добавляем циклическую ссылку (parent ссылается на себя)
  items.push({ id: 7, parent: 7, otherFields: { value: 'self reference' } })

  // Добавляем элемент с id=2, но другим типом (строка вместо числа)
  items.push({
    id: '2',
    parent: 1,
    otherFields: { type: 'another string', value: 'another string 2' },
  })

  return items
}
function func() {
  const testItems: Item[] = generateTestItems()
  tree.value = new Tree(testItems)
  tree.value.printTree()
}
const getNodeKey = (node: TreeNode) => {
  return `${typeof node.id}-${node.id}` // Уникальный ключ с учетом типа
}
</script>

<template>
  <main>
    <el-button @click="() => func()" />
    <div class="tree-container">
      <h2>Tree Structure</h2>
      <div v-if="tree" class="tree">
        <TreeNodeComp v-for="node in tree.roots" :key="getNodeKey(node)" :node="node" :level="0" />
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
