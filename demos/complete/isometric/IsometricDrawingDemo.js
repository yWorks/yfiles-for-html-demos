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
  'IsometricTransformationSupport.js',
  'IsometricTransformationStage.js',
  'IsometricStyles.js',
  'resources/IsometricData.js',
  'FixGroupStateIconStage.js',
  'resources/demo-styles',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'yfiles/layout-orthogonal',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  IsometricTransformationSupport,
  IsometricTransformationStage,
  IsometricStyles,
  IsometricData,
  FixGroupStateIconStage,
  DemoStyles
) => {
  let graphComponent = null

  /**
   * The currently selected layout type determines whether {@link yfiles.hierarchic.HierarchicLayout} or
   * {@link yfiles.orthogonal.OrthogonalLayout} is applied to the graph.
   * @type {'hierarchic'|'orthogonal'}
   */
  let layoutType = 'hierarchic'

  /**
   * A flag that signals whether or not a layout is currently running to prevent re-entrant layout calculations.
   * @type {boolean}
   */
  let layoutRunning = false

  /**
   * Starts the demo which displays graphs in an isometric fashion to create an impression of a 3-dimensional view.
   */
  function run() {
    // initialize graph component
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    graphComponent.minimumZoom = 0.05
    graphComponent.maximumZoom = 4.0

    // enable/configure folding
    const manager = new yfiles.graph.FoldingManager(graphComponent.graph)
    manager.folderNodeConverter.copyFirstLabel = true
    manager.folderNodeConverter.cloneNodeStyle = true
    manager.folderNodeConverter.folderNodeSize = new yfiles.geometry.Size(210, 120)
    manager.folderNodeConverter.folderNodeStyle = new IsometricStyles.GroupNodeStyle()
    manager.foldingEdgeConverter.copyFirstLabel = true
    graphComponent.graph = manager.createFoldingView().graph

    // initialize interaction
    graphComponent.inputMode = new yfiles.input.GraphViewerInputMode()
    graphComponent.inputMode.selectableItems = yfiles.graph.GraphItemTypes.NONE
    graphComponent.inputMode.focusableItems = yfiles.graph.GraphItemTypes.NONE
    graphComponent.inputMode.navigationInputMode.allowCollapseGroup = true
    graphComponent.inputMode.navigationInputMode.allowExpandGroup = true
    graphComponent.inputMode.navigationInputMode.fitContentAfterGroupActions = false
    graphComponent.inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy =
      yfiles.input.NodeAlignmentPolicy.BOTTOM_LEFT

    // add hierarchy change listeners to invoke an incremental layout when collapsing/expanding a group
    const geometries = new yfiles.collections.Map()
    let fixPoint
    graphComponent.inputMode.navigationInputMode.addGroupCollapsingListener((source, args) => {
      const group = args.item
      fixPoint = calculateFixPoint(group)
    })
    graphComponent.inputMode.navigationInputMode.addGroupCollapsedListener((source, args) => {
      const group = args.item
      geometries.set(group, group.tag.geometry)
      group.tag.geometry = {
        width: 155,
        height: 0,
        depth: 90,
        horizontal: true
      }
      restoreFixPoint(group, fixPoint)
      runLayout(group)
    })
    graphComponent.inputMode.navigationInputMode.addGroupExpandingListener((source, args) => {
      const group = args.item
      fixPoint = calculateFixPoint(group)
    })
    graphComponent.inputMode.navigationInputMode.addGroupExpandedListener((source, args) => {
      const group = args.item
      if (geometries.get(group)) {
        group.tag.geometry = geometries.get(group)
      }
      restoreFixPoint(group, fixPoint)
      runLayout(group)
    })

    // load sample graph
    loadGraph()

    // bind commands to toolbar buttons
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Calculates the current location of the front corner of the given node in view space.
   * @param {yfiles.graph.INode} node The node that should be fixed
   * @return {yfiles.geometry.Point}
   */
  function calculateFixPoint(node) {
    const corners = IsometricTransformationSupport.calculateCorners(node.tag.geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

    return new yfiles.geometry.Point(
      corners[IsometricTransformationSupport.C3_X],
      corners[IsometricTransformationSupport.C3_Y]
    )
  }

  /**
   * Moves the node with its front corner of the given node in view space to the fix point.
   * @param {yfiles.graph.INode} node The node that should be fixed
   * @param {yfiles.geometry.Point} fixPoint the coordinates of the fixed point
   */
  function restoreFixPoint(node, fixPoint) {
    const graph = graphComponent.graph
    const corners = IsometricTransformationSupport.calculateCorners(node.tag.geometry)
    IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

    const newCornerX = corners[IsometricTransformationSupport.C3_X]
    const newCornerY = corners[IsometricTransformationSupport.C3_Y]

    const dx = fixPoint.x - newCornerX
    const dy = fixPoint.y - newCornerY

    if (graph.isGroupNode(node)) {
      graph.getChildren(node).forEach(child => {
        graph.setNodeCenter(
          child,
          new yfiles.geometry.Point(child.layout.center.x + dx, child.layout.center.y + dy)
        )
      })
    }
    graph.setNodeCenter(
      node,
      new yfiles.geometry.Point(node.layout.center.x + dx, node.layout.center.y + dy)
    )
  }

  function getPreferredLabelPlacement() {
    const descriptor = new yfiles.layout.PreferredPlacementDescriptor({
      angle: 0,
      angleReference: yfiles.layout.LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
      sideOfEdge: yfiles.layout.LabelPlacements.LEFT_OF_EDGE,
      sideReference: yfiles.layout.LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH
    })
    return descriptor
  }

  /**
   * Invokes a layout specified by the current {@link layoutType}. If there is a fixed node, the layout is calculated
   * incrementally.
   * @param {yfiles.graph.INode} fixedNode if defined the layout will be incrementally and this node remains at its
   *                                       location
   */
  function runLayout(fixedNode) {
    if (layoutRunning) {
      return Promise.reject()
    }

    layoutRunning = true

    const incremental = !!fixedNode

    // add mapper to make transformation data stored in the user data of the nodes/edges available during layout
    const mapperRegistry = graphComponent.graph.mapperRegistry
    mapperRegistry.createDelegateMapper(
      yfiles.graph.IModelItem.$class,
      yfiles.lang.Object.$class,
      IsometricTransformationStage.TRANSFORMATION_DATA_DP_KEY,
      item => {
        if (
          yfiles.graph.INode.isInstance(item) ||
          (yfiles.graph.ILabel.isInstance(item) && yfiles.graph.IEdge.isInstance(item.owner))
        ) {
          return item.tag.geometry
        }
        return null
      }
    )

    // configure layout
    const configuration =
      layoutType === 'hierarchic'
        ? getHierarchicLayoutConfiguration(incremental)
        : getOrthogonalLayoutConfiguration()
    let layout = new IsometricTransformationStage(configuration.layout, incremental)
    let layoutData = configuration.layoutData
    if (incremental) {
      // fixate the location of the given fixed node
      layout = new FixGroupStateIconStage(layout)
      const fixNodeLayoutData = new yfiles.layout.FixNodeLayoutData()
      fixNodeLayoutData.fixedNode.item = fixedNode

      layoutData = new yfiles.layout.CompositeLayoutData()
      layoutData.items.add(configuration.layoutData)
      layoutData.items.add(fixNodeLayoutData)
    }

    setUIDisabled(true)

    // configure layout execution to not move the view port
    const executor = new yfiles.layout.LayoutExecutor(graphComponent, layout)
    executor.animateViewport = !incremental
    executor.duration = '0.5s'
    executor.layoutData = layoutData
    executor.updateContentRect = false

    // start layout
    return executor.start().then(() => {
      mapperRegistry.removeMapper(IsometricTransformationStage.TRANSFORMATION_DATA_DP_KEY)
      mapperRegistry.removeMapper(
        yfiles.layout.LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY
      )
      layoutRunning = false
      setUIDisabled(false)
    })
  }

  /**
   * Creates an hierarchic layout configuration consisting of layout algorithm and layout data.
   * @param {boolean} incremental <code>true</code> in case the layout should be calculated incrementally
   * @return {{layout: yfiles.hierarchic.HierarchicLayout, layoutData: yfiles.hierarchic.HierarchicLayoutData}}
   */
  function getHierarchicLayoutConfiguration(incremental) {
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.orthogonalRouting = true
    layout.nodeToEdgeDistance = 50
    layout.minimumLayerDistance = 40
    layout.labelingEnabled = false
    layout.integratedEdgeLabeling = true
    layout.considerNodeLabels = true

    // use preferred placement descriptors to place the labels vertically on the edges
    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    layoutData.edgeLabelPreferredPlacement.constant = getPreferredLabelPlacement()
    layoutData.incrementalHints.incrementalSequencingItems.delegate = item =>
      yfiles.graph.IEdge.isInstance(item)

    if (incremental) {
      layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
    }
    return {
      layout,
      layoutData
    }
  }

  /**
   * Creates an orthogonal layout configuration consisting of layout algorithm and layout data.
   * @return {{layout: yfiles.orthogonal.OrthogonalLayout, layoutData: yfiles.orthogonal.OrthogonalLayoutData}}
   */
  function getOrthogonalLayoutConfiguration() {
    // this label layout translator does nothing because the TransformationLayoutStage prepares the labels for layout
    // but OrthogonalLayout needs a label layout translator for integrated edge labeling and node label consideration
    const labelLayoutTranslator = new LabelLayoutTranslator()

    const layout = new yfiles.orthogonal.OrthogonalLayout()
    layout.integratedEdgeLabeling = true
    layout.considerNodeLabels = true
    layout.labeling = labelLayoutTranslator

    const layoutData = new yfiles.orthogonal.OrthogonalLayoutData()
    layoutData.edgeLabelPreferredPlacement.constant = getPreferredLabelPlacement()

    return {
      layout,
      layoutData
    }
  }

  /**
   * This label layout translator does nothing because the TransformationLayoutStage prepares the labels for layout
   * but OrthogonalGroupLayouter needs a label layout translator for integrated edge labeling and node label
   * consideration.
   */
  class LabelLayoutTranslator extends yfiles.layout.LabelLayoutTranslator {
    /**
     * @param {yfiles.layout.LayoutGraph} graph
     */
    applyLayout(graph) {
      if (this.coreLayout) {
        this.coreLayout.applyLayout(graph)
      }
    }
  }

  /**
   * Loads a graph from JSON and initializes all styles and isometric data.
   * The graph also gets an initial layout.
   */
  function loadGraph() {
    const graph = graphComponent.graph

    graph.nodeDefaults.style = new IsometricStyles.NodeStyle()
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.SOUTH
    graph.groupNodeDefaults.style = new IsometricStyles.GroupNodeStyle()
    graph.groupNodeDefaults.labels.style = new IsometricStyles.GroupLabelStyle()

    const graphBuilder = new yfiles.binding.GraphBuilder(graph)
    graphBuilder.nodesSource = IsometricData.nodesSource
    graphBuilder.edgesSource = IsometricData.edgesSource
    graphBuilder.groupsSource = IsometricData.groupsSource
    graphBuilder.sourceNodeBinding = 'from'
    graphBuilder.targetNodeBinding = 'to'
    graphBuilder.nodeIdBinding = 'id'
    graphBuilder.groupBinding = 'group'
    graphBuilder.parentGroupBinding = 'parentGroup'
    graphBuilder.groupIdBinding = 'id'
    graphBuilder.edgeLabelBinding = tag => tag.label || null
    graphBuilder.nodeLabelBinding = tag => tag.label || null

    graphComponent.graph = graphBuilder.buildGraph()

    graph.edgeLabels.forEach(label => {
      const layout = label.layout
      const insets = new yfiles.geometry.Insets(3)
      label.tag = {
        geometry: {
          width: layout.width + insets.left + insets.right,
          height: layout.height + insets.top + insets.bottom,
          depth: layout.height + insets.top + insets.bottom,
          horizontal: true
        }
      }
      graph.setStyle(label, new IsometricStyles.EdgeLabelStyle(insets))
    })

    graph.nodes.forEach(node => {
      if (graph.isGroupNode(node)) {
        graph.addLabel(node, node.tag.label)
      }
    })

    runLayout()
  }

  /**
   * Binds actions to the toolbar buttons.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    const graphmlSupport = new yfiles.graphml.GraphMLSupport()
    graphmlSupport.graphMLIOHandler = new yfiles.graphml.GraphMLIOHandler()
    graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    app.bindAction("button[data-command='Open']", () => {
      graphmlSupport
        .openFile(graphComponent.graph, yfiles.graphml.StorageLocation.FILE_SYSTEM)
        .then(() => {
          setUIDisabled(true)
          // after loading apply isometric styles and geometry to the nodes and labels
          applyIsometricStyles()
          runLayout().then(() => {
            setUIDisabled(false)
          })
        })
        .catch(error => {
          setUIDisabled(false)
          if (typeof window.reportError === 'function') {
            window.reportError(error)
          }
        })
    })

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindAction("button[data-command='HierarchicLayout']", () => {
      layoutType = 'hierarchic'
      runLayout()
    })
    app.bindAction("button[data-command='OrthogonalLayout']", () => {
      layoutType = 'orthogonal'
      runLayout()
    })
  }

  /**
   * Adds isometric styles and geometry data to nodes and labels of the graph. Also free label and port location models
   * are applied to retrieve the correct positions calculated by the layout algorithm.
   */
  function applyIsometricStyles() {
    const foldingManager = graphComponent.graph.foldingView.manager
    const graph = foldingManager.masterGraph
    graph.nodes.forEach(node => {
      const group = graph.isGroupNode(node)
      updateGeometry(node, node.layout, group ? 0 : 20)
      if (group) {
        node.tag.fill = 'rgba(202,236,255,128)'
        graph.setStyle(node, new IsometricStyles.GroupNodeStyle())
        foldingManager.getFolderNodeState(node).style = new IsometricStyles.GroupNodeStyle()
        const firstLabel = node.labels.firstOrDefault()
        if (firstLabel) {
          updateGeometry(
            firstLabel,
            firstLabel.layout,
            firstLabel.layout.height,
            new yfiles.geometry.Insets(3)
          )
          graph.setStyle(firstLabel, new IsometricStyles.GroupLabelStyle())
          graph.setLabelLayoutParameter(firstLabel, graph.groupNodeDefaults.labels.layoutParameter)
        }
        const firstFolderLabel = foldingManager.getFolderNodeState(node).labels.firstOrDefault()
        if (firstFolderLabel) {
          const label = firstFolderLabel.asLabel()
          updateGeometry(label, label.layout, label.layout.height, new yfiles.geometry.Insets(3))
          firstFolderLabel.style = new IsometricStyles.GroupLabelStyle()
        }
      } else {
        node.tag.fill = 'rgba(255,153,0,255)'
        graph.setStyle(node, new IsometricStyles.NodeStyle())
      }
    })
    graph.edges.forEach(edge => {
      graph.setStyle(edge, new yfiles.styles.PolylineEdgeStyle())
      edge.labels.forEach(label => {
        updateGeometry(label, label.layout, label.layout.height, new yfiles.geometry.Insets(3))
        graph.setStyle(label, new IsometricStyles.EdgeLabelStyle())
        graph.setLabelLayoutParameter(
          label,
          yfiles.graph.FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
        )
      })
    })
    graph.ports.forEach(port => {
      graph.setPortLocationParameter(
        port,
        yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
      )
    })
  }

  /**
   * Updates the tag of the given item with geometry data.
   * In case the tag already contains valid geometry data, it stays unchanged.
   * @param {yfiles.graph.IModelItem} item the item for which the tag is updated.
   * @param {yfiles.geometry.IRectangle|yfiles.geometry.IOrientedRectangle} layout the 2D-geometry for the item
   * @param {number} height the height of the resulting solid figure
   * @param {yfiles.geometry.Insets} insets insets that are added to the layout information to create a padding
   */
  function updateGeometry(item, layout, height, insets) {
    if (
      item.tag &&
      item.tag.geometry &&
      item.tag.geometry.width &&
      item.tag.geometry.height &&
      item.tag.geometry.depth
    ) {
      return
    }

    const inset = insets || yfiles.geometry.Insets.EMPTY
    const geometry = {
      width: layout.width + inset.left + inset.right,
      height: height + inset.top + inset.bottom,
      depth: layout.height + inset.top + inset.bottom,
      horizontal: true
    }
    if (item.tag) {
      item.tag.geometry = geometry
    } else {
      item.tag = { geometry }
    }
  }

  /**
   * Disables buttons in the toolbar.
   * @param {boolean} disabled
   */
  function setUIDisabled(disabled) {
    document.getElementById('open-file').disabled = disabled
    document.getElementById('hierarchic-layout').disabled = disabled
    document.getElementById('orthogonal-layout').disabled = disabled
  }

  run()
})
