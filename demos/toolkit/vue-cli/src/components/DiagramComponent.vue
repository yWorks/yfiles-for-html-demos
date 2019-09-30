<template>
  <div>
    <demo-toolbar class="toolbar" @reload-graph="createDefaultGraph()" @toggle-editable="toggleEditable"></demo-toolbar>
    <div class="graph-component-container" ref="GraphComponentElement"></div>
  </div>
</template>

<script>
  import licenseData from '../../../../../lib/license.json'
  import { GraphComponent, GraphEditorInputMode, GraphViewerInputMode, License, ShapeNodeStyle } from 'yfiles'
  import DemoToolbar from './DemoToolbar'

  License.value = licenseData

  export default {
    name: 'DiagramComponent',
    components: {
      DemoToolbar
    },
    mounted() {
      this.$graphComponent = new GraphComponent(this.$refs.GraphComponentElement)
      this.$graphComponent.inputMode = new GraphViewerInputMode()
      this.initializeDefaultStyles()
      this.createDefaultGraph()
    },
    methods: {
      /**
       * Sets default styles for the graph.
       */
      initializeDefaultStyles() {
        this.$graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
          fill: 'orange',
          stroke: 'orange',
          shape: 'rectangle'
        })
      },

      /**
       * Creates the default graph.
       */
      createDefaultGraph() {
        const graph = this.$graphComponent.graph
        graph.clear()

        const n1 = graph.createNodeAt([150, 150])
        const n2 = graph.createNodeAt([250, 150])
        const n3 = graph.createNodeAt([150, 250])
        graph.createEdge(n1, n2)
        graph.createEdge(n1, n3)
        graph.createEdge(n2, n3)
        this.$graphComponent.fitGraphBounds()
      },

      /**
       * Enables/disables interactive editing of the graph
       */
      toggleEditable(editable) {
        if (editable) {
          this.$graphComponent.inputMode = new GraphEditorInputMode()
        } else {
          this.$graphComponent.inputMode = new GraphViewerInputMode()
        }
      }
    }
  }
</script>

<style scoped>
  @import '~yfiles/yfiles.css';
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
</style>
