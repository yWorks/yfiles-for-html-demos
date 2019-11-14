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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  './DemoStyles.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-organic',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, demoStyles) => {
  /**
   * The GraphComponent.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The maximal time the layout will run.
   */
  const MAX_TIME = 100

  /**
   * The layout algorithm.
   * @type {yfiles.organic.InteractiveOrganicLayout}
   */
  let layout = null

  /**
   * The copy of the graph used for the layout.
   * @type {yfiles.layout.CopiedLayoutGraph}
   */
  let copiedLayoutGraph = null

  /**
   * Holds the nodes that are moved during dragging.
   * @type {yfiles.collections.List.<yfiles.graph.INode>}
   */
  let movedNodes = null

  /**
   * The context that provides control over the layout calculation.
   * @type {yfiles.organic.InteractiveOrganicLayoutExecutionContext}
   */
  let layoutContext = null

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    graphComponent.inputMode = createEditorMode()

    initializeGraph()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the graph instance setting default styles
   * and creating a small sample graph.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    // set some defaults
    graph.nodeDefaults.style = new demoStyles.InteractiveOrganicFastNodeStyle()
    graph.nodeDefaults.shareStyleInstance = true
    graph.edgeDefaults.style = new demoStyles.InteractiveOrganicFastEdgeStyle()
    graph.edgeDefaults.shareStyleInstance = true

    createSampleGraph(graph)

    // center the initial graph
    graphComponent.fitGraphBounds()

    movedNodes = new yfiles.collections.List()

    // we wrap the PositionHandler for nodes so that we always have the collection of nodes
    // that are currently being moved available in "movedNodes".
    // this way we do not need to know how the node is moved and do not have to guess
    // what elements are currently being moved based upon selection, etc.
    graph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
      (item, implementation) =>
        new CollectingPositionHandlerWrapper(item, movedNodes, implementation)
    )

    // create a copy of the graph for the layout algorithm
    copiedLayoutGraph = new yfiles.layout.LayoutGraphAdapter(
      graphComponent.graph,
      null
    ).createCopiedLayoutGraph()

    // create and start the layout algorithm
    layout = startLayout()
    wakeUp(this, yfiles.lang.EventArgs.EMPTY)

    // register a listener so that structure updates are handled automatically
    graph.addNodeCreatedListener((source, args) => {
      if (layout !== null) {
        const center = args.item.layout.center
        synchronize()
        // we nail down all newly created nodes
        const copiedNode = copiedLayoutGraph.getCopiedNode(args.item)
        layout.setCenter(copiedNode, center.x, center.y)
        layout.setInertia(copiedNode, 1)
        layout.setStress(copiedNode, 0)

        window.setTimeout(synchronize, MAX_TIME + 1)
      }
    })
    graph.addNodeRemovedListener((source, args) => {
      synchronize()
    })
    graph.addEdgeCreatedListener((source, args) => {
      synchronize()
    })
    graph.addEdgeRemovedListener((source, args) => {
      synchronize()
    })
  }

  /**
   * Creates the input mode for the graphComponent.
   * @return {yfiles.input.IInputMode} a new GraphEditorInputMode instance
   */
  function createEditorMode() {
    // create default interaction with a number of disabled input modes.
    const mode = new yfiles.input.GraphEditorInputMode({
      selectableItems: yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.EDGE,
      marqueeSelectableItems: yfiles.graph.GraphItemTypes.NODE,
      clickSelectableItems: yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.EDGE,
      clickableItems: yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.EDGE,
      showHandleItems: yfiles.graph.GraphItemTypes.NONE,
      allowAddLabel: false
    })
    mode.createBendInputMode.enabled = false
    mode.createEdgeInputMode.allowCreateBend = false
    mode.createEdgeInputMode.selfloopCreationAllowed = false

    // prepare the move input mode for interacting with the layout algorithm
    initMoveMode(mode.moveInputMode)

    // We could also allow direct moving of nodes, without requiring selection of the nodes, first.
    // However by default this conflicts with the edge creation gesture, which we will simply disable, here.
    // uncomment the following lines to be able to move nodes without selecting them first
    //
    // mode.moveUnselectedInputMode.enabled = true;
    // initMoveMode(mode.moveUnselectedInputMode);

    return mode
  }

  /**
   * Registers the listeners to the given move input mode in order to tell the organic layout what
   * nodes are moved interactively.
   * @param {yfiles.input.MoveInputMode} moveInputMode The input mode that should be observed
   */
  function initMoveMode(moveInputMode) {
    // whenever a drag is starting, reset the collection of moved nodes.
    moveInputMode.addDragStartingListener((sender, args) => {
      movedNodes.clear()
    })

    // register callbacks to notify the organic layout of changes
    moveInputMode.addDragStartedListener(onMoveInitialized)
    moveInputMode.addDragCanceledListener(onMoveCanceled)
    moveInputMode.addDraggedListener(onMoving)
    moveInputMode.addDragFinishedListener(onMovedFinished)
  }

  /**
   * Called once the move operation has been initialized.
   * Calculates which components stay fixed and which nodes will be moved by the user.
   * @param {object} sender
   * @param {yfiles.input.InputModeEventArgs} args
   */
  function onMoveInitialized(sender, args) {
    if (layout !== null) {
      const copy = copiedLayoutGraph
      const componentNumber = copy.createNodeMap()
      yfiles.algorithms.GraphConnectivity.connectedComponents(copy, componentNumber)
      const movedComponents = new Set()
      const selectedNodes = new Set()
      movedNodes.forEach(node => {
        const copiedNode = copy.getCopiedNode(node)
        if (copiedNode !== null) {
          // remember that we nailed down this node
          selectedNodes.add(copiedNode)
          // remember that we are moving this component
          movedComponents.add(componentNumber.getInt(copiedNode))
          // Update the position of the node in the CLG to match the one in the IGraph
          layout.setCenter(
            copiedNode,
            node.layout.x + node.layout.width * 0.5,
            node.layout.y + node.layout.height * 0.5
          )
          // Actually, the node itself is fixed at the start of a drag gesture
          layout.setInertia(copiedNode, 1.0)
          // Increasing has the effect that the layout will consider this node as not completely placed...
          // In this case, the node itself is fixed, but it's neighbors will wake up
          increaseHeat(copiedNode, layout, 0.5)
        }
      })

      // there are components that won't be moved - nail the nodes down so that they don't spread apart infinitely
      copy.nodes.forEach(copiedNode => {
        if (!movedComponents.has(componentNumber.getInt(copiedNode))) {
          layout.setInertia(copiedNode, 1)
        } else if (!selectedNodes.has(copiedNode)) {
          // make it float freely
          layout.setInertia(copiedNode, 0)
        }
      })

      // dispose the map
      copy.disposeNodeMap(componentNumber)

      // Notify the layout that there is new work to do...
      layout.wakeUp()
    }
  }

  /**
   * Notifies the layout of the new positions of the interactively moved nodes.
   * @param {object} sender
   * @param {yfiles.input.InputModeEventArgs} args
   */
  function onMoving(sender, args) {
    if (layout !== null) {
      const copy = copiedLayoutGraph
      movedNodes.forEach(node => {
        const copiedNode = copy.getCopiedNode(node)
        if (copiedNode !== null) {
          // Update the position of the node in the CLG to match the one in the IGraph
          layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
          // Increasing the heat has the effect that the layout will consider these nodes as not completely placed...
          increaseHeat(copiedNode, layout, 0.05)
        }
      })
      // Notify the layout that there is new work to do...
      layout.wakeUp()
    }
  }

  /**
   * Resets the state in the layout when the user cancels the move operation.
   * @param {object} sender
   * @param {yfiles.input.InputModeEventArgs} args
   */
  function onMoveCanceled(sender, args) {
    if (layout !== null) {
      const copy = copiedLayoutGraph
      movedNodes.forEach(node => {
        const copiedNode = copy.getCopiedNode(node)
        if (copiedNode !== null) {
          // Update the position of the node in the CLG to match the one in the IGraph
          layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
          layout.setStress(copiedNode, 0)
        }
      })
      copy.nodes.forEach(copiedNode => {
        // Reset the node's inertia to be fixed
        layout.setInertia(copiedNode, 1.0)
        layout.setStress(copiedNode, 0)
      }) // We don't want to restart the layout (since we canceled the drag anyway...)
    }
  }

  /**
   * Called once the interactive move is finished.
   * Updates the state of the interactive layout.
   * @param {object} sender
   * @param {yfiles.input.InputModeEventArgs} args
   */
  function onMovedFinished(sender, args) {
    if (layout !== null) {
      const copy = copiedLayoutGraph
      movedNodes.forEach(node => {
        const copiedNode = copy.getCopiedNode(node)
        if (copiedNode !== null) {
          // Update the position of the node in the CLG to match the one in the IGraph
          layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
          layout.setStress(copiedNode, 0)
        }
      })
      copy.nodes.forEach(copiedNode => {
        // Reset the node's inertia to be fixed
        layout.setInertia(copiedNode, 1.0)
        layout.setStress(copiedNode, 0)
      })
    }
  }

  /**
   * Wires up the GUI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  /**
   * Creates a new layout instance and starts a new execution context for it.
   * @return {yfiles.organic.InteractiveOrganicLayout}
   */
  function startLayout() {
    // create the layout
    const organicLayout = new yfiles.organic.InteractiveOrganicLayout()
    organicLayout.maxTime = MAX_TIME

    layoutContext = organicLayout.startLayout(copiedLayoutGraph)

    // use an animator that animates an infinite animation
    const animator = new yfiles.view.Animator(graphComponent)
    animator.autoInvalidation = false
    animator.allowUserInteraction = true

    animator.animate(() => {
      layoutContext.continueLayout(20)
      if (organicLayout.commitPositionsSmoothly(50, 0.05) > 0) {
        graphComponent.updateVisual()
      }
    }, Number.POSITIVE_INFINITY)

    return organicLayout
  }

  /**
   * Wakes up the layout algorithm.
   * @param {object} sender
   * @param {yfiles.lang.EventArgs} args
   */
  function wakeUp(sender, args) {
    if (layout !== null) {
      // we make all nodes freely movable
      copiedLayoutGraph.nodes.forEach(copiedNode => {
        layout.setInertia(copiedNode, 0)
      })
      // then wake up the layout
      layout.wakeUp()

      const geim = graphComponent.inputMode
      // and after two seconds we freeze the nodes again...
      window.setTimeout(() => {
        if (geim.moveInputMode.isDragging) {
          // don't freeze the nodes if a node is currently being moved
          return
        }
        copiedLayoutGraph.nodes.forEach(copiedNode => {
          layout.setInertia(copiedNode, 1)
        })
      }, 2000)
    }
  }

  /**
   * Synchronizes the structure of the graph copy with the original graph.
   */
  function synchronize() {
    if (layout !== null) {
      layout.syncStructure()
      layoutContext.continueLayout(10)
    }
  }

  /**
   * Helper method that increases the heat of the neighbors of a given node by a given value.
   * This will make the layout algorithm move the neighbor nodes more quickly.
   * @param {yfiles.algorithms.Node} copiedNode
   * @param {yfiles.layout.ILayoutAlgorithm} layoutAlgorithm
   * @param {number} delta
   */
  function increaseHeat(copiedNode, layoutAlgorithm, delta) {
    // Increase Heat of neighbors
    copiedNode.neighbors.forEach(neighbor => {
      const oldStress = layoutAlgorithm.getStress(neighbor)
      layoutAlgorithm.setStress(neighbor, Math.min(1, oldStress + delta))
    })
  }

  /**
   * Creates sample graph.
   * @param {yfiles.graph.IGraph} graph
   */
  function createSampleGraph(graph) {
    const nodes = []
    for (let i = 0; i < 20; i++) {
      nodes[i] = graph.createNode()
    }

    graph.createEdge(nodes[0], nodes[11])
    graph.createEdge(nodes[0], nodes[8])
    graph.createEdge(nodes[0], nodes[19])
    graph.createEdge(nodes[0], nodes[2])
    graph.createEdge(nodes[11], nodes[4])
    graph.createEdge(nodes[11], nodes[18])
    graph.createEdge(nodes[8], nodes[7])
    graph.createEdge(nodes[19], nodes[13])
    graph.createEdge(nodes[19], nodes[2])
    graph.createEdge(nodes[19], nodes[17])
    graph.createEdge(nodes[19], nodes[15])
    graph.createEdge(nodes[19], nodes[10])
    graph.createEdge(nodes[13], nodes[7])
    graph.createEdge(nodes[13], nodes[17])
    graph.createEdge(nodes[2], nodes[15])
    graph.createEdge(nodes[2], nodes[1])
    graph.createEdge(nodes[4], nodes[18])
    graph.createEdge(nodes[16], nodes[6])
    graph.createEdge(nodes[7], nodes[14])
    graph.createEdge(nodes[17], nodes[5])
    graph.createEdge(nodes[15], nodes[10])
    graph.createEdge(nodes[15], nodes[12])
    graph.createEdge(nodes[6], nodes[9])
    graph.createEdge(nodes[5], nodes[3])
    graph.createEdge(nodes[5], nodes[9])
  }

  /**
   * Wraps an existing position handler and adds moved nodes to a provided shared collection.
   * This makes it possible to always know which nodes are being moved, no matter what code
   * uses the PositionHandler.
   * @extends yfiles.input.ConstrainedPositionHandler
   */
  class CollectingPositionHandlerWrapper extends yfiles.input.ConstrainedPositionHandler {
    /**
     * Creates a new instance of CollectingPositionHandlerWrapper.
     * @param {yfiles.graph.IModelItem} item
     * @param nodesToMove
     * @param baseImplementation
     */
    constructor(item, nodesToMove, baseImplementation) {
      super(baseImplementation)
      this.$item = item
      this.$movedNodes = nodesToMove
    }

    /** @type {yfiles.graph.IModelItem} */
    get item() {
      return this.$item
    }

    /** @type {yfiles.graph.IModelItem} */
    set item(value) {
      this.$item = value
    }

    /**
     * @type {yfiles.collections.ICollection.<yfiles.graph.INode>}
     */
    get movedNodes() {
      return this.$movedNodes
    }

    /**
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} originalLocation
     */
    onInitialized(inputModeContext, originalLocation) {
      // we remember the item in the collection when the drag is initialized.
      this.movedNodes.add(this.item)
    }

    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.geometry.Point} originalLocation
     * @param {yfiles.geometry.Point} newLocation
     * @return {yfiles.geometry.Point}
     */
    constrainNewLocation(context, originalLocation, newLocation) {
      // we do not really constrain the location - this is just a convenience class
      return newLocation
    }
  }

  // start demo
  run()
})
