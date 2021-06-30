/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  AssistantNodePlacer,
  ChildPlacement,
  Class,
  DefaultNodePlacer,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IGraph,
  INode,
  ITreeLayoutNodePlacer,
  LayoutExecutor,
  LeftRightNodePlacer,
  License,
  PolylineEdgeStyle,
  RootAlignment,
  ShowFocusPolicy,
  Size,
  TreeBuilder,
  TreeLayout,
  TreeLayoutEdgeRoutingStyle
} from 'yfiles'

import VuejsNodeStyle from './VuejsNodeStyle.js'
import { showApp } from '../../resources/demo-app.js'
import orgChartData from './resources/OrgChartData.js'
import loadJson from '../../resources/load-json.js'

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

loadJson().then(run)

function run(licenseData) {
  License.value = licenseData

  /**
   * This Vue component is used to display the graph nodes. Its template is based on the Orgchart
   * Demo node template, but instead of using Template Bindings, Vuejs is used to keep the view in
   * sync with the data.
   */
  // eslint-disable-next-line no-undef
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
   * This Vue component wraps a {@link GraphComponent}. It takes an {@link IGraph} as a prop
   * and emits a custom event <code>focused-item-changed</code> when the focused item of the
   * GraphComponent changes.
   */
  // eslint-disable-next-line no-undef
  Vue.component('graph-component', {
    template: '<div class="graph-component"></div>',
    created() {
      // the GraphComponent is created but not appended to the DOM yet
      const graphComponent = new GraphComponent()
      this.$graphComponent = graphComponent

      // create a graph from the Orgchart data.
      createGraph(orgChartData, graphComponent.graph)

      graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS
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
  // eslint-disable-next-line no-undef,no-new
  new Vue({
    el: '#yfiles-vue-app',
    data: {
      sharedData
    },
    methods: {
      zoomIn() {
        ICommand.INCREASE_ZOOM.execute(null, this.$refs.graphComponent.$graphComponent)
      },
      resetZoom() {
        ICommand.ZOOM.execute(1, this.$refs.graphComponent.$graphComponent)
      },
      zoomOut() {
        ICommand.DECREASE_ZOOM.execute(null, this.$refs.graphComponent.$graphComponent)
      },
      fitGraph() {
        ICommand.FIT_GRAPH_BOUNDS.execute(null, this.$refs.graphComponent.$graphComponent)
      },
      /**
       * This is called when the custom <code>focused-item-changed</code> event is emitted on the
       * graph-control.
       * @param {Object} tag - The tag of the currently focused node.
       */
      focusedItemChanged(tag) {
        // update shared state
        this.sharedData.focusedNodeData = tag
      }
    },
    mounted() {
      // run the demo
      showApp()
    }
  })

  /**
   * Vue instance for the properties view in the right sidebar. Used to edit the data of the
   * currently selected graph item.
   */
  // eslint-disable-next-line no-undef,no-new
  new Vue({
    el: '#node-view',
    template: '#nodeViewTemplate',
    data: {
      sharedData
    }
  })

  /**
   * Creates a {@link GraphViewerInputMode} and restricts some functionality.
   * @return {GraphViewerInputMode}
   */
  function createViewerInputMode() {
    return new GraphViewerInputMode({
      clickableItems: GraphItemTypes.NODE,
      selectableItems: GraphItemTypes.NONE,
      marqueeSelectableItems: GraphItemTypes.NONE,
      toolTipItems: GraphItemTypes.NONE,
      contextMenuItems: GraphItemTypes.NONE,
      focusableItems: GraphItemTypes.NODE
    })
  }

  /**
   * Create the Orgchart graph using a TreeSource.
   * @param {Object} nodesSource The source data in JSON format
   * @param {IGraph} graph
   * @return {IGraph}
   */
  function createGraph(nodesSource, graph) {
    const treeBuilder = new TreeBuilder(graph)
    const rootNodesSource = treeBuilder.createRootNodesSource(nodesSource)
    const childNodesSource = rootNodesSource.createChildNodesSource(data => data.subordinates)
    childNodesSource.addChildNodesSource(data => data.subordinates, childNodesSource)

    // use the VuejsNodeStyle, which uses a Vue component to display nodes
    // eslint-disable-next-line no-undef
    treeBuilder.graph.nodeDefaults.style = new VuejsNodeStyle(Vue.component('node'))
    treeBuilder.graph.nodeDefaults.size = new Size(285, 100)
    treeBuilder.graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '2px rgb(170, 170, 170)',
      targetArrow: IArrow.NONE
    })
    return treeBuilder.buildGraph()
  }

  // We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
  // tools it from removing this dependency which is needed for 'applyLayout'.
  Class.ensure(LayoutExecutor)

  /**
   * Applies a tree layout like in the Orgchart demo.
   * @param {IGraph} tree
   */
  function doLayout(tree) {
    const registry = tree.mapperRegistry
    const nodePlacerMapper = registry.createMapper(TreeLayout.NODE_PLACER_DP_KEY)
    const assistantMapper = registry.createMapper(AssistantNodePlacer.ASSISTANT_NODE_DP_KEY)
    tree.nodes.forEach(node => {
      if (tree.inDegree(node) === 0) {
        setNodePlacers(node, nodePlacerMapper, assistantMapper, tree)
      }
    })
    tree.applyLayout(new TreeLayout())
    tree.mapperRegistry.removeMapper(AssistantNodePlacer.ASSISTANT_NODE_DP_KEY)
    tree.mapperRegistry.removeMapper(TreeLayout.NODE_PLACER_DP_KEY)
  }

  /**
   * @param {INode} rootNode
   * @param {IMapper.<ITreeLayoutNodePlacer>} nodePlacerMapper
   * @param {IMapper.<INode>} assistantMapper
   * @param {IGraph} tree
   */
  function setNodePlacers(rootNode, nodePlacerMapper, assistantMapper, tree) {
    const employee = rootNode.tag
    if (employee !== null) {
      const layout = employee.layout
      switch (layout) {
        case 'rightHanging': {
          const newDefaultNodePlacer = new DefaultNodePlacer(
            ChildPlacement.VERTICAL_TO_RIGHT,
            RootAlignment.LEADING_ON_BUS,
            30,
            30
          )
          newDefaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT
          nodePlacerMapper.set(rootNode, newDefaultNodePlacer)
          break
        }
        case 'leftHanging': {
          const newDefaultNodePlacer1 = new DefaultNodePlacer(
            ChildPlacement.VERTICAL_TO_LEFT,
            RootAlignment.LEADING_ON_BUS,
            30,
            30
          )
          newDefaultNodePlacer1.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT
          nodePlacerMapper.set(rootNode, newDefaultNodePlacer1)
          break
        }
        case 'bothHanging': {
          const newLeftRightPlacer = new LeftRightNodePlacer()
          newLeftRightPlacer.placeLastOnBottom = false
          nodePlacerMapper.set(rootNode, newLeftRightPlacer)
          break
        }
        default: {
          nodePlacerMapper.set(
            rootNode,
            new DefaultNodePlacer(ChildPlacement.HORIZONTAL_DOWNWARD, RootAlignment.MEDIAN, 30, 30)
          )
          break
        }
      }

      const assistant = employee.assistant
      if (assistant && tree.inDegree(rootNode) > 0) {
        const inEdge = tree.inEdgesAt(rootNode).get(0)
        const parent = inEdge.sourceNode
        const oldParentPlacer = nodePlacerMapper.get(parent)
        const assistantNodePlacer = new AssistantNodePlacer()
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
}
