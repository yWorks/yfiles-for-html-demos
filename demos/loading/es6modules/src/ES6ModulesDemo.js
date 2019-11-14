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
/* eslint-disable import/no-unresolved,import/no-extraneous-dependencies */
import 'yfiles/view-layout-bridge'
import { TimeSpan } from 'yfiles/core'
import { GraphComponent, ICommand, Rect } from 'yfiles/view-component'
import { GraphEditorInputMode } from 'yfiles/view-editor'
import { MinimumNodeSizeStage } from 'yfiles/layout-core'
import { HierarchicLayout } from 'yfiles/layout-hierarchic'
import NodeStyle from './ES6ModuleNodeStyle.js'

// Instead of loading the license file with a <script> tag, you can inline the license data into your JavaScript
// sources like in this example. (Note that this is a non-functional license.)
// See the Developer's Guide section about Licensing for more information.
//
// import { License } from '../../../lib/es6-modules/yfiles/lang.js';
// License.value = {
//   company: 'yWorks GmbH',
//   date: '05/08/2012',
//   developer: 'Joe Average',
//   distribution: false,
//   domains: [
//     '*'
//   ],
//   fileSystemAllowed: true,
//   licensefileversion: '1.1',
//   localhost: true,
//   oobAllowed: true,
//   package: 'complete',
//   product: 'yFiles for HTML',
//   type: 'singledeveloper',
//   version: '2.1',
//   watermark: 'yFiles for HTML Development License',
//   key: '90b9a98e11c9923878b2c6403ac60efc60fbacdc'
// };

// Create a GraphComponent and enable interactive editing
const graphComponent = new GraphComponent('graphComponent')
graphComponent.inputMode = new GraphEditorInputMode()

// Set the default node style for new nodes
graphComponent.graph.nodeDefaults.style = new NodeStyle()

// Create small sample graph
const graph = graphComponent.graph
const node1 = graph.createNode(new Rect(50, 50, 30, 30))
const node2 = graph.createNode(new Rect(0, 150, 30, 30))
const node3 = graph.createNode(new Rect(100, 150, 30, 30))
graph.createEdge(node1, node2)
graph.createEdge(node1, node3)

// Enable undo and center the graph in the view
graphComponent.graph.undoEngineEnabled = true
graphComponent.fitGraphBounds()

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

const layoutButton = document.querySelector("button[data-command='Layout']")
layoutButton.addEventListener('click', applyLayout)

// Make the demo GUI visible
document.body.setAttribute('class', `${document.body.getAttribute('class')} loaded`)

/**
 * Applies a hierarchic layout to the graph.
 */
function applyLayout() {
  layoutButton.disabled = true
  graphComponent
    .morphLayout(new MinimumNodeSizeStage(new HierarchicLayout()), '1s')
    .then(() => {
      layoutButton.disabled = false
    })
    .catch(error => {
      layoutButton.disabled = false
      // If present, show the common demo error reporting dialog
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      }
    })
}

/**
 * Registers the given command with the specified HTML element.
 *
 * @param {string} selector The CSS selector that specifies the HTML element.
 * @param {ICommand} command The command to register.
 * @param {Object?} parameter An optional parameter of the command.
 */
function bindCommand(selector, command, parameter) {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }
  parameter = parameter || null
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
