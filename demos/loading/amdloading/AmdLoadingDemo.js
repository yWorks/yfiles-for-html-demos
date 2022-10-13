/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  packages: [
    {
      name: 'yfiles-umd',
      location: '../../node_modules/yfiles-umd',
      main: 'complete'
    }
  ]
})

// note that requirejs does not allow async functions as require/define callbacks
require(['yfiles-umd/view-component'], /** @param {yfiles} yfiles */ yfiles => {
  const { GraphComponent, ShapeNodeStyle, PolylineEdgeStyle, ICommand, License } = yfiles

  let graphComponent = null

  function run(licenseData) {
    License.value = licenseData

    graphComponent = new GraphComponent('graphComponent')
    const graph = graphComponent.graph
    graphComponent.graph.undoEngineEnabled = true

    // set a nice default style
    graph.nodeDefaults.style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: '#ff6c00',
      stroke: '1.5px #662b00'
    })
    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: `1.5px #662b00`,
      targetArrow: `#662b00 small triangle`
    })

    // create small sample graph
    const node1 = graph.createNode([50, 50, 30, 30])
    const node2 = graph.createNode([0, 150, 30, 30])
    const node3 = graph.createNode([100, 150, 30, 30])
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)

    // center graph
    graphComponent.fitGraphBounds()

    registerCommands()

    // load the input module and set the input editor
    require(['yfiles-umd/view-editor'], () => {
      const { GraphEditorInputMode } = yfiles
      graphComponent.inputMode = new GraphEditorInputMode()
    })
  }

  function registerCommands() {
    function bindCommand(selector, command, parameter = null) {
      const element = document.querySelector(selector)
      command.addCanExecuteChangedListener(() => {
        if (command.canExecute(parameter, graphComponent)) {
          element.removeAttribute('disabled')
        } else {
          element.setAttribute('disabled', 'disabled')
        }
      })
      element.addEventListener('click', () => {
        if (command.canExecute(parameter, graphComponent)) {
          command.execute(parameter, graphComponent)
        }
      })
    }

    bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS)
    bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM)
    bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM)
    bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, 1.0)

    bindCommand("button[data-command='Cut']", ICommand.CUT)
    bindCommand("button[data-command='Copy']", ICommand.COPY)
    bindCommand("button[data-command='Paste']", ICommand.PASTE)
    bindCommand("button[data-command='Delete']", ICommand.DELETE)

    bindCommand("button[data-command='Undo']", ICommand.UNDO)
    bindCommand("button[data-command='Redo']", ICommand.REDO)

    document.querySelector("button[data-command='Layout']").addEventListener('click', applyLayout)
  }

  function applyLayout() {
    require(['yfiles-umd/layout-hierarchic', 'yfiles-umd/view-layout-bridge'], () => {
      const { HierarchicLayout, MinimumNodeSizeStage } = yfiles
      const layoutButton = document.getElementById('layoutButton')
      layoutButton.disabled = true
      const layout = new MinimumNodeSizeStage(new HierarchicLayout())
      graphComponent
        .morphLayout(layout, '1s')
        .catch(error => {
          if (typeof window.reportError === 'function') {
            reportError(error)
          } else {
            throw error
          }
        })
        .finally(() => {
          layoutButton.disabled = false
        })
    })
  }

  // start demo
  fetch('../../../lib/license.json')
    .then(response => response.json())
    .then(run)
})
