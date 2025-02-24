<template>
  <div class="overview-container">
    <div class="title">Overview</div>
    <div id="graph-overview-component"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted } from 'vue'
import { GraphComponent, GraphOverviewComponent } from '@yfiles/yfiles'

export default defineComponent({
  name: 'DiagramOverviewComponent',
  setup() {
    const graphComponentProvider = inject('GraphComponentProvider') as {
      getGraphComponent: () => GraphComponent
    }

    onMounted(() => {
      new GraphOverviewComponent(
        '#graph-overview-component',
        graphComponentProvider.getGraphComponent()
      )
    })
  }
})
</script>

<style scoped>
.overview-container {
  border-radius: 4px;
  box-shadow:
    0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
}

#graph-overview-component {
  width: 200px;
  height: 200px;
  background-color: white;
}

.title {
  padding: 5px;
  display: flex;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  letter-spacing: 0.0125em;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  background-color: #29323c;
}
</style>
