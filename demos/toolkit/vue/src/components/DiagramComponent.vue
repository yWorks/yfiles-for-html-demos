<template>
  <demo-toolbar
    class="toolbar"
    @reload-graph="defaultGraph.create()"
    @toggle-editable="toggleEditable"
    @layout="layout()"
    @export-svg="exportSvg"
    @search-query-change="graphSearch.onSearchQueryChange"
  ></demo-toolbar>
  <div class="graph-component-container" ref="GraphComponentElement">
    <context-menu @hide-context-menu="contextMenu.hide()" v-bind="contextMenu.data" />
  </div>
</template>

<script lang="ts">
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphViewerInputMode,
  License,
  SvgExport
} from '@yfiles/yfiles'
import DemoToolbar from './DemoToolbar.vue'
import ContextMenu from './ContextMenu.vue'
import { defineComponent, inject, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useTooltips } from '@/composables/useTooltips'
import { useGraphSearch } from '@/composables/useGraphSearch'
import { useLayout } from '@/composables/useLayout'
import { useDefaultGraph } from '@/composables/useDefaultGraph'
import licenseData from '../../../../../lib/license.json'
import { downloadFile } from '@yfiles/demo-utils/file-support'

License.value = licenseData

export default defineComponent({
  name: 'DiagramComponent',
  components: {
    DemoToolbar,
    ContextMenu
  },
  setup() {
    const graphComponentProvider = inject('GraphComponentProvider') as {
      getGraphComponent: () => GraphComponent
    }

    // now we can populate the GraphComponentProvider with a function that returns a
    // GraphComponent instance which will be created later in the onMount hook
    let graphComponent: GraphComponent
    const getGraphComponent = () => graphComponent
    onBeforeMount(() => {
      graphComponentProvider.getGraphComponent = getGraphComponent
    })

    // create the GraphComponent instance in the graph-component-container div
    const GraphComponentElement = ref<HTMLDivElement>()
    onMounted(() => {
      graphComponent = new GraphComponent(GraphComponentElement.value!)
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
    function toggleEditable(editable: boolean): void {
      const inputMode = editable ? new GraphEditorInputMode() : new GraphViewerInputMode()
      graphComponent.inputMode = inputMode
      contextMenu.register(inputMode)
      tooltips.register(inputMode)
    }

    /**
     * Export the graph component to an SVG.
     */
    async function exportSvg() {
      const exportComponent = new GraphComponent()
      exportComponent.graph = graphComponent.graph
      exportComponent.updateContentBounds()
      const exporter = new SvgExport({
        worldBounds: exportComponent.contentBounds,
        encodeImagesBase64: true,
        inlineSvgImages: true
      })

      // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
      exporter.cssStyleSheet = null
      const svg = await exporter.exportSvgAsync(exportComponent, async () => {
        // Wait for Vue to finish rendering. If you have node styles that render asynchronously, you need
        // to wait for them to finish, also.
        await nextTick()
      })
      downloadFile(SvgExport.exportSvgString(svg), 'graph.svg', 'image/svg+xml')
    }

    return {
      GraphComponentElement,
      contextMenu,
      graphSearch,
      layout,
      defaultGraph,
      exportSvg,
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
