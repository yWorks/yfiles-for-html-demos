/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  'yfiles/view-component',
  'resources/demo-app',
  'resources/OrgChartData.js',
  'OrgChartPropertiesView.js',
  'OrgChartPrintingSupport.js',
  'LevelOfDetailNodeStyle.js',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-tree',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  orgChartData,
  OrgChartPropertiesView,
  OrgChartPrintingSupport,
  LevelOfDetailNodeStyle
) => {
  /**
   * The main graphComponent.
   * @type yfiles.view.GraphComponent
   **/
  let graphComponent = null

  /**
   * The overview graph shown alongside the GraphComponent.
   * @type {yfiles.view.GraphOverviewComponent}
   **/
  let overviewComponent = null

  /**
   * The properties view displayed in the side-bar.
   * @type {OrgChartPropertiesView}
   */
  let propertiesView = null

  /**
   * Used by the predicate function to determine which nodes should not be shown.
   * @type {Set}
   */
  const hiddenNodesSet = new Set()

  /**
   * Responsible for all filtering operations of the graph.
   * @type {yfiles.graph.FilteredGraphWrapper}
   */
  let filteredGraphWrapper = null

  /**
   * Set to true when a layout is in progress.
   * @type {boolean}
   */
  let doingLayout = false

  /**
   * The highlight manager for the search results.
   * @type {yfiles.view.HighlightIndicatorManager}
   */
  let searchHighlightManager = null

  /** @type {Array} */
  let matchingNodes = []

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    registerElementDefaults(graphComponent.graph)

    graphComponent.focusIndicatorManager.showFocusPolicy = yfiles.view.ShowFocusPolicy.ALWAYS
    graphComponent.selectionIndicatorManager.enabled = false
    graphComponent.focusIndicatorManager.enabled = false

    overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent')
    overviewComponent.graphComponent = graphComponent

    initializeInputMode()

    // we use a custom highlight manager for the search results ...
    searchHighlightManager = new SearchHighlightIndicatorInstaller(graphComponent)
    // ... and hide the default implementation in favor of the CSS highlighting from the template styles
    graphComponent.graph.decorator.nodeDecorator.highlightDecorator.hideImplementation()

    createAdditionalComponents()

    graphComponent.addCurrentItemChangedListener((sender, args) => {
      propertiesView.showProperties(graphComponent.currentItem)
    })

    registerCommands()
    initConverters()

    // Once the nodes have been arrange, remember their arrangement strategy for a more stable layout upon changes.
    graphComponent.graph.mapperRegistry.createMapper(
      yfiles.tree.CompactNodePlacer.STRATEGY_MEMENTO_DP_KEY
    )

    createGraph(orgChartData).then(() => {
      app.show(graphComponent, overviewComponent)
    })
  }

  function createAdditionalComponents() {
    // Create the properties view that populates the "propertiesView" element with
    // the properties of the selected employee.
    const propertiesViewElement = document.getElementById('propertiesView')
    propertiesView = new OrgChartPropertiesView(propertiesViewElement, selectAndZoomToNodeWithEmail)
  }

  /**
   * Registers the JavaScript commands for the GUI elements, typically the
   * tool bar buttons, during the creation of this application.
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
    app.bindAction("button[data-command='ZoomOriginal']", () => {
      yfiles.input.ICommand.ZOOM.execute(1.0, graphComponent)
    })

    const kim = graphComponent.inputMode.keyboardInputMode
    const hideChildrenCommand = iCommand.createCommand()
    kim.addCommandBinding(hideChildrenCommand, executeHideChildren, canExecuteHideChildren)
    const showChildrenCommand = iCommand.createCommand()
    kim.addCommandBinding(showChildrenCommand, executeShowChildren, canExecuteShowChildren)
    const hideParentCommand = iCommand.createCommand()
    kim.addCommandBinding(hideParentCommand, executeHideParent, canExecuteHideParent)
    const showParentCommand = iCommand.createCommand()
    kim.addCommandBinding(showParentCommand, executeShowParent, canExecuteShowParent)
    const showAllCommand = iCommand.createCommand()
    kim.addCommandBinding(showAllCommand, executeShowAll, canExecuteShowAll)

    app.bindCommand("button[data-command='ShowParent']", showParentCommand, graphComponent, null)
    app.bindCommand("button[data-command='HideParent']", hideParentCommand, graphComponent, null)
    app.bindCommand(
      "button[data-command='ShowChildren']",
      showChildrenCommand,
      graphComponent,
      null
    )
    app.bindCommand(
      "button[data-command='HideChildren']",
      hideChildrenCommand,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ShowAll']", showAllCommand, graphComponent, null)

    kim.addKeyBinding(yfiles.view.Key.SUBTRACT, yfiles.view.ModifierKeys.NONE, hideChildrenCommand)
    kim.addKeyBinding(yfiles.view.Key.ADD, yfiles.view.ModifierKeys.NONE, showChildrenCommand)
    kim.addKeyBinding(yfiles.view.Key.PAGE_DOWN, yfiles.view.ModifierKeys.NONE, hideParentCommand)
    kim.addKeyBinding(yfiles.view.Key.PAGE_UP, yfiles.view.ModifierKeys.NONE, showParentCommand)
    kim.addKeyBinding(yfiles.view.Key.MULTIPLY, yfiles.view.ModifierKeys.NONE, showAllCommand)

    app.bindAction("button[data-command='Print']", print)

    const searchBox = document.getElementById('searchBox')
    searchBox.addEventListener('input', e => {
      updateSearch(e.target.value)
    })

    searchBox.addEventListener('keypress', e => {
      const key = e.which || e.keyCode
      if (key === 13) {
        if (matchingNodes.length > 0) {
          // determine the rectangle which contains the matching nodes
          let minX = Number.POSITIVE_INFINITY
          let maxX = Number.NEGATIVE_INFINITY
          let minY = Number.POSITIVE_INFINITY
          let maxY = Number.NEGATIVE_INFINITY

          matchingNodes.forEach(node => {
            const nodeLayout = node.layout
            minX = Math.min(minX, nodeLayout.x)
            maxX = Math.max(maxX, nodeLayout.x + nodeLayout.width)
            minY = Math.min(minY, nodeLayout.y)
            maxY = Math.max(maxY, nodeLayout.y + nodeLayout.height)
          })
          if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
            let rect = new yfiles.geometry.Rect(minX, minY, maxX - minX, maxY - minY)
            // enlarge it with some insets
            rect = rect.getEnlarged(new yfiles.geometry.Insets(20))
            // calculate the maximum possible zoom
            const componentWidth = graphComponent.size.width
            const componentHeight = graphComponent.size.height
            const maxPossibleZoom = Math.min(
              componentWidth / rect.width,
              componentHeight / rect.height
            )
            // zoom to this rectangle with maximum zoom 1.5
            const zoom = Math.min(maxPossibleZoom, 1.5)
            graphComponent.zoomToAnimated(
              new yfiles.geometry.Point(rect.centerX, rect.centerY),
              zoom
            )
          }
        } else {
          graphComponent.fitGraphBounds()
        }
      }
    })
  }

  /**
   * Initializes the converters for the node style.
   */
  function initConverters() {
    // this object stores the converters that are used for template bindings
    // to svg template attributes.
    // Add an abbreviation for the binding object to the global namespace.
    // This abbreviation is used in the node styles to access the bindingConverters object,
    // and ultimately, to get the converters. Of course, it's possible to use fully-qualified
    // names, too.
    const store = {}
    yfiles.styles.TemplateNodeStyle.CONVERTERS.orgchartconverters = store
    // converter function for node border
    store.borderconverter = (value, parameter) => {
      if (typeof value === 'boolean') {
        return value ? '#FFBB33' : 'rgba(0,0,0,0)'
      }
      return '#FFF'
    }
    // converter function that converts a name to an abbreviated name
    store.overviewconverter = (value, parameter) => {
      if (typeof value === 'string' && value.length > 0) {
        return value.replace(/^(.)(\S*)(.*)/, '$1.$3')
      }
      return ''
    }
    // converter function that may convert a name to an abbreviated name
    store.intermediateconverter = (value, parameter) => {
      if (typeof value === 'string' && value.length > 17) {
        return value.replace(/^(.)(\S*)(.*)/, '$1.$3')
      }
      return value
    }
    store.linebreakconverter = (value, firstline) => {
      if (typeof value === 'string') {
        let copy = value
        while (copy.length > 20 && copy.indexOf(' ') > -1) {
          copy = copy.substring(0, copy.lastIndexOf(' '))
        }
        if (firstline === 'true') {
          return copy
        }
        return value.substring(copy.length)
      }
      return ''
    }
    // converter function that adds a hash to a given string and - if present - appends the parameter to it
    store.addhashconverter = (value, parameter) => {
      if (typeof value === 'string') {
        if (typeof parameter === 'string') {
          return `#${value}${parameter}`
        }
        return `#${value}`
      }
      return value
    }
  }

  function initializeInputMode() {
    const graphViewerInputMode = new yfiles.input.GraphViewerInputMode({
      clickableItems: yfiles.graph.GraphItemTypes.NODE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      marqueeSelectableItems: yfiles.graph.GraphItemTypes.NONE,
      toolTipItems: yfiles.graph.GraphItemTypes.NONE,
      contextMenuItems: yfiles.graph.GraphItemTypes.NONE,
      focusableItems: yfiles.graph.GraphItemTypes.NODE
    })
    graphViewerInputMode.addItemDoubleClickedListener(onItemDoubleClicked)
    graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener(onHoveredItemChanged)
    graphViewerInputMode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.NODE
    graphComponent.inputMode = graphViewerInputMode
  }

  /**
   *
   * @param {object} sender
   * @param {yfiles.input.HoveredItemChangedEventArgs} args
   */
  function onHoveredItemChanged(sender, args) {
    // we use the highlight manager to highlight hovered items
    const manager = graphComponent.highlightIndicatorManager
    if (args.oldItem) {
      manager.removeHighlight(args.oldItem)
    }
    if (args.item) {
      manager.addHighlight(args.item)
    }
  }

  /**
   * @param {object} sender
   * @param {yfiles.input.ItemClickedEventArgs.<IModelItem>} args
   */
  function onItemDoubleClicked(sender, args) {
    zoomToCurrentItem()
  }

  /**
   * Sets style defaults for nodes and edges.
   * @param {yfiles.graph.IGraph} graph
   */
  function registerElementDefaults(graph) {
    graph.nodeDefaults.style = new LevelOfDetailNodeStyle(
      new yfiles.styles.TemplateNodeStyle('detailNodeStyleTemplate'),
      new yfiles.styles.TemplateNodeStyle('intermediateNodeStyleTemplate'),
      new yfiles.styles.TemplateNodeStyle('overviewNodeStyleTemplate')
    )
    graph.nodeDefaults.size = new yfiles.geometry.Size(285, 100)
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px rgb(170, 170, 170)',
      targetArrow: yfiles.styles.IArrow.NONE
    })
  }

  /**
   * Focuses the given node in the center to indicate errors for example.
   * @param {yfiles.graph.INode} node
   */
  function selectAndZoomToNode(node) {
    graphComponent.currentItem = node
    zoomToCurrentItem()
    graphComponent.focus()
  }

  /**
   * Returns the node representing the employee with the specified E-Mail address.
   * @return {yfiles.graph.INode}
   */
  function getNodeForEMail(email) {
    if (email === null) {
      return null
    }

    return filteredGraphWrapper.wrappedGraph.nodes.first(
      node => node.tag !== null && email === node.tag.email
    )
  }

  /**
   * Selects and zooms to the node representing the employee with the specified E-Mail address.
   * @return {yfiles.graph.INode}
   */
  function selectAndZoomToNodeWithEmail(email) {
    const nodeForEMail = getNodeForEMail(email)
    if (nodeForEMail !== null) {
      selectAndZoomToNode(nodeForEMail)
    }
  }

  /**
   * Adds a "parent" reference to all subordinates contained in the source data.
   * The parent reference is needed to create the colleague and parent links
   * in the properties view.
   * @param {Object} nodesSourceItem The source data in JSON format
   */
  function addParentReferences(nodesSourceItem) {
    const subs = nodesSourceItem.subordinates
    if (subs !== undefined) {
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i]
        sub.parent = nodesSourceItem
        addParentReferences(sub)
      }
    }
  }

  /**
   * Create the graph using a TreeSource.
   * @param {Object} nodesSource The source data in JSON format
   * @return {Promise} Resolved when the graph is created and the layout has finished.
   */
  function createGraph(nodesSource) {
    addParentReferences(nodesSource[0])

    const treeBuilder = new yfiles.binding.TreeBuilder(graphComponent.graph)
    treeBuilder.childBinding = 'subordinates'
    treeBuilder.nodesSource = nodesSource

    registerElementDefaults(treeBuilder.graph)

    filteredGraphWrapper = new yfiles.graph.FilteredGraphWrapper(
      treeBuilder.buildGraph(),
      shouldShowNode,
      e => true
    )
    graphComponent.graph = filteredGraphWrapper

    return graphComponent.morphLayout(createConfiguredLayout(false), '1s').then(() => {
      graphComponent.fitGraphBounds()
      limitViewport()
      cleanUp()
    })
  }

  /**
   * Setup a ViewportLimiter that makes sure that the explorable region
   * doesn't exceed the graph size.
   */
  function limitViewport() {
    graphComponent.updateContentRect(new yfiles.geometry.Insets(100))
    const limiter = graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = graphComponent.contentRect
  }

  /**
   * The predicate used for the FilterGraphWrapper.
   * @param {yfiles.graph.INode} node
   * @return {boolean}
   */
  function shouldShowNode(node) {
    return !hiddenNodesSet.has(node)
  }

  /**
   * Configures the tree layout to handle assistant nodes and stack leaf nodes.
   * @param {boolean} incremental
   * @param {yfiles.graph.INode[]} incrementalNodes
   * @return {yfiles.tree.TreeLayout} A configured TreeLayout.
   */
  function createConfiguredLayout(incremental, incrementalNodes = []) {
    const graph = graphComponent.graph
    const registry = graph.mapperRegistry
    const assistantMapper = registry.createMapper(
      yfiles.tree.AssistantNodePlacer.ASSISTANT_NODE_DP_KEY
    )

    const treeLayout = new yfiles.tree.TreeLayout()
    if (incremental) {
      treeLayout.defaultOutEdgeComparer = new yfiles.collections.IComparer({
        compare(edge1, edge2) {
          const y1 = edge1.graph.getCenterY(edge1.target)
          const y2 = edge2.graph.getCenterY(edge2.target)
          if (y1 === y2) {
            const x1 = edge1.graph.getCenterX(edge1.target)
            const x2 = edge2.graph.getCenterX(edge2.target)
            if (x1 === x2) {
              return 0
            }
            return x1 < x2 ? -1 : 1
          }
          return y1 < y2 ? -1 : 1
        }
      })
    }

    const hasIncrementalParent = node => {
      return (
        graph.inDegree(node) > 0 &&
        incrementalNodes.indexOf(graph.predecessors(node).first()) !== -1
      )
    }

    // we let the CompactNodePlacer arrange the nodes
    treeLayout.defaultNodePlacer = new yfiles.tree.CompactNodePlacer()
    // we still want assistant nodes to be placed specifically
    graph.nodes
      .filter(
        node =>
          node.tag && node.tag.assistant && graph.inDegree(node) > 0 && !hasIncrementalParent(node)
      )
      .forEach(assistant => {
        assistantMapper.set(assistant, true)
      })

    // layout stages used to place nodes at barycenter for smoother layout animations
    const edgeRouter = new yfiles.router.StraightLineEdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES
    treeLayout.appendStage(edgeRouter)
    treeLayout.appendStage(new yfiles.layout.PlaceNodesAtBarycenterStage())

    return treeLayout
  }

  /**
   * Deregisters mappers which provided additional information for the layout algorithm.
   */
  function cleanUp() {
    const registry = graphComponent.graph.mapperRegistry
    registry.removeMapper(yfiles.tree.AssistantNodePlacer.ASSISTANT_NODE_DP_KEY)
    registry.removeMapper(yfiles.tree.TreeLayout.NODE_PLACER_DP_KEY)
  }

  /**
   * Creates an array containing all nodes the subtree rooted by the given node.
   * @param {yfiles.graph.IGraph} graph
   * @param {yfiles.graph.INode} root
   * @return {yfiles.graph.INode[]}
   */
  function collectSubtreeNodes(graph, root) {
    const nodes = []
    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop()
      nodes.push(node)
      graph.outEdgesAt(node).forEach(outEdge => {
        stack.unshift(outEdge.targetNode)
      })
    }
    return nodes
  }

  /**
   * Creates an array of all nodes except of the nodes in the subtree rooted in the excluded sub-root.
   * @param {yfiles.graph.IGraph} graph
   * @param {yfiles.graph.INode} excludedRoot
   * @return {yfiles.graph.INode[]}
   */
  function collectAllNodesExceptSubtree(graph, excludedRoot) {
    const nodes = []
    let root = excludedRoot
    while (graph.inDegree(root) > 0) {
      root = graph.inEdgesAt(root).first().sourceNode
    }

    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop()
      if (node !== excludedRoot) {
        nodes.push(node)
        graph.outEdgesAt(node).forEach(outEdge => {
          stack.unshift(outEdge.targetNode)
        })
      }
    }

    return nodes
  }

  /**
   *  The command handler to hide the child nodes.
   */
  function executeHideChildren() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout) {
      const nodes = collectSubtreeNodes(filteredGraphWrapper.wrappedGraph, item)
      const incrementalNodes = nodes.filter(node => !node.equals(item))
      refreshLayout(item, incrementalNodes, true).then(() => {
        incrementalNodes.forEach(node => {
          hiddenNodesSet.add(node)
        })
        filteredGraphWrapper.nodePredicateChanged()
      })
    }
  }

  /**
   * The command handler to determine if the child nodes can be hidden.
   * @returns {boolean}
   */
  function canExecuteHideChildren() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout && filteredGraphWrapper !== null) {
      return filteredGraphWrapper.outDegree(item) > 0
    }
    return false
  }

  /**
   * The command handler to show the child nodes.
   */
  function executeShowChildren() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout) {
      const nodes = collectSubtreeNodes(filteredGraphWrapper.wrappedGraph, item)
      const incrementalNodes = nodes.filter(node => !node.equals(item))
      filteredGraphWrapper.wrappedGraph.outEdgesAt(item).forEach(childEdge => {
        const child = childEdge.targetNode
        hiddenNodesSet.delete(child)
      })
      refreshLayout(item, incrementalNodes, false)
    }
  }

  /**
   * The command handler to determine if the child nodes can be shown.
   * @returns {boolean}
   */
  function canExecuteShowChildren() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout && filteredGraphWrapper !== null) {
      return (
        filteredGraphWrapper.outDegree(item) !== filteredGraphWrapper.wrappedGraph.outDegree(item)
      )
    }
    return false
  }

  /**
   * The command handler to show the parent node.
   */
  function executeShowParent() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout) {
      const incrementalNodes = []
      filteredGraphWrapper.wrappedGraph.inEdgesAt(item).forEach(parentEdge => {
        const parent = parentEdge.sourceNode
        hiddenNodesSet.delete(parent)
        incrementalNodes.push(parent)
      })
      refreshLayout(item, incrementalNodes, false)
    }
  }

  /**
   * The command handler to determine if the parent node can be shown.
   * @returns {boolean}
   */
  function canExecuteShowParent() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout && filteredGraphWrapper !== null) {
      return (
        filteredGraphWrapper.inDegree(item) === 0 &&
        filteredGraphWrapper.wrappedGraph.inDegree(item) > 0
      )
    }
    return false
  }

  /**
   * The command handler to hide the parent node.
   */
  function executeHideParent() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout) {
      const nodes = collectAllNodesExceptSubtree(filteredGraphWrapper.wrappedGraph, item)

      refreshLayout(item, nodes, true).then(() => {
        nodes.forEach(node => {
          hiddenNodesSet.add(node)
        })
        filteredGraphWrapper.nodePredicateChanged()
      })
    }
  }

  /**
   * The command handler to determine if the parent node can be hidden.
   * @returns {boolean}
   */
  function canExecuteHideParent() {
    const item = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(item) && !doingLayout && filteredGraphWrapper !== null) {
      return filteredGraphWrapper.inDegree(item) > 0
    }
    return false
  }

  /**
   * The command handler to show all nodes.
   */
  function executeShowAll() {
    if (!doingLayout) {
      const incrementalNodes = Array.from(hiddenNodesSet)
      hiddenNodesSet.clear()
      refreshLayout(graphComponent.currentItem, incrementalNodes, false)
    }
  }

  /**
   * The command handler to determine if all nodes can be shown.
   * @returns {boolean}
   */
  function canExecuteShowAll() {
    return filteredGraphWrapper !== null && hiddenNodesSet.size !== 0 && !doingLayout
  }

  /**
   * Refreshes the node after modifications on the tree.
   * @param {yfiles.graph.INode} centerNode
   * @param {yfiles.graph.INode[]} incrementalNodes
   * @param {boolean} collapse
   * @param {boolean} centerNode
   * @return {Promise} a promise which is resolved when the layout has been executed.
   */
  function refreshLayout(centerNode, incrementalNodes, collapse) {
    if (doingLayout) {
      return Promise.resolve()
    }
    doingLayout = true

    // tell our filter to refresh the graph
    filteredGraphWrapper.nodePredicateChanged()
    // the commands CanExecute state might have changed - suggest a requery.
    yfiles.input.ICommand.invalidateRequerySuggested()

    if (!collapse) {
      // move the incremental nodes between their neighbors before expanding for a smooth animation
      prepareSmoothExpandLayoutAnimation(incrementalNodes)
    }

    // configure the tree layout
    const treeLayout = createConfiguredLayout(true, collapse ? incrementalNodes : [])

    // create the layout (with a stage that fixes the center node in the coordinate system)
    const layout = new yfiles.layout.FixNodeLayoutStage(treeLayout)

    const layoutData = new yfiles.layout.CompositeLayoutData()
    // we mark a node as the center node
    const fixNodeLayoutData = new yfiles.layout.FixNodeLayoutData()
    fixNodeLayoutData.fixedNode.item = centerNode
    layoutData.items.add(fixNodeLayoutData)
    if (collapse) {
      // configure StraightLineEdgeRouter and PlaceNodesAtBarycenterStage for a smooth animation
      const placeNodesAtBarycenterStageData = new yfiles.layout.PlaceNodesAtBarycenterStageData()
      placeNodesAtBarycenterStageData.affectedNodes.delegate = node =>
        incrementalNodes.indexOf(node) >= 0
      layoutData.items.add(placeNodesAtBarycenterStageData)
      const straightLineEdgeRouterData = new yfiles.router.StraightLineEdgeRouterData()
      straightLineEdgeRouterData.affectedNodes.delegate = node =>
        incrementalNodes.indexOf(node) >= 0
      layoutData.items.add(straightLineEdgeRouterData)
    }

    // configure a LayoutExecutor
    const executor = new yfiles.layout.LayoutExecutor(graphComponent, layout)
    executor.layoutData = layoutData
    executor.animateViewport = centerNode === null
    executor.easedAnimation = true
    executor.duration = '0.5s'
    return executor
      .start()
      .then(() => {
        cleanUp()
        doingLayout = false
        limitViewport()
        yfiles.input.ICommand.invalidateRequerySuggested()
      })
      .catch(error => {
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   * @param {yfiles.collections.Map} incrementalNodes
   */
  function prepareSmoothExpandLayoutAnimation(incrementalNodes) {
    const graph = graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const straightLineEdgeRouterData = new yfiles.router.StraightLineEdgeRouterData()
    straightLineEdgeRouterData.affectedNodes.delegate = node => incrementalNodes.indexOf(node) >= 0
    const placeNodesAtBarycenterStageData = new yfiles.layout.PlaceNodesAtBarycenterStageData()
    placeNodesAtBarycenterStageData.affectedNodes.delegate = node =>
      incrementalNodes.indexOf(node) >= 0
    const layoutData = new yfiles.layout.CompositeLayoutData()
    layoutData.items = [straightLineEdgeRouterData, placeNodesAtBarycenterStageData]

    const layout = new yfiles.layout.SequentialLayout()
    const edgeRouter = new yfiles.router.StraightLineEdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES
    layout.appendLayout(edgeRouter)
    layout.appendLayout(new yfiles.layout.PlaceNodesAtBarycenterStage())

    graph.applyLayout(layout, layoutData)
  }

  function zoomToCurrentItem() {
    const currentItem = graphComponent.currentItem

    if (yfiles.graph.INode.isInstance(currentItem)) {
      // visible current item
      if (graphComponent.graph.contains(currentItem)) {
        yfiles.input.ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, graphComponent)
      } else if (filteredGraphWrapper.wrappedGraph.nodes.includes(currentItem)) {
        const nodes = collectAllNodesExceptSubtree(filteredGraphWrapper.wrappedGraph, currentItem)

        // see if it can be made visible
        // unhide all nodes...
        hiddenNodesSet.clear()

        refreshLayout(null, nodes, false).then(() => {})
        // except the node to be displayed and all its descendants
        nodes.forEach(node => {
          hiddenNodesSet.add(node)
        })
        filteredGraphWrapper.nodePredicateChanged()
      }
    }
  }

  /**
   * Prints the graph, separated in tiles.
   */
  function print() {
    const printingSupport = new OrgChartPrintingSupport()
    printingSupport.tiledPrinting = true
    printingSupport.scale = 0.29
    printingSupport.margin = 1
    printingSupport.tileWidth = 842
    printingSupport.tileHeight = 595
    printingSupport.print(graphComponent, null)
  }

  /**
   * Updates the search results by using the given string.
   * @param {string} searchText
   */
  function updateSearch(searchText) {
    const searchBox = document.getElementById('searchBox')
    searchBox.value = searchText

    // we use the search highlight manager to highlight matching items
    const manager = searchHighlightManager

    // first remove previous highlights
    manager.clearHighlights()
    matchingNodes = []
    if (searchText.trim() !== '') {
      graphComponent.graph.nodes.forEach(node => {
        if (matches(node, searchText)) {
          manager.addHighlight(node)
          matchingNodes.push(node)
        }
      })
    }
  }

  /**
   * Returns whether the given node is a match when searching for the given text.
   * @param {yfiles.graph.INode} node
   * @param {string} text
   * @return {boolean}
   */
  function matches(node, text) {
    const lowercaseText = text.toLowerCase()
    // the icon property does not have to be matched
    if (
      node.tag &&
      Object.getOwnPropertyNames(node.tag).some(
        prop =>
          prop !== 'icon' &&
          node.tag[prop] &&
          node.tag[prop]
            .toString()
            .toLowerCase()
            .indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    if (node.labels.some(label => label.text.toLowerCase().indexOf(lowercaseText) !== -1)) {
      return true
    }
    return false
  }

  /**
   * A highlight manager for the search results which decorates the search result items with a
   * red colored border.
   * @class SearchHighlightIndicatorInstaller
   * @extends {yfiles.view.HighlightIndicatorManager.<T>}
   */
  class SearchHighlightIndicatorInstaller extends yfiles.view.HighlightIndicatorManager {
    /**
     * Creates a new highlight manager.
     * @constructs
     * @param {yfiles.view.CanvasComponent} canvas The canvas to add the selection marks to.
     */
    constructor(canvas) {
      super(canvas)

      const highlightColor = yfiles.view.Color.TOMATO
      this.decorationInstaller = new yfiles.view.NodeStyleDecorationInstaller({
        nodeStyle: new yfiles.styles.ShapeNodeStyle({
          stroke: new yfiles.view.Stroke(
            highlightColor.r,
            highlightColor.g,
            highlightColor.b,
            220,
            3
          ),
          fill: null
        }),
        margins: 3,
        zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.MIXED
      })
    }

    /**
     * Returns the installer that will be used to decorate the search result items.
     * @param {T} item - The item to find an installer for.
     * @returns {yfiles.view.ICanvasObjectInstaller}
     */
    getInstaller(item) {
      return this.decorationInstaller
    }
  }

  run()
})
