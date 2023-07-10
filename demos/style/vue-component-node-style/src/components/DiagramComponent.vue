<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GraphComponent, GraphEditorInputMode, Size } from 'yfiles'
import { VueComponentNodeStyle } from '@/VueComponentNodeStyle'
import NodeComponent from '@/components/NodeComponent.vue'
import { vuetify } from '@/vuetify'
import graphData from '@/assets/graph-data.json'

const gcDiv = ref<HTMLDivElement>(null!)

onMounted(() => {
  const graphComponent = new GraphComponent(gcDiv.value)
  graphComponent.inputMode = new GraphEditorInputMode()
  graphComponent.graph.nodeDefaults.style = new VueComponentNodeStyle(
    // the Vue component used to render a node
    NodeComponent,
    // the props the Vue component should receive
    (context, node) => ({
      zoom: context.zoom,
      ...(node.tag || { name: 'New Node', color: 'blue-grey', content: 'No content' })
    }),
    // any Vue plugins that should be used
    [vuetify]
  )
  const width = 300
  const height = 250
  graphComponent.graph.nodeDefaults.size = new Size(width, height)

  for (const { x, y, tag } of graphData) {
    graphComponent.graph.createNode({
      layout: [x, y, width, height],
      tag
    })
  }

  graphComponent.fitGraphBounds()
})
</script>

<template>
  <div ref="gcDiv" class="graph-component"></div>
</template>

<style scoped>
.graph-component {
  height: 100%;
}
</style>
