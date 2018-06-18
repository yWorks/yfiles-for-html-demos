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
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'resources/SampleData.js',
  'utils/ContextMenu',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  SampleData,
  ContextMenu
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {boolean} */
  let portGroupMode = false

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    configureInteraction()
    createSampleGraph()
    registerCommands()
    app.show(graphComponent)
  }

  /**
   * Applies a layout to the current graph including the edge/port group information in the edges' tags.
   * @param {boolean} incremental
   */
  function runLayout(incremental) {
    setUIDisabled(true)
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.orthogonalRouting = true
    layout.nodePlacer.barycenterMode = true
    layout.nodePlacer.bendReduction = false
    layout.minimumLayerDistance = 70
    layout.layoutMode = incremental
      ? yfiles.hierarchic.LayoutMode.INCREMENTAL
      : yfiles.hierarchic.LayoutMode.FROM_SCRATCH

    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    if (portGroupMode) {
      layoutData.sourcePortGroupIds.delegate = edge =>
        edge.tag && edge.tag.sourceGroupId ? edge.tag.sourceGroupId : null
      layoutData.targetPortGroupIds.delegate = edge =>
        edge.tag && edge.tag.targetGroupId ? edge.tag.targetGroupId : null
    } else {
      layoutData.sourceGroupIds.delegate = edge =>
        edge.tag && edge.tag.sourceGroupId ? edge.tag.sourceGroupId : null
      layoutData.targetGroupIds.delegate = edge =>
        edge.tag && edge.tag.targetGroupId ? edge.tag.targetGroupId : null
    }
    layoutData.edgeThickness.constant = 3
    layoutData.incrementalHints.incrementalSequencingItems.items = graphComponent.graph.edges

    graphComponent.morphLayout(layout, '700ms', layoutData).then(() => {
      setUIDisabled(false)
    })
  }

  function createSampleGraph() {
    const graph = graphComponent.graph
    DemoStyles.initDemoStyles(graph)
    graph.nodeDefaults.style.cssClass = 'node-color'
    graph.nodeDefaults.size = [50, 30]
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: '3px #BBBBBB',
      targetArrow: new yfiles.styles.Arrow({
        fill: '#BBBBBB',
        type: yfiles.styles.ArrowType.TRIANGLE
      }),
      smoothingLength: 15
    })
    graph.edgeDefaults.shareStyleInstance = false

    graphComponent.graph.decorator.edgeDecorator.selectionDecorator.setImplementation(
      new yfiles.view.EdgeStyleDecorationInstaller({
        edgeStyle: new HighlightEdgeStyle(),
        zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    )

    const bridgeManager = new yfiles.view.BridgeManager()
    bridgeManager.addObstacleProvider(new yfiles.view.GraphObstacleProvider())
    bridgeManager.canvasComponent = graphComponent
    bridgeManager.defaultBridgeCrossingStyle = yfiles.view.BridgeCrossingStyle.GAP

    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = SampleData.nodes
    builder.edgesSource = SampleData.edges
    builder.nodeIdBinding = 'id'
    builder.edgeIdBinding = 'id'
    builder.sourceNodeBinding = 'from'
    builder.targetNodeBinding = 'to'
    graphComponent.graph = builder.buildGraph()

    graph.edges.forEach(edge => {
      edge.tag = edge.tag.groupIds
      updateStyles(edge)
    })

    graphComponent.fitGraphBounds()
    runLayout(false)
  }

  /**
   * Updates the selection when an item is right-clicked for a context menu.
   * @param {yfiles.graph.INode|yfiles.graph.IEdge} item
   */
  function updateSelection(item) {
    const selection = graphComponent.selection
    if (item) {
      if (!selection.isSelected(item)) {
        selection.clear()
        selection.setSelected(item, true)
      } else {
        if (yfiles.graph.IEdge.isInstance(item)) {
          selection.selectedNodes.clear()
        } else {
          selection.selectedEdges.clear()
        }
        selection.setSelected(item, true)
      }
    }
  }

  /**
   * Groups the given edges according to the type. In case 'override' is true, a new tag is set.
   * @param {'source'|'target'|'source-and-target'|'ungroup'} type
   * @param {Array} edges
   * @param {boolean} override
   */
  function groupEdges(type, edges, override) {
    const id = Date.now()
    edges.forEach(edge => {
      const tag = {}
      switch (type) {
        case 'source':
          tag.sourceGroupId = `s ${id} ${edge.sourceNode.hashCode()}`
          break
        case 'target':
          tag.targetGroupId = `t ${id} ${edge.targetNode.hashCode()}`
          break
        case 'source-and-target':
          tag.sourceGroupId = `s ${id} ${edge.sourceNode.hashCode()}`
          tag.targetGroupId = `t ${id} ${edge.targetNode.hashCode()}`
          break
        default:
      }

      if (!edge.tag || override || type === 'ungroup') {
        edge.tag = tag
      } else {
        edge.tag.sourceGroupId = tag.sourceGroupId || edge.tag.sourceGroupId
        edge.tag.targetGroupId = tag.targetGroupId || edge.tag.targetGroupId
      }
      updateStyles(edge)
    })

    runLayout(true)
  }

  /**
   * Updates the styles to distinguish the different types of edge/port grouping.
   * @param {yfiles.graph.IEdge} edge
   */
  function updateStyles(edge) {
    const tag = edge.tag
    if (!tag) {
      return // the ungrouped edge default
    }

    let color = '#BBBBBB'
    if (portGroupMode) {
      if (tag.sourceGroupId && tag.targetGroupId) {
        color = '#FFA500'
      } else if (tag.sourceGroupId) {
        color = '#DC143C'
      } else if (tag.targetGroupId) {
        color = '#D2691E'
      }
    } else if (tag.sourceGroupId && tag.targetGroupId) {
      color = '#6495ED'
    } else if (tag.sourceGroupId) {
      color = '#4169E1'
    } else if (tag.targetGroupId) {
      color = '#483D8B'
    }

    const portStyle = new yfiles.styles.NodeStylePortStyleAdapter({
      nodeStyle: new yfiles.styles.ShapeNodeStyle({
        shape: yfiles.styles.ShapeNodeShape.ELLIPSE,
        fill: color,
        stroke: null
      }),
      renderSize: [7, 7]
    })
    if (tag.sourceGroupId) {
      graphComponent.graph.setStyle(edge.sourcePort, portStyle)
    } else {
      graphComponent.graph.setStyle(edge.sourcePort, new yfiles.styles.VoidPortStyle())
    }
    if (tag.targetGroupId) {
      graphComponent.graph.setStyle(edge.targetPort, portStyle)
    } else {
      graphComponent.graph.setStyle(edge.targetPort, new yfiles.styles.VoidPortStyle())
    }

    graphComponent.graph.setStyle(
      edge,
      new yfiles.styles.PolylineEdgeStyle({
        stroke: `3px ${color}`,
        targetArrow: new yfiles.styles.Arrow({
          fill: color,
          stroke: color,
          type: yfiles.styles.ArrowType.TRIANGLE,
          cropLength: tag.targetGroupId ? 4 : 0.5
        }),
        smoothingLength: 15
      })
    )
  }

  /**
   * Sets a {@link yfiles.input.GraphEditorInputMode} and initializes the context menu.
   */
  function configureInteraction() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      selectableItems: yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.NODE
    })

    const contextMenu = new ContextMenu(graphComponent)
    contextMenu.addOpeningEventListeners(graphComponent, location => {
      const worldLocation = graphComponent.toWorldFromPage(location)
      const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (showMenu) {
        contextMenu.show(location)
      }
    })
    inputMode.addPopulateItemContextMenuListener((sender, args) =>
      populateContextMenu(contextMenu, args)
    )
    inputMode.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())
    contextMenu.onClosedCallback = () => inputMode.contextMenuInputMode.menuClosed()
    graphComponent.inputMode = inputMode
  }

  /**
   * Adds menu items to the context menu depending on what type of graph element was hit.
   * @param {object} contextMenu
   * @param {yfiles.input.PopulateItemContextMenuEventArgs} args
   */
  function populateContextMenu(contextMenu, args) {
    args.showMenu = true
    contextMenu.clearItems()

    let item = args.item
    const selection = graphComponent.selection
    if (!item && selection.selectedEdges.size > 0) {
      item = selection.selectedEdges.first()
    }
    updateSelection(item)
    if (yfiles.graph.IEdge.isInstance(item)) {
      contextMenu.clearItems()
      const selectedEdges = selection.selectedEdges.toArray()
      if (portGroupMode) {
        const sourcePortGroupMenuItem = contextMenu.addMenuItem('Source Port Group', () =>
          groupEdges('source', selectedEdges, true)
        )
        const targetPortGroupMenuItem = contextMenu.addMenuItem('Target Port Group', () =>
          groupEdges('target', selectedEdges, true)
        )
        const sourceAndTargetPortGroupMenuItem = contextMenu.addMenuItem(
          'Source and Target Port Group',
          () => groupEdges('source-and-target', selectedEdges, true)
        )
        app.addClass(sourcePortGroupMenuItem, 'source-port-group')
        app.addClass(targetPortGroupMenuItem, 'target-port-group')
        app.addClass(sourceAndTargetPortGroupMenuItem, 'source-and-target-port-group')
      } else {
        const sourceGroupMenuItem = contextMenu.addMenuItem('Source Group', () =>
          groupEdges('source', selectedEdges, true)
        )
        const targetGroupMenuItem = contextMenu.addMenuItem('Target Group', () =>
          groupEdges('target', selectedEdges, true)
        )
        const sourceAndTargetGroupMenuItem = contextMenu.addMenuItem(
          'Source and Target Group',
          () => groupEdges('source-and-target', selectedEdges, true)
        )
        app.addClass(sourceGroupMenuItem, 'source-edge-group')
        app.addClass(targetGroupMenuItem, 'target-edge-group')
        app.addClass(sourceAndTargetGroupMenuItem, 'source-and-target-edge-group')
      }
      contextMenu.addMenuItem('Ungroup', () => groupEdges('ungroup', selectedEdges, true))
    } else if (yfiles.graph.INode.isInstance(item)) {
      let outgoingEdges = []
      let incomingEdges = []
      let incidentEdges = []
      selection.selectedNodes.forEach(node => {
        outgoingEdges = outgoingEdges.concat(graphComponent.graph.outEdgesAt(node).toArray())
        incomingEdges = incomingEdges.concat(graphComponent.graph.inEdgesAt(node).toArray())
        incidentEdges = incidentEdges.concat(graphComponent.graph.edgesAt(node).toArray())
      })
      if (portGroupMode) {
        const sourcePortGroupMenuItem = contextMenu.addMenuItem('Port Group Outgoing Edges', () =>
          groupEdges('source', outgoingEdges, false)
        )
        const targetPortGroupMenuItem = contextMenu.addMenuItem('Port Group Incoming Edges', () =>
          groupEdges('target', incomingEdges, false)
        )
        const sourceAndTargetPortGroupMenuItem = contextMenu.addMenuItem(
          'Port Group Incident Edges',
          () => {
            groupEdges('source', outgoingEdges, false)
            groupEdges('target', incomingEdges, false)
          }
        )
        app.addClass(sourcePortGroupMenuItem, 'source-port-group')
        app.addClass(targetPortGroupMenuItem, 'target-port-group')
        app.addClass(sourceAndTargetPortGroupMenuItem, 'source-and-target-port-group')
      } else {
        const sourceGroupMenuItem = contextMenu.addMenuItem('Group Outgoing Edges', () =>
          groupEdges('source', outgoingEdges, false)
        )
        const targetGroupMenuItem = contextMenu.addMenuItem('Group Incoming Edges', () =>
          groupEdges('target', incomingEdges, false)
        )
        const sourceAndTargetGroupMenuItem = contextMenu.addMenuItem('Group Incident Edges', () =>
          groupEdges('source-and-target', incidentEdges, false)
        )
        app.addClass(sourceGroupMenuItem, 'source-edge-group')
        app.addClass(targetGroupMenuItem, 'target-edge-group')
        app.addClass(sourceAndTargetGroupMenuItem, 'source-and-target-edge-group')
      }
      contextMenu.addMenuItem('Ungroup Incident Edges', () =>
        groupEdges('ungroup', incidentEdges, false)
      )
    } else {
      const allEdges = graphComponent.graph.edges.toArray()
      if (portGroupMode) {
        const sourcePortGroupMenuItem = contextMenu.addMenuItem('Source Port Group All Edges', () =>
          groupEdges('source', allEdges, true)
        )
        const targetPortGroupMenuItem = contextMenu.addMenuItem('Target Port Group All Edges', () =>
          groupEdges('target', allEdges, true)
        )
        const sourceAndTargetPortGroupMenuItem = contextMenu.addMenuItem(
          'Source and Target Port Group All Edges',
          () => groupEdges('source-and-target', allEdges, true)
        )
        app.addClass(sourcePortGroupMenuItem, 'source-port-group')
        app.addClass(targetPortGroupMenuItem, 'target-port-group')
        app.addClass(sourceAndTargetPortGroupMenuItem, 'source-and-target-port-group')
      } else {
        const sourceGroupMenuItem = contextMenu.addMenuItem('Source Group All Edges', () =>
          groupEdges('source', allEdges, true)
        )
        const targetGroupMenuItem = contextMenu.addMenuItem('Target Group All Edges', () =>
          groupEdges('target', allEdges, true)
        )
        const sourceAndTargetGroupMenuItem = contextMenu.addMenuItem(
          'Source and Target Group All Edges',
          () => groupEdges('source-and-target', allEdges, true)
        )
        app.addClass(sourceGroupMenuItem, 'source-edge-group')
        app.addClass(targetGroupMenuItem, 'target-edge-group')
        app.addClass(sourceAndTargetGroupMenuItem, 'source-and-target-edge-group')
      }
      contextMenu.addMenuItem('Ungroup All Edges', () => groupEdges('ungroup', allEdges, true))
    }
  }

  /**
   * Binds the various actions to the buttons in the toolbar.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindAction("button[data-command='Layout']", () => runLayout(false))
    app.bindAction("button[data-command='Reset']", createSampleGraph)
    app.bindChangeListener("select[data-command='TogglePortGroupMode']", value => {
      portGroupMode = value === 'Port Grouping'
      graphComponent.graph.edges.forEach(edge => {
        updateStyles(edge)
      })
      runLayout(true)
    })
  }

  /**
   * Disables the HTML elements of the UI.
   * @param disabled true if the element should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.querySelector("button[data-command='Reset']").disabled = disabled
    document.querySelector("button[data-command='Layout']").disabled = disabled
    document.querySelector("select[data-command='TogglePortGroupMode']").disabled = disabled
    graphComponent.inputMode.enabled = !disabled
  }

  /**
   * An edge style to draw the selection highlight 'below' the edge.
   */
  class HighlightEdgeStyle extends yfiles.styles.EdgeStyleBase {
    /**
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.graph.IEdge} edge
     * @returns {yfiles.view.Visual}
     */
    createVisual(context, edge) {
      const strokeColor = edge.style.stroke.fill.color
      const highlightColor = `rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b})`
      const visualGroup = new yfiles.view.SvgVisualGroup()
      const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const path = this.cropPath(
        edge,
        edge.style.sourceArrow,
        edge.style.targetArrow,
        this.getPath(edge)
      ).createSmoothedPath(15, yfiles.geometry.SmoothingPolicy.ASYMMETRIC, true)
      highlightPath.setAttribute('d', path.createSvgPathData())
      highlightPath.setAttribute('stroke', highlightColor)
      highlightPath.setAttribute('stroke-width', '6px')
      highlightPath.setAttribute('fill', 'none')
      this.addArrows(
        context,
        highlight,
        edge,
        path,
        yfiles.styles.IArrow.NONE,
        new yfiles.styles.Arrow({
          color: highlightColor,
          scale: 1.5,
          type: yfiles.styles.ArrowType.TRIANGLE
        })
      )
      highlight.appendChild(highlightPath)
      highlight.setAttribute('opacity', '0.75')

      const highlightVisual = new yfiles.view.SvgVisual(highlight)
      visualGroup.add(highlightVisual)
      visualGroup.add(edge.style.renderer.getVisualCreator(edge, edge.style).createVisual(context))

      return visualGroup
    }
  }

  run()
})
