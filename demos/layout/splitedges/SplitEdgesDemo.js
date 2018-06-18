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
  'ContextMenuSupport.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'yfiles/router-polyline',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  ContextMenuSupport
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    configureInteraction()
    createSampleGraph()
    registerCommands()
    app.show(graphComponent)
  }

  /**
   * Runs a {@link yfiles.layout.RecursiveGroupLayout} with {@link yfiles.hierarchic.HierarchicLayout} as its core
   * layout.
   */
  function runLayout() {
    const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
    hierarchicLayout.edgeLayoutDescriptor.directGroupContentEdgeRouting = true
    hierarchicLayout.nodePlacer.barycenterMode = true

    const hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()
    hierarchicLayoutData.edgeThickness.constant = 3

    const recursiveGroupLayout = new yfiles.layout.RecursiveGroupLayout(hierarchicLayout)
    const edgeRouter = new yfiles.router.EdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
    edgeRouter.defaultEdgeLayoutDescriptor.directGroupContentEdgeRouting = true
    recursiveGroupLayout.interEdgeRouter = edgeRouter
    recursiveGroupLayout.interEdgesDpKey = edgeRouter.affectedEdgesDpKey

    // use the split ids from the edge tags
    const recursiveGroupLayoutData = new yfiles.layout.RecursiveGroupLayoutData()
    recursiveGroupLayoutData.sourceSplitIds.delegate = edge =>
      edge.tag && edge.tag.sourceSplitId ? edge.tag.sourceSplitId : null
    recursiveGroupLayoutData.targetSplitIds.delegate = edge =>
      edge.tag && edge.tag.targetSplitId ? edge.tag.targetSplitId : null

    const layoutData = new yfiles.layout.CompositeLayoutData()
    layoutData.items = [recursiveGroupLayoutData, hierarchicLayoutData]

    graphComponent.graph.mapperRegistry.createConstantMapper(
      yfiles.layout.GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
      new yfiles.geometry.Insets(20, 35, 20, 20)
    )

    setUIDisabled(true)
    graphComponent.morphLayout(recursiveGroupLayout, '700ms', layoutData).then(() => {
      setUIDisabled(false)
    })
  }

  /**
   * Creates a simple sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    graph.clear()
    initializeDefaults()

    const nodes = []
    for (let i = 0; i < 8; i++) {
      nodes.push(graph.createNode())
    }
    const groupNode1 = graph.createGroupNode()
    graph.groupNodes(groupNode1, nodes.slice(0, 2))
    const groupNode2 = graph.createGroupNode()
    graph.groupNodes(groupNode2, nodes.slice(2, 5))
    const groupNode3 = graph.createGroupNode()
    graph.groupNodes(groupNode3, [groupNode2])

    graph.createEdge({
      source: nodes[0],
      target: groupNode1,
      tag: { targetSplitId: 'split0', color: 'crimson' }
    })
    graph.createEdge({
      source: groupNode1,
      target: groupNode3,
      tag: { sourceSplitId: 'split0', targetSplitId: 'split0', color: 'crimson' }
    })
    graph.createEdge({
      source: groupNode3,
      target: groupNode2,
      tag: { sourceSplitId: 'split0', targetSplitId: 'split0', color: 'crimson' }
    })
    graph.createEdge({
      source: groupNode2,
      target: nodes[2],
      tag: { sourceSplitId: 'split0', color: 'crimson' }
    })
    graph.createEdge({
      source: nodes[1],
      target: groupNode3,
      tag: { targetSplitId: 'split1', color: 'darkturquoise' }
    })
    graph.createEdge({
      source: groupNode3,
      target: nodes[3],
      tag: { sourceSplitId: 'split1', color: 'darkturquoise' }
    })
    graph.createEdge({
      source: groupNode3,
      target: nodes[5],
      tag: { sourceSplitId: 'split2', color: 'cornflowerblue' }
    })
    graph.createEdge({
      source: nodes[4],
      target: groupNode3,
      tag: { targetSplitId: 'split2', color: 'cornflowerblue' }
    })
    graph.createEdge({
      source: groupNode2,
      target: groupNode3,
      tag: { targetSplitId: 'split3', color: 'darkslateblue' }
    })
    graph.createEdge({
      source: groupNode3,
      target: nodes[6],
      tag: { sourceSplitId: 'split3', color: 'darkslateblue' }
    })
    graph.createEdge({
      source: nodes[0],
      target: nodes[7]
    })
    graph.createEdge({
      source: nodes[2],
      target: nodes[4]
    })
    graph.createEdge({
      source: nodes[3],
      target: nodes[4]
    })

    graph.edges.forEach(edge => {
      if (edge.tag && (edge.tag.sourceSplitId || edge.tag.targetSplitId)) {
        edge.style.stroke = `3px ${edge.tag.color}`
        edge.style.targetArrow = new yfiles.styles.Arrow({
          fill: edge.tag.color,
          type: yfiles.styles.ArrowType.TRIANGLE,
          scale: 1.5
        })
      }
    })

    runLayout()
  }

  /**
   * Initializes graph defaults.
   */
  function initializeDefaults() {
    const graph = graphComponent.graph
    graph.nodeDefaults.style = new DemoStyles.DemoNodeStyle()
    graph.nodeDefaults.style.cssClass = 'node-color'
    graph.nodeDefaults.size = [50, 30]

    graph.groupNodeDefaults.style = new DemoStyles.DemoGroupStyle()
    graph.groupNodeDefaults.style.cssClass = 'group-border'

    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: '3px #BBBBBB',
      targetArrow: new yfiles.styles.Arrow({
        fill: '#BBBBBB',
        type: yfiles.styles.ArrowType.TRIANGLE,
        scale: 1.5
      }),
      smoothingLength: 15
    })
    graph.edgeDefaults.shareStyleInstance = false

    graph.decorator.edgeDecorator.selectionDecorator.setImplementation(
      new yfiles.view.EdgeStyleDecorationInstaller({
        edgeStyle: new HighlightEdgeStyle(),
        zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    )
  }

  /**
   * Sets a {@link yfiles.input.GraphEditorInputMode} and initializes the context menu.
   */
  function configureInteraction() {
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      selectableItems: yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.NODE,
      allowGroupingOperations: true
    })

    const contextMenuSupport = new ContextMenuSupport(graphComponent, runLayout)
    contextMenuSupport.createContextMenu()
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
    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent
    )
    app.bindAction("button[data-command='Layout']", () => runLayout())
    app.bindAction("button[data-command='Reset']", createSampleGraph)
  }

  /**
   * Disables the HTML elements of the UI.
   * @param disabled true if the element should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.querySelector("button[data-command='Layout']").disabled = disabled
    document.querySelector("button[data-command='Reset']").disabled = disabled
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
          scale: 1.7,
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
