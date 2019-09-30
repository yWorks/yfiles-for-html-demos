/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
    yfiles: '../../../lib/umd/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require(['yfiles/view-component'], async (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run(licenseData) {
    yfiles.lang.License.value = licenseData

    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph
    graphComponent.graph.undoEngineEnabled = true

    // load the input module and set the input editor
    require(['yfiles/view-editor'], () => {
      graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()
    })

    // set a nice default style
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      fill: 'orange',
      stroke: 'orange',
      shape: 'rectangle'
    })
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      targetArrow: yfiles.styles.IArrow.DEFAULT
    })

    // create small sample graph
    const node1 = graph.createNode(new yfiles.geometry.Rect(50, 50, 30, 30))
    const node2 = graph.createNode(new yfiles.geometry.Rect(0, 150, 30, 30))
    const node3 = graph.createNode(new yfiles.geometry.Rect(100, 150, 30, 30))
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)

    // center graph
    graphComponent.fitGraphBounds()

    registerCommands()
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    function bindCommand(selector, command, parameter = null) {
      const element = document.querySelector(selector)
      command.addCanExecuteChangedListener(() => {
        if (command.canExecute(parameter, graphComponent)) {
          element.removeAttribute('disabled')
        } else {
          element.setAttribute('disabled', 'disabled')
        }
      })
      element.addEventListener('click', e => {
        if (command.canExecute(parameter, graphComponent)) {
          command.execute(parameter, graphComponent)
        }
      })
    }

    bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS)
    bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM)
    bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM)
    bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, 1.0)

    bindCommand("button[data-command='Cut']", iCommand.CUT)
    bindCommand("button[data-command='Copy']", iCommand.COPY)
    bindCommand("button[data-command='Paste']", iCommand.PASTE)
    bindCommand("button[data-command='Delete']", iCommand.DELETE)

    bindCommand("button[data-command='Undo']", iCommand.UNDO)
    bindCommand("button[data-command='Redo']", iCommand.REDO)

    document
      .querySelector("button[data-command='Layout']")
      .addEventListener('click', applyLayout.bind(this))
  }

  function applyLayout() {
    // eslint-disable-next-line global-require
    require(['yfiles/layout-hierarchic', 'yfiles/view-layout-bridge'], async () => {
      const layoutButton = document.getElementById('layoutButton')
      layoutButton.disabled = true
      const layout = new yfiles.layout.MinimumNodeSizeStage(
        new yfiles.hierarchic.HierarchicLayout()
      )
      try {
        await graphComponent.morphLayout(layout, '1s')
      } catch (error) {
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        } else {
          throw error
        }
      } finally {
        layoutButton.disabled = false
      }
    })
  }

  // start demo
  const response = await fetch('../../../lib/license.json')
  const json = await response.json()
  run(json)
})
