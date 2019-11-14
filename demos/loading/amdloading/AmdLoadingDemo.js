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

/* eslint-disable global-require */

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
  'resources/demo-styles',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    graphComponent.graph.undoEngineEnabled = true

    // load the input module and set the input editor
    require(['yfiles/view-editor'], () => {
      graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()
    })

    // set a nice default style
    DemoStyles.initDemoStyles(graphComponent.graph)

    // create small sample graph
    const graph = graphComponent.graph
    const node1 = graph.createNode(new yfiles.geometry.Rect(50, 50, 30, 30))
    const node2 = graph.createNode(new yfiles.geometry.Rect(0, 150, 30, 30))
    const node3 = graph.createNode(new yfiles.geometry.Rect(100, 150, 30, 30))
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)

    // center graph
    graphComponent.fitGraphBounds()

    registerCommands()

    app.show(graphComponent)
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindAction("button[data-command='Layout']", applyLayout.bind(this))
  }

  function applyLayout() {
    // eslint-disable-next-line global-require
    require(['yfiles/layout-hierarchic', 'yfiles/view-layout-bridge'], () => {
      const layoutButton = document.getElementById('layoutButton')
      layoutButton.disabled = true
      const layout = new yfiles.layout.MinimumNodeSizeStage(
        new yfiles.hierarchic.HierarchicLayout()
      )
      graphComponent
        .morphLayout(layout, '1s')
        .then(() => {
          layoutButton.disabled = false
        })
        .catch(error => {
          layoutButton.disabled = false
          if (typeof window.reportError === 'function') {
            window.reportError(error)
          }
        })
    })
  }

  run()
})
