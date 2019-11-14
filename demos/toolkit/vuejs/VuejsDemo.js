/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
'use strict'

/* eslint-disable no-new */
/* global Vue */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-component',
  'VuejsNodeStyle.js',
  'resources/OrgChartData.js',
  'resources/demo-app',
  'yfiles/view-layout-bridge',
  'yfiles/layout-tree',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  VuejsNodeStyle,
  orgChartData,
  app
) => {
  /**
   * Mapping of statuses to colors, used in the node style.
   */
  const statusColors = {
    present: '#55B757',
    busy: '#E7527C',
    travel: '#9945E9',
    unavailable: '#8D8F91'
  }

  /**
   * A data object that will be shared by multiple Vue instances to keep them in sync with each other.
   * @type {{focusedNodeData: object}}
   */
  const sharedData = {
    focusedNodeData: null
  }

  /**
   * This Vue component is used to display the graph nodes. Its template is based on the Orgchart Demo node template,
   * but instead of using Template Bindings, Vuejs is used to keep the view in sync with the data.
   */
  Vue.component('node', {
    template: '#vueNodeStyleTemplate',
    data: () => ({
      zoom: 1,
      focused: false
    }),
    // the node tag is passed as a prop
    props: ['tag'],
    computed: {
      statusColor() {
        return statusColors[this.tag.status]
      },
      positionFirstLine() {
        const words = this.tag.position ? this.tag.position.split(' ') : []
        while (words.join(' ').length > 20) {
          words.pop()
        }
        return words.join(' ')
      },
      positionSecondLine() {
        const words = this.tag.position ? this.tag.position.split(' ') : []
        const secondLine = []
        while (words.join(' ').length > 20) {
          secondLine.unshift(words.pop())
        }
        return secondLine.join(' ')
      }
    }
  })

  /**
   * This Vue component wraps a {@link yfiles.view.GraphComponent}. It takes an {@link yfiles.graph.IGraph} as a prop
   * and emits a custom event <code>focused-item-changed</code> when the focused item of the GraphComponent changes.
   */
  Vue.component('graph-component', {
    template: '<div class="graph-component"></div>',
    created() {
      // the GraphComponent is created but not appended to the DOM yet
      const graphComponent = new yfiles.view.GraphComponent()
      this.$graphComponent = graphComponent

      // create a graph from the Orgchart data.
      createGraph(orgChartData, graphComponent.graph)

      graphComponent.focusIndicatorManager.showFocusPolicy = yfiles.view.ShowFocusPolicy.ALWAYS
      // disable default highlight indicators
      graphComponent.selectionIndicatorManager.enabled = false
      graphComponent.focusIndicatorManager.enabled = false
      graphComponent.highlightIndicatorManager.enabled = false

      graphComponent.inputMode = createViewerInputMode()

      // apply tree layout to the graph
      doLayout(graphComponent.graph)

      // emit custom event 'focused-item-changed' whenever the focused item of the GraphControl changes
      graphComponent.focusIndicatorManager.addPropertyChangedListener(() => {
        this.$emit('focused-item-changed', graphComponent.focusIndicatorManager.focusedItem.tag)
      })
    },
    mounted() {
      // append the GraphComponent to the DOM when the Vue component is mounted
      this.$el.appendChild(this.$graphComponent.div)
      this.$graphComponent.div.style.height = '100%'
      this.$graphComponent.fitGraphBounds()
    }
  })

  /**
   * Main Vue instance which starts the demo and serves as a mediator between other Vue instances.
   */
  new Vue({
    el: '#yfiles-vue-app',
    data: {
      sharedData
    },
    methods: {
      zoomIn() {
        yfiles.input.ICommand.INCREASE_ZOOM.execute(null, this.$refs.graphComponent.$graphComponent)
      },
      resetZoom() {
        yfiles.input.ICommand.ZOOM.execute(1, this.$refs.graphComponent.$graphComponent)
      },
      zoomOut() {
        yfiles.input.ICommand.DECREASE_ZOOM.execute(null, this.$refs.graphComponent.$graphComponent)
      },
      fitGraph() {
        yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(
          null,
          this.$refs.graphComponent.$graphComponent
        )
      },
      /**
       * This is called when the custom <code>focused-item-changed</code> event is emitted on the graph-control.
       * @param {Object} tag - The tag of the currently focused node.
       */
      focusedItemChanged(tag) {
        // update shared state
        this.sharedData.focusedNodeData = tag
      }
    },
    mounted() {
      // run the demo
      app.show()
    }
  })

  /**
   * Vue instance for the properties view in the right sidebar. Used to edit the data of the currently selected graph
   * item.
   */
  new Vue({
    el: '#node-view',
    template: '#nodeViewTemplate',
    data: {
      sharedData
    }
  })

  /**
   * Creates a {@link yfiles.input.GraphViewerInputMode} and restricts some functionality.
   * @return {yfiles.input.GraphViewerInputMode}
   */
  function createViewerInputMode() {
    const inputMode = new yfiles.input.GraphViewerInputMode({
      clickableItems: yfiles.graph.GraphItemTypes.NODE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      marqueeSelectableItems: yfiles.graph.GraphItemTypes.NONE,
      toolTipItems: yfiles.graph.GraphItemTypes.NONE,
      contextMenuItems: yfiles.graph.GraphItemTypes.NONE,
      focusableItems: yfiles.graph.GraphItemTypes.NODE
    })
    return inputMode
  }

  /**
   * Create the Orgchart graph using a TreeSource.
   * @param {Object} nodesSource The source data in JSON format
   * @param {yfiles.graph.IGraph} graph
   * @return {yfiles.graph.IGraph}
   */
  function createGraph(nodesSource, graph) {
    const treeBuilder = new yfiles.binding.TreeBuilder(graph)
    treeBuilder.childBinding = 'subordinates'
    treeBuilder.nodesSource = nodesSource

    // use the VuejsNodeStyle, which uses a Vue component to display nodes
    treeBuilder.graph.nodeDefaults.style = new VuejsNodeStyle(Vue.component('node'))
    treeBuilder.graph.nodeDefaults.size = new yfiles.geometry.Size(285, 100)
    treeBuilder.graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px rgb(170, 170, 170)',
      targetArrow: yfiles.styles.IArrow.NONE
    })
    return treeBuilder.buildGraph()
  }

  /**
   * Applies a tree layout like in the Orgchart demo.
   * @param {yfiles.graph.IGraph} tree
   */
  function doLayout(tree) {
    const registry = tree.mapperRegistry
    const nodePlacerMapper = registry.createMapper(yfiles.tree.TreeLayout.NODE_PLACER_DP_KEY)
    const assistantMapper = registry.createMapper(
      yfiles.tree.AssistantNodePlacer.ASSISTANT_NODE_DP_KEY
    )
    tree.nodes.forEach(node => {
      if (tree.inDegree(node) === 0) {
        setNodePlacers(node, nodePlacerMapper, assistantMapper, tree)
      }
    })
    tree.applyLayout(new yfiles.tree.TreeLayout())
    tree.mapperRegistry.removeMapper(yfiles.tree.AssistantNodePlacer.ASSISTANT_NODE_DP_KEY)
    tree.mapperRegistry.removeMapper(yfiles.tree.TreeLayout.NODE_PLACER_DP_KEY)
  }

  /**
   * @param {yfiles.graph.INode} rootNode
   * @param {yfiles.collections.IMapper.<yfiles.tree.INodePlacer>} nodePlacerMapper
   * @param {yfiles.collections.IMapper.<yfiles.graph.INode>} assistantMapper
   * @param {yfiles.graph.IGraph} tree
   */
  function setNodePlacers(rootNode, nodePlacerMapper, assistantMapper, tree) {
    const employee = rootNode.tag
    if (employee !== null) {
      const layout = employee.layout
      switch (layout) {
        case 'rightHanging': {
          const newDefaultNodePlacer = new yfiles.tree.DefaultNodePlacer(
            yfiles.tree.ChildPlacement.VERTICAL_TO_RIGHT,
            yfiles.tree.RootAlignment.LEADING_ON_BUS,
            30,
            30
          )
          newDefaultNodePlacer.routingStyle = yfiles.tree.RoutingStyle.FORK_AT_ROOT
          nodePlacerMapper.set(rootNode, newDefaultNodePlacer)
          break
        }
        case 'leftHanging': {
          const newDefaultNodePlacer1 = new yfiles.tree.DefaultNodePlacer(
            yfiles.tree.ChildPlacement.VERTICAL_TO_LEFT,
            yfiles.tree.RootAlignment.LEADING_ON_BUS,
            30,
            30
          )
          newDefaultNodePlacer1.routingStyle = yfiles.tree.RoutingStyle.FORK_AT_ROOT
          nodePlacerMapper.set(rootNode, newDefaultNodePlacer1)
          break
        }
        case 'bothHanging': {
          const newLeftRightPlacer = new yfiles.tree.LeftRightNodePlacer()
          newLeftRightPlacer.placeLastOnBottom = false
          nodePlacerMapper.set(rootNode, newLeftRightPlacer)
          break
        }
        default: {
          nodePlacerMapper.set(
            rootNode,
            new yfiles.tree.DefaultNodePlacer(
              yfiles.tree.ChildPlacement.HORIZONTAL_DOWNWARD,
              yfiles.tree.RootAlignment.MEDIAN,
              30,
              30
            )
          )
          break
        }
      }

      const assistant = employee.assistant
      if (assistant && tree.inDegree(rootNode) > 0) {
        const inEdge = tree.inEdgesAt(rootNode).get(0)
        const parent = inEdge.sourceNode
        const oldParentPlacer = nodePlacerMapper.get(parent)
        const assistantNodePlacer = new yfiles.tree.AssistantNodePlacer()
        assistantNodePlacer.childNodePlacer = oldParentPlacer
        nodePlacerMapper.set(parent, assistantNodePlacer)
        assistantMapper.set(rootNode, true)
      }
    }

    tree.outEdgesAt(rootNode).forEach(outEdge => {
      const child = outEdge.targetPort.owner
      setNodePlacers(child, nodePlacerMapper, assistantMapper, tree)
    })
  }
})
