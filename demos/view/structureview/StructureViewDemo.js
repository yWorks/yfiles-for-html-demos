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
  'resources/demo-styles',
  './StructureView.js',
  'yfiles/view-folding',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  StructureView
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {StructureView} */
  let structureView = null

  function run() {
    // initialize the GraphComponent and enable folding
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const foldingManager = new yfiles.graph.FoldingManager()

    const foldingView = foldingManager.createFoldingView()
    foldingView.enqueueNavigationalUndoUnits = true

    // configure default styles and build an initial sample graph
    DemoStyles.initDemoStyles(foldingView.graph)
    createSampleGraph(foldingView.graph)

    graphComponent.graph = foldingView.graph
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })
    graphComponent.fitGraphBounds()

    foldingManager.masterGraph.undoEngineEnabled = true

    // instantiate the structure view
    initializeStructureView()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the structure view component.
   */
  function initializeStructureView() {
    structureView = new StructureView('#structure-view')
    structureView.graph = graphComponent.graph
    structureView.labelPlaceholder = '< node >'
    structureView.onElementClicked = node => {
      const viewNode = graphComponent.graph.foldingView
        ? graphComponent.graph.foldingView.getViewItem(node)
        : node
      if (viewNode) {
        graphComponent.currentItem = viewNode
        graphComponent.selection.clear()
        graphComponent.selection.setSelected(viewNode, true)
        yfiles.input.ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, graphComponent)
      }
    }
  }

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

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent, null)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent, null)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent, null)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent, null)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent, null)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent, null)

    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent,
      null
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='EnterGroup']", iCommand.ENTER_GROUP, graphComponent, null)
    app.bindCommand("button[data-command='ExitGroup']", iCommand.EXIT_GROUP, graphComponent, null)

    app.bindAction('#sync-folding-state', e => (structureView.syncFoldingState = e.target.checked))
  }

  /**
   * Creates the initial graph.
   */
  function createSampleGraph(graph) {
    const n1 = graph.createNode({
      layout: new yfiles.geometry.Rect(126, 0, 30, 30),
      labels: 'N1'
    })
    const n2 = graph.createNode({
      layout: new yfiles.geometry.Rect(126, 72, 30, 30),
      labels: 'N2'
    })
    const n3 = graph.createNode({
      layout: new yfiles.geometry.Rect(75, 147, 30, 30),
      labels: 'N3'
    })
    const n4 = graph.createNode({
      layout: new yfiles.geometry.Rect(177.5, 147, 30, 30),
      labels: 'N4'
    })
    const n5 = graph.createNode({
      layout: new yfiles.geometry.Rect(110, 249, 30, 30),
      labels: 'N5'
    })
    const n6 = graph.createNode({
      layout: new yfiles.geometry.Rect(177.5, 249, 30, 30),
      labels: 'N6'
    })
    const n7 = graph.createNode({
      layout: new yfiles.geometry.Rect(110, 299, 30, 30),
      labels: 'N7'
    })
    const n8 = graph.createNode({
      layout: new yfiles.geometry.Rect(177.5, 299, 30, 30),
      labels: 'N8'
    })
    const n9 = graph.createNode({
      layout: new yfiles.geometry.Rect(110, 359, 30, 30),
      labels: 'N9'
    })
    const n10 = graph.createNode({
      layout: new yfiles.geometry.Rect(47.5, 299, 30, 30),
      labels: 'N10'
    })
    const n11 = graph.createNode({
      layout: new yfiles.geometry.Rect(20, 440, 30, 30),
      labels: 'N11'
    })
    const n12 = graph.createNode({
      layout: new yfiles.geometry.Rect(110, 440, 30, 30),
      labels: 'N12'
    })
    const n13 = graph.createNode({
      layout: new yfiles.geometry.Rect(20, 515, 30, 30),
      labels: 'N13'
    })
    const n14 = graph.createNode({
      layout: new yfiles.geometry.Rect(80, 515, 30, 30),
      labels: 'N14'
    })
    const n15 = graph.createNode({
      layout: new yfiles.geometry.Rect(140, 515, 30, 30),
      labels: 'N15'
    })
    const n16 = graph.createNode({
      layout: new yfiles.geometry.Rect(20, 569, 30, 30),
      labels: 'N16'
    })

    const group1 = graph.createGroupNode({
      layout: new yfiles.geometry.Rect(25, 45, 202.5, 353),
      labels: 'Group 1'
    })
    graph.groupNodes(group1, [n2, n3, n4, n9, n10])

    const group2 = graph.createGroupNode({
      parent: group1,
      layout: new yfiles.geometry.Rect(98, 222, 119.5, 116),
      labels: 'Group 2'
    })
    graph.groupNodes(group2, [n5, n6, n7, n8])

    const group3 = graph.createGroupNode({
      layout: new yfiles.geometry.Rect(10, 413, 170, 141),
      labels: 'Group 3'
    })
    graph.groupNodes(group3, [n11, n12, n13, n14, n15])

    graph.createEdge(n1, n2)
    graph.createEdge(n2, n3)
    graph.createEdge(n2, n4)
    graph.createEdge(n3, n5)
    graph.createEdge(n3, n10)
    graph.createEdge(n5, n7)
    graph.createEdge(n7, n9)
    graph.createEdge(n4, n6)
    graph.createEdge(n6, n8)
    graph.createEdge(n10, n11)
    graph.createEdge(n10, n12)
    graph.createEdge(n11, n13)
    graph.createEdge(n13, n16)
    graph.createEdge(n12, n14)
    graph.createEdge(n12, n15)
  }

  // Start the demo
  run()
})
