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

/* eslint-disable no-loop-func */
/* eslint-disable global-require */
/* eslint-disable no-loop-func */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-component',
  'resources/demo-app',
  'PackageNodeStyleDecorator.js',
  'MagnifyNodeHighlightInstaller.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  PackageNodeStyleDecorator,
  MagnifyNodeHighlightInstaller
) => {
  /**
   * The {@link yfiles.view.GraphComponent} which contains the {@link yfiles.graph.IGraph}.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The node style that is applied to all nodes.
   * It provides an icon and buttons to reveal additional dependents/dependencies.
   * @type {yfiles.styles.INodeStyle}
   */
  let defaultNodeStyle = null

  /**
   * The node label style that is applied to all labels.
   * It provides a label without background and white text.
   * @type {yfiles.styles.ILabelStyle}
   */
  let nodeLabelStyle = null

  /**
   * The parameter for all node labels.
   * It keeps the labels on the right side of the node.
   * @type {yfiles.graph.ILabelModelParameter}
   */
  let nodeLabelParameter = null

  /**
   * The edge style that is applied to all original, non-transitive edges in the graph.
   * Normal edges are visualized with a solid black line and arrow.
   * @type {yfiles.styles.IEdgeStyle}
   */
  let normalEdgeStyle = null

  /**
   * The edge style that is applied to all edges that were added when calculating the transitive closure.
   * Those edges are visualized with a solid blue line and arrow.
   * @type {yfiles.styles.IEdgeStyle}
   */
  let addedEdgeStyle = null

  /**
   * The edge style that is applied to all edges that were removed when calculating the transitive reduction.
   * Those edges are visualized with a dashed grey line and an arrow.
   * @type {yfiles.styles.IEdgeStyle}
   */
  let removedEdgeStyle = null

  /**
   * The layout algorithm that is used for every layout calculation in this demo.
   * It is configured in {@link initializeLayout()}.
   * @type {yfiles.hierarchic.HierarchicLayout}
   */
  let layout = null

  /**
   * Marks whether or not the demo is currently layouting the graph.
   * During layout, the toolbar is disabled.
   * @type boolean
   */
  let layouting = false

  /**
   * Changes the toolbar state according to if a layout is running or not.
   * @param {boolean} isLayouting
   */
  function setLayouting(isLayouting) {
    if (!busy) {
      // only change toolbar-state when not busy loading npm-packages
      // since there are layout calculations during loading
      setUIDisabled(isLayouting)
    }
    layouting = isLayouting
  }

  /**
   * Marks whether or not the demo is currently loading npm-packages.
   * When busy, the mouse cursor is changed and the toolbar as well as the input modes are disabled.
   * @type boolean
   */
  let busy = false

  /**
   * Updates the UI according to whether the demo is busy loading npm-packages.
   * @param {boolean} isBusy
   */
  function setBusy(isBusy) {
    setUIDisabled(isBusy)
    setLoadingIndicatorVisibility(isBusy)
    busy = isBusy
  }

  /**
   * Combo box to select one of the different algorithms.
   * It provides access to transitive reduction, transitive closure and returning to the original graph.
   * @type {HTMLElement}
   */
  let algorithmComboBox = null

  /**
   * Text box to request the dependency graph for a certain npm-package.
   * It is only available if npm-packages are browsed.
   * @type {HTMLElement}
   */
  let packageTextBox = null

  /**
   * Combo box to select one of the two samples.
   * There is an dependency graph of the <em>yFiles for HTML</em> modules as well as the possibility to browse
   * npm-packages with their dependencies.
   * @type {HTMLElement}
   */
  let samplesComboBox = null

  /**
   * Holds all edges that are added when calculating the transitive closure.
   * These edges are removed when the original graph is restored.
   * @type {Array.<yfiles.graph.IEdge>}
   */
  let addedEdges = []

  /**
   * Holds all nodes that are added when loading npm-packages and are not part of the layout, yet.
   * If the number of these nodes reaches a certain limit, they are inserted in the layout incrementally.
   * @type {Array.<yfiles.graph.INode>}
   */
  let addedNodes = []

  /**
   * Stores all edges that where removed when calculation the transitive reduction in case they should be invisible.
   * @type {Set.<yfiles.graph.IEdge>}
   */
  let removedEdgesSet = null

  /**
   * Stores all nodes that are currently visible in the graph.
   * @type {Set.<yfiles.graph.INode>}
   */
  let filteredNodes = null

  /**
   * Stores all edges that are currently visible in the graph.
   * @type {Set.<yfiles.graph.IEdge>}
   */
  let filteredEdges = null

  /**
   * A filtered graph that only shows the sub-graph that currently of interest.
   * Nodes and edges that should be visible are described by
   * {@link edgePredicate(yfiles.graph.IEdge)} and
   * {@link edgePredicate(yfiles.graph.INode)}.
   * @type {yfiles.graph.FilteredGraphWrapper}
   */
  let filteredGraph = null

  /**
   * Holds all nodes that should be inserted into the layout incrementally at then next layout run.
   * @type {Array.<yfiles.graph.INode>}
   */
  let incrementalNodes = []

  /**
   * Holds all edges that should be inserted into the layout incrementally at then next layout run.
   * @type {Array.<yfiles.graph.INode>}
   */
  let incrementalEdges = []

  /**
   * Marks whether or not edges that were removed during transitive reduction are visible.
   * @type {boolean}
   */
  let showTransitiveEdges = true

  /**
   * Stores all npm-packages that have been visited to be able to reuse those nodes instead of reloading them.
   * This mapper will be cleared when switching samples or loading a new npm-package graph.
   * @type {yfiles.collections.Map.<string, yfiles.graph.INode>}
   */
  let visitedPackages = null

  /**
   * The node whose dependencies are currently shown.
   * This is used for determining if it is necessary to reload the npm-package graph.
   * @type {yfiles.graph.INode}
   */
  let startNode = null

  /**
   * The number of dependents in the current graph.
   * @type {number}
   */
  let dependentsNo = 0

  /**
   * The number of dependencies in the current graph.
   * @type {number}
   */
  let dependenciesNo = 0

  /**
   * Starts a demo that shows how to use the yFiles transitivity algorithms.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    samplesComboBox = document.getElementById('samplesComboBox')
    algorithmComboBox = document.getElementById('algorithmComboBox')

    // use a filtered graph to have control over which nodes and edges are visible at any time
    filteredGraph = new yfiles.graph.FilteredGraphWrapper(
      graphComponent.graph,
      nodePredicate.bind(this),
      edgePredicate.bind(this)
    )
    graphComponent.graph = filteredGraph

    // load input module and initialize input
    initializeInputModes()
    initializeStyles()
    initializeLayout()
    initializeGraph()

    loadGraph()

    setLoadingIndicatorVisibility(false)

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Registers the JavaScript commands for the GUI elements, typically the
   * tool bar buttons, during the creation of this application.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindChangeListener(
      "select[data-command='SampleSelectionChanged']",
      onSampleGraphChanged.bind(this)
    )
    app.bindChangeListener(
      "select[data-command='AlgorithmSelectionChanged']",
      onAlgorithmChanged.bind(this)
    )
    app.bindAction("button[data-command='LoadDependencies']", loadGraph.bind(this))

    app.bindAction("button[data-command='RunLayout']", () => {
      applyLayout(false)
    })

    app.bindAction("input[data-command='ShowTransitiveEdges']", () => {
      const button = document.getElementById('showTransitiveEdgesButton')
      showTransitiveEdges = button.checked
      if (algorithmComboBox.selectedIndex === 2) {
        const undoEdit = beginUndoEdit('undoShowTransitiveEdges', 'redoShowTransitiveEdges')
        resetGraph()
        applyAlgorithm()
        applyLayout(true, () => {
          commitUndoEdit(undoEdit)
        })
      }
    })

    graphComponent.inputMode.keyboardInputMode.addCommandBinding(
      iCommand.UNDO,
      () => {
        graphComponent.graph.undoEngine.undo()
      },
      () => graphComponent.graph.undoEngine.canUndo()
    )

    graphComponent.inputMode.keyboardInputMode.addCommandBinding(
      iCommand.REDO,
      () => {
        graphComponent.graph.undoEngine.redo()
      },
      () => graphComponent.graph.undoEngine.canRedo()
    )

    packageTextBox = document.getElementById('packageTextBox')
    packageTextBox.addEventListener('click', packageTextBox.select)
    packageTextBox.addEventListener('input', () => {
      packageTextBox.className = 'default'
    })
    packageTextBox.addEventListener('keydown', event => {
      const key = event.which || event.keyCode
      if (key === 13) {
        loadGraph()
        event.preventDefault()
      }
    })
  }

  /**
   * Returns enlarged bounds for the given item that correspond to the highlight bounds.
   * @param {yfiles.graph.IGraph} item The item whose bounds are enlarged.
   * @return {yfiles.geometry.Rect} The new bounds.
   */
  function getEnlargedNodeBounds(item) {
    const nodeBounds = item.layout.toRect()
    const transform = new yfiles.geometry.Matrix()
    const itemCenterX = nodeBounds.x + nodeBounds.width * 0.5
    const itemCenterY = nodeBounds.y + nodeBounds.height * 0.5
    transform.translate(new yfiles.geometry.Point(itemCenterX, itemCenterY))

    const zoom = graphComponent.zoom
    if (zoom < 1) {
      // if the zoom level is below 1, reverse the zoom for this node before enlarging it
      transform.scale(1 / zoom, 1 / zoom)
    }
    transform.scale(1.2, 1.2)
    transform.translate(new yfiles.geometry.Point(-itemCenterX, -itemCenterY))
    return nodeBounds.getTransformed(transform)
  }

  /**
   * Initializes {@link yfiles.input.GraphViewerInputMode} as input mode for this demo.
   */
  function initializeInputModes() {
    const mode = new yfiles.input.GraphViewerInputMode({
      selectableItems: yfiles.graph.GraphItemTypes.NONE
    })

    // show enlarged nodes on hover
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, eventArgs) => {
      const item = eventArgs.item
      const oldItem = eventArgs.oldItem

      const highlightManager = graphComponent.highlightIndicatorManager
      if (item) {
        // add enlarged version of the node as highlight
        highlightManager.addHighlight(item)
        item.tag.highlight = true
      }
      if (oldItem) {
        // remove previous highlight
        highlightManager.removeHighlight(oldItem)
        oldItem.tag.highlight = false
      }
    })
    mode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.NODE
    mode.itemHoverInputMode.discardInvalidItems = false
    mode.itemHoverInputMode.hoverCursor = yfiles.view.Cursor.POINTER

    // install custom highlight
    graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
      new MagnifyNodeHighlightInstaller()
    )

    mode.addItemClickedListener((sender, e) => {
      // check if the clicked item is a node or if the loaded graph is yfiles/modules, since this graph has
      // no pending dependencies... in this case, we have to execute the code in addItemSelectedListener.
      if (yfiles.graph.INode.isInstance(e.item)) {
        const item = e.item
        const clickPoint = graphComponent.inputMode.clickInputMode.clickLocation

        // if the node is hovered, we have to use the enlarged bounds of the highlight
        const nodeBounds = getEnlargedNodeBounds(item)
        const existingPackages = new yfiles.collections.Map()

        // check if dependencies' circle was hit
        let handled = false
        if (
          item.tag &&
          item.tag.pendingDependencies &&
          clickIsInCircle(nodeBounds, clickPoint, nodeBounds.width)
        ) {
          handlePendingDependencies(item, existingPackages)
          handled = true
        }

        if (!handled && item !== startNode) {
          const undoEdit = beginUndoEdit('undoChangeStartNode', 'redoChangeStartNode')
          graphComponent.graph.undoEngine.addUnit(new ChangedSetUndoUnit())
          graphComponent.currentItem = item
          filteredGraph.nodes.forEach(node => {
            node.tag.pendingDependencies = false
          })
          filterGraph(item, () => {
            commitUndoEdit(undoEdit)
          })
        }
        e.handled = true
      }
    })

    graphComponent.inputMode = mode
  }

  /**
   * Loads pending dependencies for the given node in case the click-point is located in the according circle.
   * @param {yfiles.graph.INode} item the node whose dependencies are completed.
   * @param {yfiles.collections.Map} existingPackages A mapping of existing packages.
   */
  function handlePendingDependencies(item, existingPackages) {
    const undoEdit = beginUndoEdit('undoLoadPendingDependencies', 'redoLoadPendingDependencies')
    graphComponent.graph.undoEngine.addUnit(new ChangedSetUndoUnit())

    filteredGraph.nodes.forEach(node => {
      existingPackages.set(node.labels.get(0).text, node)
      filteredNodes.add(node)
    })
    setBusy(true)
    onAddDependencies(item.labels.get(0).text, item, true)
      .then(() => {
        addedNodes.forEach(node => {
          filteredNodes.add(node)
          incrementalNodes.push(node)
        })
        filteredGraph.nodePredicateChanged()
        filteredGraph.edgePredicateChanged()
        applyAlgorithm()
        applyLayout(true, () => {
          setBusy(false)
          commitUndoEdit(undoEdit)
          animateViewPort(item)
          addedNodes = []
        })
      })
      .catch(() => {
        setBusy(false)
        cancelUndoEdit(undoEdit)
      })
  }

  /**
   * Animates the view port based on the newly inserted nodes.
   * @param {yfiles.graph.INode} hoveredItem The item that has been currently hovered
   */
  function animateViewPort(hoveredItem) {
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    // we have to calculate the rectangle that includes all the newly inserted nodes plus the node that has been hovered
    // so we first add the hovered node to the addedNodes array
    addedNodes.push(hoveredItem)
    addedNodes.forEach(node => {
      minX = Math.min(minX, node.layout.x)
      minY = Math.min(minY, node.layout.y)
      maxX = Math.max(maxX, node.layout.x + node.layout.width)
      maxY = Math.max(maxY, node.layout.y + node.layout.height)
    })

    if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
      // Enlarge the viewport so that we get an overview of the neighborhood as well
      let rect = new yfiles.geometry.Rect(minX, minY, Math.abs(maxX - minX), Math.abs(maxY - minY))
      rect = rect.getEnlarged(new yfiles.geometry.Insets(100))

      // Animate the transition to the failed element
      const animator = new yfiles.view.Animator(graphComponent)
      animator.allowUserInteraction = true
      const viewportAnimation = new yfiles.view.ViewportAnimation(graphComponent, rect, '1s')
      animator.animate(viewportAnimation.createEasedAnimation(0, 1))
    }
  }

  /**
   * Initializes the styles to use for the graph.
   */
  function initializeStyles() {
    const shapeNodeStyle = new yfiles.styles.ShapeNodeStyle({
      shape: 'round_rectangle',
      stroke: 'rgb(102, 153, 204)',
      fill: 'rgb(102, 153, 204)'
    })
    defaultNodeStyle = new PackageNodeStyleDecorator(shapeNodeStyle)

    normalEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px black',
      targetArrow: yfiles.styles.IArrow.TRIANGLE,
      smoothingLength: 10
    })

    addedEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px rgb(51, 102, 153)',
      targetArrow: new yfiles.styles.Arrow({
        fill: 'rgb(51, 102, 153)',
        stroke: 'rgb(51, 102, 153)',
        type: yfiles.styles.ArrowType.TRIANGLE
      }),
      smoothingLength: 10
    })

    removedEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px dashed gray',
      targetArrow: new yfiles.styles.Arrow({
        fill: 'gray',
        stroke: 'gray',
        type: yfiles.styles.ArrowType.TRIANGLE
      }),
      smoothingLength: 10
    })

    nodeLabelStyle = new yfiles.styles.DefaultLabelStyle({
      font: 'Arial',
      textFill: 'white'
    })

    const nodeLabelModel = new yfiles.graph.InteriorLabelModel({
      insets: 9
    })
    nodeLabelParameter = nodeLabelModel.createParameter(
      yfiles.graph.InteriorLabelModelPosition.EAST
    )
  }

  /**
   * Initializes the graph defaults.
   */
  function initializeGraph() {
    const graph = filteredGraph
    graph.nodeDefaults.style = defaultNodeStyle
    graph.nodeDefaults.size = new yfiles.geometry.Size(80, 30)
    graph.edgeDefaults.style = normalEdgeStyle
    graph.nodeDefaults.labels.style = nodeLabelStyle
    graph.undoEngineEnabled = true
  }

  /**
   * Initializes the layout algorithms.
   */
  function initializeLayout() {
    layout = new yfiles.hierarchic.HierarchicLayout()
    layout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
    layout.minimumLayerDistance = 0
    layout.nodeToNodeDistance = 20
    layout.backLoopRouting = true
    layout.automaticEdgeGrouping = true
    layout.nodePlacer.barycenterMode = true
    layout.edgeLayoutDescriptor.routingStyle = new yfiles.hierarchic.RoutingStyle(
      yfiles.hierarchic.EdgeRoutingStyle.OCTILINEAR
    )
  }

  /**
   * Loads a new dependency graph according to which sample is selected.
   * This function is also called if a new start package is chosen.
   */
  function loadGraph() {
    filteredGraph.wrappedGraph.clear()
    filteredNodes = null
    filteredEdges = null

    addedEdges = []

    if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
      resetGraph()

      require(['resources/yfiles-modules-data.js'], yfilesModulesSample => {
        const builder = new yfiles.binding.GraphBuilder(graphComponent.graph)
        builder.nodesSource = yfilesModulesSample.nodes
        builder.edgesSource = yfilesModulesSample.edges
        builder.sourceNodeBinding = 'from'
        builder.targetNodeBinding = 'to'
        builder.nodeIdBinding = 'id'
        builder.nodeLabelBinding = tag => tag.label || null

        graphComponent.graph = builder.buildGraph()

        graphComponent.graph.nodes.forEach(node => {
          const label = node.labels.first()
          node.layout.width = label.layout.width + 50
          graphComponent.graph.setLabelLayoutParameter(label, nodeLabelParameter)
          node.tag = { highlight: false }
        })

        startNode = getInitialPackage('yfiles/complete')
        graphComponent.currentItem = startNode

        // initialize the values for yfiles/modules, so that we do not count them again
        dependentsNo = 0
        dependenciesNo = filteredGraph.nodes.size - 1

        applyAlgorithm()
        applyLayout(false, () => {
          graphComponent.graph.undoEngine.clear()
        })
      })
    } else {
      const packageText = packageTextBox.value
      // check for empty package name
      if (packageText.replace(/\s/g, '') === '') {
        packageTextBox.value = 'Invalid Package'
        packageTextBox.className = 'error'
      } else {
        // initialize dependents/dependencies values
        dependentsNo = 0
        dependenciesNo = 0
        filteredNodes = new Set()
        filteredEdges = new Set()
        visitedPackages = new yfiles.collections.Map()
        updateGraph(packageText, false, () => {
          graphComponent.graph.undoEngine.clear()
        })
      }
    }
  }

  /**
   * Updates the graph by filling it with nodes that represent npm-packages.
   * The packages are loaded asynchronously from the internet.
   * @param {string} packageText the name of the start package
   * @param {boolean} incremental <code>true</code> if the layouts should be incremental
   * @param {function} callback A callback-function which is invoked when the graph is updated and has a new layout.
   */
  function updateGraph(packageText, incremental, callback) {
    setBusy(true)

    // reset the table with the graph information
    resetTable(packageText)

    incrementalNodes = []

    getStartNode(packageText)
      .then(start => {
        startNode = start.startNode
        const startNodeDependencies = start.startNodeDependencies
        addDependencies(startNode, startNodeDependencies, incremental).then(() => {
          addedNodes.forEach(node => {
            filteredNodes.add(node)
            incrementalNodes.push(node)
          })
          addedNodes = []
          filteredGraph.nodePredicateChanged()
          filteredGraph.edgePredicateChanged()
          applyAlgorithm()
          applyLayout(incremental, () => {
            incrementalNodes = []
            setBusy(false)
            if (callback) {
              callback()
            }
          })
        })
      })
      .catch(() => {
        const errorMessage = ' - Invalid Package'
        if (packageTextBox.value.indexOf(errorMessage) === -1) {
          packageTextBox.value = packageText + errorMessage
          packageTextBox.className = 'error'

          setBusy(false)
          if (callback) {
            callback()
          }
        }
      })
  }

  /**
   * Retrieves the node from where the dependencies unfold, asynchronously.
   * @param {string} packageName the name of the package represented by the start node
   * @return {Promise}
   */
  function getStartNode(packageName) {
    return new Promise((resolve, reject) => {
      const url = `http://localhost:3000/npm-request?type=dependencies&package=${packageName}`
      requestData(url)
        .then(data => {
          try {
            const object = JSON.parse(JSON.stringify(data))
            if (object.error) {
              reject()
            } else {
              let node = visitedPackages.get(packageName)
              if (!node) {
                const wrappedGraph = filteredGraph.wrappedGraph
                node = wrappedGraph.createNode({
                  tag: {
                    highlight: false,
                    pendingDependencies: false
                  }
                })
                const label = wrappedGraph.addLabel(node, packageName, nodeLabelParameter)
                wrappedGraph.setNodeLayout(
                  node,
                  new yfiles.geometry.Rect(0, 0, label.layout.width + 50, node.layout.height)
                )
                wrappedGraph.setNodeCenter(node, graphComponent.contentRect.center)
                node.tag.highlight = false
              }
              filteredNodes.add(node)
              filteredGraph.nodePredicateChanged(node)
              graphComponent.currentItem = node
              incrementalNodes.push(node)
              visitedPackages.set(packageName, node)

              let dependencies
              if (object.dependencies) {
                dependencies = Object.keys(object.dependencies)
              } else {
                dependencies = []
              }
              resolve({
                startNode: node,
                startNodeDependencies: dependencies
              })
            }
          } catch (e) {
            alert('Failed to parse JSON data')
            reject()
          }
        })
        .catch(() => {
          alert('Failed to load NPM Graph. Did you start the Demo Server (see description text)?')
          reject()
        })
    })
  }

  /**
   * Returns the node that represents the given package.
   * @param {string} packageName the name of the package and the label of the node
   * @return {yfiles.graph.INode}
   */
  function getInitialPackage(packageName) {
    let initialPackageNode = null
    filteredGraph.wrappedGraph.nodes.forEach(node => {
      if (packageName === node.labels.get(0).text) {
        initialPackageNode = node
      }
    })
    return initialPackageNode
  }

  /**
   * Adds nodes for all dependencies asynchronously.
   * @param {yfiles.graph.INode} pred the predecessor node
   * @param {Array} predDependencies all dependencies of pred
   * @param {boolean} incremental whether or not the layout is applied incrementally
   * @return {Promise}
   */
  function addDependencies(pred, predDependencies, incremental) {
    return new Promise((resolve, reject) => {
      const promises = []
      predDependencies.forEach(dependency => {
        let node = visitedPackages.get(dependency)
        const wrappedGraph = filteredGraph.wrappedGraph
        if (!node) {
          node = wrappedGraph.createNode({
            tag: {
              highlight: false,
              pendingDependencies: false
            }
          })
          const label = wrappedGraph.addLabel(node, dependency, nodeLabelParameter)
          wrappedGraph.setNodeLayout(
            node,
            new yfiles.geometry.Rect(0, 0, label.layout.width + 50, node.layout.height)
          )
          node.tag.highlight = false
          dependenciesNo++

          addedNodes.push(node)
          visitedPackages.set(dependency, node)
        } else {
          node.tag.pendingDependencies = false
          if (addedNodes.indexOf(node) < 0 && !filteredNodes.has(node)) {
            addedNodes.push(node)
            dependenciesNo++
          }
        }

        if (pred && pred !== node) {
          let edge = getEdge(wrappedGraph, pred, node)
          if (edge === null) {
            edge = wrappedGraph.createEdge(pred, node)
          }
          filteredEdges.add(edge)
        }

        const layoutPromise = tryLayout(incremental)
        promises.push(layoutPromise)

        if (wrappedGraph.outDegree(node) > 0) {
          const dependencies = []
          wrappedGraph.outEdgesAt(node).forEach(edge => {
            dependencies.push(edge.targetNode.labels.get(0).text)
          })
          if (dependencies.length > 0) {
            if (filteredGraph.nodes.size + addedNodes.length < 100) {
              promises.push(addDependencies(node, dependencies, incremental))
            } else {
              node.tag.pendingDependencies = true
            }
          }
        } else {
          promises.push(
            new Promise((dependencyResolve, dependencyReject) => {
              const url = `http://localhost:3000/npm-request?type=dependencies&package=${dependency}`
              requestData(url)
                .then(data => {
                  try {
                    const object = JSON.parse(JSON.stringify(data))
                    if (object.error) {
                      dependencyReject()
                    } else {
                      const dependencies = object.dependencies
                      if (dependencies && Object.keys(dependencies).length > 0) {
                        if (filteredGraph.nodes.size + addedNodes.length < 100) {
                          addDependencies(node, Object.keys(dependencies), incremental)
                            .then(() => {
                              dependencyResolve()
                            })
                            .catch(() => {
                              dependencyReject()
                            })
                        } else {
                          node.tag.pendingDependencies = Object.keys(dependencies).length > 0
                          dependencyResolve()
                        }
                      } else {
                        dependencyResolve()
                      }
                    }
                  } catch (e) {
                    alert('Failed to parse JSON data')
                    reject()
                  }
                })
                .catch(() => {
                  reject()
                })
            })
          )
        }
      })

      Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch(() => {
          reject()
        })
    })
  }

  /**
   * Returns the edge between the two given nodes in the graph or <code>null</code> if there is none.
   * @param {yfiles.graph.IGraph} graph the graph to which the edge belongs
   * @param {yfiles.graph.INode} node1 one incident node to the edge
   * @param {yfiles.graph.INode} node2 another incident node to the edge
   * @return {yfiles.graph.IEdge}
   */
  function getEdge(graph, node1, node2) {
    const outEdges = graph.outEdgesAt(node1)
    for (let i = 0; i < outEdges.size; i++) {
      const outEdge = outEdges.get(i)
      if (outEdge.equals(node2)) {
        return outEdge
      }
    }
    return null
  }

  /**
   * Unfolds dependencies in the npm-graph that were not loaded because the graph was already large, asynchronously.
   * This function is called when the plus-sign on the right of the node is clicked.
   * @param {string} packageName the name of the previous package
   * @param {yfiles.graph.INode}pred the node that represents the predecessor
   * @param {boolean} incremental whether or not the layout should be incremental
   * @return {Promise}
   */
  function onAddDependencies(packageName, pred, incremental) {
    return new Promise((resolve, reject) => {
      if (filteredGraph.wrappedGraph.outDegree(pred) > 0) {
        const promises = []
        filteredGraph.wrappedGraph.outEdgesAt(pred).forEach(edge => {
          filteredEdges.add(edge)
          pred.tag.pendingDependencies = false
          const target = edge.targetNode
          if (!filteredNodes.has(target)) {
            filteredNodes.add(target)
            addedNodes.push(target)
          }

          if (
            filteredGraph.wrappedGraph.outDegree(target) > 0 ||
            (target.tag && target.tag.pendingDependencies)
          ) {
            target.tag.pendingDependencies = true
          } else {
            promises.push(
              new Promise((dependencyResolve, dependencyReject) => {
                const dependencyUrl = `http://localhost:3000/npm-request?type=dependencies&package=${
                  target.labels.get(0).text
                }`
                requestData(dependencyUrl)
                  .then(data => {
                    try {
                      const object = JSON.parse(JSON.stringify(data))
                      if (object.error) {
                        dependencyReject()
                      } else {
                        if (object.dependencies) {
                          const pendingDependencies =
                            Object.keys(object.dependencies).length >
                            filteredGraph.outDegree(target)
                          target.tag.pendingDependencies = pendingDependencies
                        }
                        dependencyResolve()
                      }
                    } catch (e) {
                      alert('Failed to parse JSON data')
                      reject()
                    }
                  })
                  .catch(() => {
                    reject()
                  })
              })
            )
          }
        })
        Promise.all(promises)
          .then(() => {
            resolve()
          })
          .catch(() => {
            reject()
          })
      } else {
        const url = `http://localhost:3000/npm-request?type=dependencies&package=${packageName}`
        requestData(url)
          .then(data => {
            try {
              const object = JSON.parse(JSON.stringify(data))
              if (object.error) {
                reject()
              } else {
                const promises = []
                const dependencies = object.dependencies
                if (pred.tag) {
                  pred.tag.pendingDependencies = false
                }
                Object.keys(dependencies).forEach(dependency => {
                  let node = visitedPackages.get(dependency)
                  const wrappedGraph = filteredGraph.wrappedGraph
                  if (!node) {
                    node = wrappedGraph.createNode({
                      tag: {
                        highlight: false,
                        pendingDependencies: false
                      }
                    })
                    const label = wrappedGraph.addLabel(node, dependency, nodeLabelParameter)
                    wrappedGraph.setNodeLayout(
                      node,
                      new yfiles.geometry.Rect(0, 0, label.layout.width + 50, node.layout.height)
                    )
                    node.tag.highlight = false
                    dependenciesNo++

                    addedNodes.push(node)
                    visitedPackages.set(dependency, node)
                  } else if (addedNodes.indexOf(node) < 0 && !filteredNodes.has(node)) {
                    addedNodes.push(node)
                    dependenciesNo++
                  }
                  let edge = getEdge(wrappedGraph, pred, node)
                  if (edge === null) {
                    edge = wrappedGraph.createEdge(pred, node)
                  }
                  filteredEdges.add(edge)

                  const layoutPromise = tryLayout(incremental)
                  promises.push(layoutPromise)

                  promises.push(
                    new Promise((dependencyResolve, dependencyReject) => {
                      const dependencyUrl = `http://localhost:3000/npm-request?type=dependencies&package=${dependency}`
                      requestData(dependencyUrl)
                        .then(jsonData => {
                          const jsonObject = JSON.parse(JSON.stringify(jsonData))
                          if (jsonObject.error) {
                            dependencyReject()
                          } else {
                            if (jsonObject.dependencies) {
                              const pendingDependencies =
                                Object.keys(jsonObject.dependencies).length >
                                filteredGraph.wrappedGraph.outDegree(node)
                              node.tag.pendingDependencies = pendingDependencies
                            }
                            dependencyResolve()
                          }
                        })
                        .catch(() => {
                          reject()
                        })
                    })
                  )
                })

                Promise.all(promises)
                  .then(() => {
                    resolve()
                  })
                  .catch(() => {
                    reject()
                  })
              }
            } catch (e) {
              alert('Failed to parse JSON data')
              reject()
            }
          })
          .catch(() => {
            reject()
          })
      }
    })
  }

  /**
   * Invokes a layout if there are enough new nodes in the graph and no previous layout is running.
   * @param {boolean} incremental whether or not the layout is calculated incrementally
   */
  function tryLayout(incremental) {
    // this method should return a promise so that resolve in method addDependencies is called
    // only if layout is done
    return new Promise((resolve, reject) => {
      if (!layouting && addedNodes.length > 5) {
        let i = 5
        while (i > 0) {
          const node = addedNodes.shift()
          filteredNodes.add(node)
          incrementalNodes.push(node)
          filteredGraph.nodePredicateChanged(node)
          i--
        }
        applyLayout(incremental, () => resolve())
      } else {
        resolve()
      }
    })
  }

  /**
   * Send a query for the given url that requests data about npm-packages.
   * @param {string} url The urls that is used to request data about npm-packages.
   * @return {Promise}
   */
  function requestData(url) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open('GET', url, true)

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          try {
            resolve(JSON.parse(request.responseText))
          } catch (e) {
            alert('Failed to parse JSON data')
            reject()
          }
        }

        // We reached our target server, but it returned an error
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ error: request.status })
      }

      request.onerror = () => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ error: request.status })
      }

      request.send()
    })
  }

  /**
   * Invokes the selected algorithms when another algorithm is chosen in the combo box.
   */
  function onAlgorithmChanged() {
    if (!algorithmComboBox) {
      return
    }

    // only show button to toggle transitive edges when 'Transitive Reduction' is selected
    const transitiveEdgesLabel = document.getElementById('showTransitiveEdgesLabel')
    transitiveEdgesLabel.style.display =
      algorithmComboBox.selectedIndex === 2 ? 'inline-block' : 'none'

    if (incrementalNodes) {
      incrementalNodes = []
    }

    resetGraph()
    applyAlgorithm()
    applyLayout(true, () => {
      graphComponent.graph.undoEngine.clear()
    })
  }

  /**
   * Loads the selected sample when the samples are switched in the combo box.
   */
  function onSampleGraphChanged() {
    // only show npm-toolbar when 'NPM Graph' is selected
    const npmToolbar = document.getElementById('npm-toolbar')
    npmToolbar.style.display =
      samplesComboBox.selectedIndex === SampleName.NPM_PACKAGES_SAMPLE ? 'inline' : 'none'

    // update graph information
    if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
      resetTable('yfiles/complete')
    } else {
      resetTable(packageTextBox.value)
    }

    // load the selected sample graph
    loadGraph()
  }

  /**
   * Applies the selected algorithm to the graph.
   * Algorithms are chosen using {@link algorithmComboBox}.
   */
  function applyAlgorithm() {
    const graph = filteredGraph
    if (graph.nodes.size > 0) {
      const adapter = new yfiles.layout.YGraphAdapter(graph)

      switch (algorithmComboBox.selectedIndex) {
        default:
        case AlgorithmName.ORIGINAL_GRAPH:
          break
        case AlgorithmName.TRANSITIVITY_CLOSURE: {
          const newEdges = new yfiles.algorithms.EdgeList()
          yfiles.algorithms.Transitivity.transitiveClosure(adapter.yGraph, newEdges)

          newEdges.forEach(edge => {
            const originalSource = adapter.getOriginalNode(edge.source)
            const originalTarget = adapter.getOriginalNode(edge.target)
            const newEdge = graph.createEdge(originalSource, originalTarget)
            graph.setStyle(newEdge, addedEdgeStyle)

            addedEdges.push(newEdge)
            if (filteredEdges) {
              filteredEdges.add(newEdge)
              filteredGraph.edgePredicateChanged(newEdge)
            }
            incrementalEdges.push(newEdge)
          })
          break
        }
        case AlgorithmName.TRANSITIVITY_REDUCTION: {
          const transitiveEdges = new yfiles.algorithms.EdgeList()
          yfiles.algorithms.Transitivity.transitiveReduction(adapter.yGraph, transitiveEdges)

          if (!removedEdgesSet) {
            removedEdgesSet = new Set()
          }

          transitiveEdges.forEach(edge => {
            const originalEdge = adapter.getOriginalEdge(edge)
            if (showTransitiveEdges) {
              graph.setStyle(originalEdge, removedEdgeStyle)
              incrementalEdges.push(originalEdge)
            } else {
              removedEdgesSet.add(originalEdge)
              filteredGraph.edgePredicateChanged()
            }
          })
          break
        }
      }
    }
  }

  /**
   * Returns whether or not the given edge should be visible.
   * An edge is visible if it is not removed during transitive reduction and is contained in
   * {@link filteredEdges}.
   * @return {boolean}
   */
  function edgePredicate(edge) {
    return (
      (!removedEdgesSet || !removedEdgesSet.has(edge)) &&
      (!filteredEdges || filteredEdges.has(edge))
    )
  }

  /**
   * Returns whether or not the given node should be visible.
   * A node is visible if it is contains in {@link filteredNodes}.
   * @return {boolean}
   */
  function nodePredicate(node) {
    return !filteredNodes || filteredNodes.has(node)
  }

  /**
   * Filters the graph after selecting a different start node interactively.
   * @param {yfiles.graph.INode} clickedNode The new start node.
   * @param {function} callback A callback-function which is invoked when the graph is updated and has a new layout.
   */
  function filterGraph(clickedNode, callback) {
    resetGraph()
    incrementalNodes = []

    // initialize dependents and dependencies number
    dependentsNo = 0
    dependenciesNo = 0

    // marks the nodes of the current instance of the  graph, so that the new nodes if any to be marked as incremental
    const existingNodes = new Set(filteredGraph.nodes.toArray())
    const fullGraph = filteredGraph.wrappedGraph

    // map that holds which nodes remain in the filtered graph and which not
    if (filteredNodes) {
      filteredNodes.clear()
    } else {
      filteredNodes = new Set()
    }

    // map that holds which edge remain in the filtered graph and which not
    if (filteredEdges) {
      filteredEdges.clear()
    } else {
      filteredEdges = new Set()
    }

    if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
      startNode = clickedNode

      // take all in-edges and mark the other endpoint as a neighbor of clickedNode
      fullGraph.inEdgesAt(clickedNode).forEach(edge => {
        const oppositeNode = edge.opposite(clickedNode)
        // we have to check if the node is already taken into consideration in the calculation of dependents
        if (!filteredNodes.has(oppositeNode)) {
          filteredNodes.add(oppositeNode)
          dependentsNo++
        }
      })

      filteredNodes.add(clickedNode)
      collectConnectedNodes(clickedNode, fullGraph, true)
      collectConnectedNodes(clickedNode, fullGraph, false)

      filteredGraph.nodePredicateChanged()
      filteredGraph.edgePredicateChanged()

      // check if new nodes are inserted in the graph
      if (existingNodes) {
        fullGraph.nodes.forEach(node => {
          if (!existingNodes.has(node)) {
            incrementalNodes.push(node)
          }
        })
      }

      if (algorithmComboBox.selectedIndex !== AlgorithmName.ORIGINAL_GRAPH) {
        applyAlgorithm()
      }
      applyLayout(true, callback)
    } else {
      const packageNode = graphComponent.currentItem
      filteredNodes.add(packageNode)

      filteredGraph.inEdgesAt(packageNode).forEach(edge => {
        filteredEdges.add(edge)

        const source = edge.sourceNode
        filteredNodes.add(source)
      })

      const visited = []
      const edgeStack = filteredGraph.outEdgesAt(packageNode).toArray()
      while (edgeStack.length > 0) {
        const edge = edgeStack.pop()
        filteredEdges.add(edge)

        const target = edge.targetNode
        filteredNodes.add(target)
        if (visited.indexOf(target) < 0) {
          dependenciesNo++
          visited.push(target)
        }

        filteredGraph.outEdgesAt(target).forEach(outEdge => {
          edgeStack.push(outEdge)
        })
      }

      filteredGraph.nodePredicateChanged()
      filteredGraph.edgePredicateChanged()

      const packageText = packageNode.labels.get(0).text
      updateGraph(packageText, true, callback)
    }
  }

  /**
   * Collects and changes the visible state of the nodes/edges connected to the given node, recursively.
   * Depending on the out-parameter dependents or dependencies are collected.
   * @param {yfiles.graph.INode} initialNode The node to start collecting of nodes.
   * @param {yfiles.graph.IGraph} graph The graph.
   * @param {boolean} out whether or not to collect dependents or dependencies.
   */
  function collectConnectedNodes(initialNode, graph, out) {
    // recursively collect all children of the successors of the clicked node
    const stack = []
    stack.push(initialNode)
    while (stack.length !== 0) {
      const node = stack.pop()
      const edges = out ? graph.outEdgesAt(node) : graph.inEdgesAt(node)
      edges.forEach(edge => {
        filteredEdges.add(edge)
        const oppositeNode = edge.opposite(node)
        stack.push(oppositeNode)
        // we have to check if the node is already taken into consideration in the calculation of dependencies
        if (!filteredNodes.has(oppositeNode)) {
          filteredNodes.add(oppositeNode)
          if (out) {
            dependenciesNo++
          } else {
            dependentsNo++
          }
        }
      })
    }
  }

  /**
   * Resets the graph before applying a different algorithm.
   * Previously added edges are deleted and removed edges are reinserted.
   */
  function resetGraph() {
    if (addedEdges !== null && addedEdges.length !== 0) {
      addedEdges.forEach(edge => {
        filteredGraph.remove(edge)
      })

      addedEdges = []
    }

    removedEdgesSet = null
    filteredGraph.edgePredicateChanged()

    filteredGraph.edges.forEach(edge => {
      filteredGraph.setStyle(edge, normalEdgeStyle)
    })

    filteredGraph.nodes.forEach(node => {
      node.tag.highlight = false
    })
  }

  /**
   * Applies the layout to the current graph.
   * @param {boolean} incremental <code>true</code> if an incremental layout is desired, <code>false</code> otherwise
   * @param {function} callback a callback function that will be invoked after finishing the layout
   */
  function applyLayout(incremental, callback) {
    // if is in layout or the graph has no nodes then return.
    // it is important to check if nodes === 0, since else Exceptions can occur due to asynchronous
    // calls of this function
    if (filteredGraph.nodes.size === 0 || layouting) {
      return
    }
    setLayouting(true)

    // sort nodes by label text
    const nodes = filteredGraph.nodes.toList()
    nodes.sort((node1, node2) => {
      const label1 = node1.labels.get(0).text.toLowerCase()
      const label2 = node2.labels.get(0).text.toLowerCase()

      if (label1 < label2) {
        return -1
      } else if (label1 > label2) {
        return 1
      }
      return 0
    })

    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()

    if (incremental) {
      layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
      layoutData.incrementalHints.incrementalLayeringNodes.items = yfiles.collections.List.fromArray(
        incrementalNodes
      )
        .filter(node => filteredGraph.contains(node))
        .toList()
      layoutData.incrementalHints.incrementalSequencingItems.items = yfiles.collections.List.fromArray(
        incrementalEdges
      )
        .filter(node => filteredGraph.contains(node))
        .toList()

      prepareSmoothLayoutAnimation()

      incrementalNodes = []
      incrementalEdges = []
    } else {
      layout.layoutMode = yfiles.hierarchic.LayoutMode.FROM_SCRATCH
    }

    if (samplesComboBox.selectedIndex === SampleName.NPM_PACKAGES_SAMPLE) {
      // create alphabetic sequence constraints
      let previous = nodes.first()
      nodes.forEach(node => {
        if (previous !== node) {
          layoutData.sequenceConstraints.placeBefore(previous, node)
          previous = node
        }
      })
    }

    layout.prependStage(new yfiles.layout.PortCalculator())
    graphComponent
      .morphLayout(layout, '0.5s', layoutData)
      .then(() => {
        // update the graph information with (intermediate) results
        updateGraphInformation(startNode)

        // check where the mouse is located after layout and adjust highlight
        graphComponent.inputMode.itemHoverInputMode.updateHover()

        setLayouting(false)

        if (callback) {
          callback()
        }
      })
      .catch(() => {
        setLayouting(false)

        if (callback) {
          callback()
        }
      })
  }

  /**
   * Places newly inserted nodes at the barycenter of their neighbors to avoid that the nodes fly in
   * from the sides.
   */
  function prepareSmoothLayoutAnimation() {
    const graph = graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const straightLineEdgeRouterData = new yfiles.router.StraightLineEdgeRouterData()
    straightLineEdgeRouterData.affectedEdges.delegate = edge =>
      filteredGraph.contains(edge) &&
      (incrementalEdges.includes(edge) ||
        incrementalNodes.includes(edge.sourceNode) ||
        incrementalNodes.includes(edge.targetNode))
    const placeNodesAtBarycenterStageData = new yfiles.layout.PlaceNodesAtBarycenterStageData()
    placeNodesAtBarycenterStageData.affectedNodes.delegate = node =>
      incrementalNodes.includes(node) && filteredGraph.contains(node)
    const layoutData = new yfiles.layout.CompositeLayoutData()
    layoutData.items = [straightLineEdgeRouterData, placeNodesAtBarycenterStageData]

    const layout = new yfiles.layout.SequentialLayout()
    const edgeRouter = new yfiles.router.StraightLineEdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
    layout.appendLayout(edgeRouter)
    layout.appendLayout(new yfiles.layout.PlaceNodesAtBarycenterStage())

    graph.applyLayout(layout, layoutData)
  }

  /**
   * Changes the disabled-state of all UI elements in the toolbar.
   */
  function setUIDisabled(disabled) {
    graphComponent.inputMode.waitInputMode.waiting = disabled
    samplesComboBox.disabled = disabled
    algorithmComboBox.disabled = disabled
    document.getElementById('showTransitiveEdgesButton').disabled = disabled
    document.getElementById('loadDependenciesButton').disabled = disabled
    document.getElementById('runLayoutButton').disabled = disabled
    document.getElementById('packageTextBox').disabled = disabled
  }

  /**
   * Checks if the given click-point belongs to one of the circles representing the dependencies of the node.
   * @param {yfiles.geometry.Rect} nodeBounds the enlarged node bounds
   * @param {yfiles.geometry.Point} clickPoint the clicked point
   * @param {number} x the starting x-coordinate for defining the circle
   * @returns {boolean}
   */
  function clickIsInCircle(nodeBounds, clickPoint, x) {
    if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
      // there are no pending dependencies in yfiles-modules sample
      return false
    }

    const radius = 10
    const centerX = x + nodeBounds.x
    const centerY = nodeBounds.y + nodeBounds.height * 0.5
    return (
      Math.pow(centerX - clickPoint.x, 2) + Math.pow(centerY - clickPoint.y, 2) <=
      Math.pow(radius, 2)
    )
  }

  /**
   * Checks if the nodes of the given list have pending dependencies.
   * @param {yfiles.graph.INode} packageNode the first node to check
   * @returns {boolean}
   */
  function existPendingRelations(packageNode) {
    let pendingRelations = packageNode.tag && packageNode.tag.pendingDependencies

    // if the node itself has pending relations, we do not have to continue searching
    if (pendingRelations) {
      return true
    }

    filteredGraph.nodes.forEach(node => {
      pendingRelations |= node.tag && node.tag.pendingDependencies
    })

    return pendingRelations
  }

  /**
   * Updates the table when dependencies are loaded.
   * @param {yfiles.graph.INode} packageNode the start node
   */
  function updateGraphInformation(packageNode) {
    const table = document.getElementById('graph-information')
    table.rows[0].cells[1].innerHTML = packageNode.labels.get(0).text

    // remove the dependents row if the graph is not yfiles.module
    if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
      table.rows[1].classList.remove('row-invisible')
      table.rows[1].cells[1].innerHTML = dependentsNo
    } else {
      table.rows[1].classList.add('row-invisible')
    }

    // take packageText's dependencies and check if there exist pending dependencies
    const dependencies = dependenciesNo
    // if the graph is yfiles.modules there exist no pending dependencies
    const existPendingDependencies =
      samplesComboBox.selectedIndex === SampleName.NPM_PACKAGES_SAMPLE
        ? existPendingRelations(packageNode)
        : false
    table.rows[2].cells[1].innerHTML =
      dependencies + (existPendingDependencies ? '<sup>+</sup>' : '')

    // update number of graph nodes and edges
    table.rows[3].cells[1].innerHTML = filteredGraph.nodes.size
    table.rows[4].cells[1].innerHTML = filteredGraph.edges.size
  }

  /**
   * Resets the table when the sample graph changes.
   * @param {string} packageName the name of the start package
   */
  function resetTable(packageName) {
    const table = document.getElementById('graph-information')
    table.rows[0].cells[1].innerHTML = packageName
    table.rows[1].cells[1].innerHTML = ''
    table.rows[2].cells[1].innerHTML = ''
    table.rows[3].cells[1].innerHTML = ''
    table.rows[4].cells[1].innerHTML = ''
  }

  /**
   * Displays or hides the loading indicator.
   */
  function setLoadingIndicatorVisibility(visible) {
    const loadingIndicator = document.getElementById('loadingIndicator')
    loadingIndicator.style.display = visible ? 'block' : 'none'
  }

  /**
   * Enum definition for accessing different transitivity algorithms.
   */
  const AlgorithmName = yfiles.lang.Enum({
    ORIGINAL_GRAPH: 0,
    TRANSITIVITY_CLOSURE: 1,
    TRANSITIVITY_REDUCTION: 2
  })

  /**
   * Enum definition for accessing different samples.
   */
  const SampleName = yfiles.lang.Enum({
    YFILES_MODULES_SAMPLE: 0,
    NPM_PACKAGES_SAMPLE: 1
  })

  /**
   * Begins an undo edit to encapsulate several changes in one undo/redo steps.
   * @param {string} undoName The undo name.
   * @param {string} redoName The redo name.
   * @return {{compoundEdit: yfiles.graph.ICompoundEdit, tagEdit: yfiles.graph.ICompoundEdit}}
   * @see {@link commitUndoEdit}
   * @see {@link cancelUndoEdit}
   */
  function beginUndoEdit(undoName, redoName) {
    const compoundEdit = graphComponent.graph.beginEdit(undoName, redoName)
    const tagEdit = graphComponent.graph.beginEdit(
      'undoTags',
      'redoTags',
      filteredGraph.wrappedGraph.nodes,
      node => new TagMementoSupport()
    )

    return {
      compoundEdit,
      tagEdit
    }
  }

  /**
   * Commits all undo edits contained in the given edit.
   * @param {{compoundEdit: yfiles.graph.ICompoundEdit, tagEdit: yfiles.graph.ICompoundEdit}} edit The edit to commit.
   */
  function commitUndoEdit(edit) {
    edit.tagEdit.commit()
    edit.compoundEdit.commit()
  }

  /**
   * Cancels all undo edits contained in the given edit.
   * @param {{compoundEdit: yfiles.graph.ICompoundEdit, tagEdit: yfiles.graph.ICompoundEdit}} edit The edit to cancel.
   */
  function cancelUndoEdit(edit) {
    edit.tagEdit.cancel()
    edit.compoundEdit.cancel()
  }

  /**
   * An undo unit that handles the undo/redo of the currentItem and all sets that determine whether or not a node or
   * edge is currently visible (part of the filtered graph).
   */
  class ChangedSetUndoUnit extends yfiles.graph.UndoUnitBase {
    constructor() {
      super('changedSet', 'changedSet')
      this.oldFilteredNodes = filteredNodes ? new Set(filteredNodes) : null
      this.oldFilteredEdges = filteredEdges ? new Set(filteredEdges) : null
      this.oldRemovedEdges = removedEdgesSet ? new Set(removedEdgesSet) : null
      this.oldCurrentItem = graphComponent.currentItem
    }

    undo() {
      this.newFilteredNodes = filteredNodes ? new Set(filteredNodes) : null
      this.newFilteredEdges = filteredEdges ? new Set(filteredEdges) : null
      this.newRemovedEdges = removedEdgesSet ? new Set(removedEdgesSet) : null
      this.newCurrentItem = graphComponent.currentItem
      filteredNodes = this.oldFilteredNodes
      filteredEdges = this.oldFilteredEdges
      removedEdgesSet = this.oldRemovedEdges
      graphComponent.currentItem = this.oldCurrentItem
      filteredGraph.nodePredicateChanged()
      filteredGraph.edgePredicateChanged()
    }

    redo() {
      filteredNodes = this.newFilteredNodes
      filteredEdges = this.newFilteredEdges
      removedEdgesSet = this.newRemovedEdges
      graphComponent.currentItem = this.newCurrentItem
      filteredGraph.nodePredicateChanged()
      filteredGraph.edgePredicateChanged()
    }

    static update(currentSet, array) {
      currentSet.clear()
      array.forEach(item => {
        currentSet.add(item)
      })
    }
  }

  /**
   * A MementoSupport that will handle the state of the node tags (especially pending dependencies)
   * during undo/redo.
   */
  class TagMementoSupport extends yfiles.lang.Class(yfiles.graph.IMementoSupport) {
    getState(item) {
      if (yfiles.graph.INode.isInstance(item)) {
        const tag = item.tag
        return {
          highlight: tag.highlight,
          pendingDependencies: tag.pendingDependencies
        }
      }
      return null
    }

    applyState(item, state) {
      if (yfiles.graph.INode.isInstance(item)) {
        item.tag = state
      }
    }

    stateEquals(state1, state2) {
      return (
        state1.highlight === state2.highlight &&
        state1.pendingDependencies === state2.pendingDependencies
      )
    }
  }

  // run the demo
  run()
})
