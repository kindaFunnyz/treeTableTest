<template>
  <div class="node" :style="`--level: ${level}`">
    <div class="node-content" @click="toggleExpand">
      <span class="expand-icon" v-if="hasChildren" @click.stop="toggleExpand">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="expand-icon">•</span>

      <span class="node-id">{{ node.id }}</span>
      <span class="node-type">({{ typeof node.id }})</span>

      <span class="node-parent" v-if="node.parent"> → parent: {{ node.parent.id }} </span>
    </div>

    <div class="node-fields">
      {{ node.label }}
    </div>

    <div class="children" v-if="hasChildren && isExpanded">
      <TreeNodeComp
        v-for="child in node.children"
        :key="getNodeKey(child)"
        :node="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue'
import type { TreeNode } from '@/Tree.ts'

export default defineComponent({
  name: 'TreeNodeComp',
  props: {
    node: {
      type: Object as PropType<TreeNode>,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const isExpanded = ref(props.level < 2) // По умолчанию раскрываем первые 2 уровня

    const hasChildren = computed(() => {
      return props.node.children && props.node.children.length > 0
    })

    const toggleExpand = () => {
      if (hasChildren.value) {
        isExpanded.value = !isExpanded.value
      }
    }

    const getNodeKey = (node: TreeNode) => {
      return `${typeof node.id}-${node.id}`
    }

    return {
      isExpanded,
      hasChildren,
      toggleExpand,
      getNodeKey,
    }
  },
})
</script>
