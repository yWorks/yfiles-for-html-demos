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
  'TableLayout.js',
  'ThreeTierLayout.js',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  TableLayout,
  ThreeTierLayout
) => {
  /**
   * The GraphComponent.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeGraph()
    initializeInputModes()
    registerCommands()

    loadSample()

    app.show(graphComponent)
  }

  /**
   * Runs a {@link TableLayout} or a {@link ThreeTierLayout} depending on the selected sample.
   */
  function runLayout() {
    setUIDisabled(true)

    const selectedLayout = document.getElementById('select-sample').value.substring(8)
    const fromSketch = document.getElementById('from-sketch').checked

    let layout
    let layoutData
    switch (selectedLayout) {
      case 'Table':
        layout = new TableLayout(fromSketch)
        layoutData = TableLayout.LAYOUT_DATA
        graphComponent
          .morphLayout(layout, '0.5s', layoutData)
          .then(() => {
            setUIDisabled(false)
          })
          .catch(error => {
            setUIDisabled(false)
            if (typeof window.reportError === 'function') {
              window.reportError(error)
            }
          })
        break
      case 'Three-Tier':
        layout = new ThreeTierLayout(fromSketch)
        layoutData = ThreeTierLayout.LAYOUT_DATA(graphComponent.graph, fromSketch)
        graphComponent
          .morphLayout(layout, '0.5s', layoutData)
          .then(() => {
            setUIDisabled(false)
          })
          .catch(error => {
            setUIDisabled(false)
            if (typeof window.reportError === 'function') {
              window.reportError(error)
            }
          })
        break
      default:
        setUIDisabled(false)
    }
  }

  /**
   * Initializes folding and default styles for the current graph.
   */
  function initializeGraph() {
    const manager = new yfiles.graph.FoldingManager()
    graphComponent.graph = manager.createFoldingView().graph
    const folderNodeConverter = manager.folderNodeConverter
    folderNodeConverter.copyFirstLabel = true
    folderNodeConverter.folderNodeSize = new yfiles.geometry.Size(80, 60)

    graphComponent.navigationCommandsEnabled = true

    DemoStyles.initDemoStyles(graphComponent.graph)
  }

  /**
   * Initializes the interactive behavior.
   */
  function initializeInputModes() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      showHandleItems: yfiles.graph.GraphItemTypes.NONE
    })
    inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy =
      yfiles.input.NodeAlignmentPolicy.TOP_LEFT
    inputMode.navigationInputMode.addGroupCollapsedListener(runLayout)
    inputMode.navigationInputMode.addGroupExpandedListener(runLayout)
    graphComponent.inputMode = inputMode
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

    app.bindChangeListener("select[data-command='SelectSample']", loadSample)

    app.bindAction("button[data-command='Reset']", loadSample)
    app.bindAction("button[data-command='Layout']", runLayout)
  }

  /**
   * Loads the table or three-tire.
   */
  function loadSample() {
    const filename = document.getElementById('select-sample').value.substring(8)
    const path = `resources/${filename}.graphml`

    const ioHandler = new yfiles.graphml.GraphMLIOHandler()
    app.readGraph(ioHandler, graphComponent.graph, path).then(() => {
      // adjust default size and style to match the first leaf in the loaded graph to have new nodes match the graph's
      // style
      const graph = graphComponent.graph
      const firstLeaf = graph.groupingSupport
        .getDescendants(null)
        .find(node => !graph.isGroupNode(node))
      if (firstLeaf) {
        graphComponent.graph.nodeDefaults.size = firstLeaf.layout.toSize()
        graphComponent.graph.nodeDefaults.style = firstLeaf.style
      }

      runLayout()
    })
  }

  /**
   * Enables/disables the buttons in the toolbar and the input mode. This is used for managing the toolbar during
   * layout calculation.
   * @param {boolean} disabled
   */
  function setUIDisabled(disabled) {
    document.getElementById('select-sample').disabled = disabled
    document.getElementById('reset').disabled = disabled
    document.getElementById('from-sketch').disabled = disabled
    document.getElementById('layout').disabled = disabled
  }

  // start the demo
  run()
})
