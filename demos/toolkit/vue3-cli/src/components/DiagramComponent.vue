<template>
  <demo-toolbar
    class="toolbar"
    @reload-graph="defaultGraph.create()"
    @toggle-editable="toggleEditable"
    @layout="layout()"
    @search-query-change="graphSearch.onSearchQueryChange"
  ></demo-toolbar>
  <div class="graph-component-container" ref="GraphComponentElement">
    <context-menu @hide-context-menu="contextMenu.hide()" v-bind="contextMenu.data" />
  </div>
</template>

<script>
import licenseData from '../../../../../lib/license.json'
import { GraphComponent, GraphEditorInputMode, GraphViewerInputMode, License } from 'yfiles'
import DemoToolbar from './DemoToolbar.vue'
import ContextMenu from './ContextMenu.vue'
import { defineComponent, inject, onBeforeMount, onMounted, ref } from 'vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useTooltips } from '@/composables/useTooltips'
import { useGraphSearch } from '@/composables/useGraphSearch'
import { useLayout } from '@/composables/useLayout'
import { useDefaultGraph } from '@/composables/useDefaultGraph'

License.value = licenseData

export default defineComponent({
  name: 'DiagramComponent',
  components: {
    DemoToolbar,
    ContextMenu
  },
  setup() {
    const graphComponentProvider = inject('GraphComponentProvider')

    // now we can populate the GraphComponentProvider with a function that returns a
    // GraphComponent instance which will be created later in the onMount hook
    let graphComponent
    const getGraphComponent = () => graphComponent
    onBeforeMount(() => {
      graphComponentProvider.getGraphComponent = getGraphComponent
    })

    // create the GraphComponent instance in the graph-component-container div
    const GraphComponentElement = ref()
    onMounted(() => {
      graphComponent = new GraphComponent(GraphComponentElement.value)
      graphComponent.inputMode = new GraphViewerInputMode()
    })

    // initialize the features
    const contextMenu = useContextMenu(getGraphComponent)
    const tooltips = useTooltips(getGraphComponent)
    const graphSearch = useGraphSearch(getGraphComponent)
    const layout = useLayout(getGraphComponent)
    const defaultGraph = useDefaultGraph(getGraphComponent)

    /**
     * Enables/disables interactive editing of the graph.
     */
    function toggleEditable(editable) {
      const inputMode = editable ? new GraphEditorInputMode() : new GraphViewerInputMode()
      graphComponent.inputMode = inputMode
      contextMenu.register(inputMode)
      tooltips.register(inputMode)
    }

    function initializeGraph() {
      defaultGraph.create()
    }

    return {
      GraphComponentElement,
      contextMenu,
      graphSearch,
      layout,
      defaultGraph,
      toggleEditable
    }
  }
})
</script>

<style scoped>
.toolbar {
  position: absolute;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  top: 60px;
  left: 0;
  right: 0;
  height: 40px;
  line-height: 40px;
  padding: 0 5px;
  box-sizing: border-box;
  user-select: none;
  background-color: #f7f7f7;
  z-index: 10;
}

.graph-component-container {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
}

@media screen and (max-height: 500px) {
  .graph-component-container {
    top: 60px;
  }
}
</style>
