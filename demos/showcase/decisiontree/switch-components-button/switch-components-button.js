/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  hideDecisionTree,
  showDecisionTree
} from '../decision-tree-component/decision-tree-component.js'
import './switch-components-button.css'

/**
 * The div element representing a button that toggles between the decision tree and the editor graph.
 */
const switchComponentsButton = document.querySelector('#toggle-decision-tree-button')

/**
 * Wires up the button that toggles between the decision tree and the editor graph.
 * @yjs:keep = contains
 * @param {!GraphComponent} graphComponent
 */
export function initializeSwitchButton(graphComponent) {
  switchComponentsButton.addEventListener('click', () => {
    if (switchComponentsButton.classList.contains('disabled')) {
      return
    }
    if (switchComponentsButton.classList.contains('decision-tree')) {
      showEditorComponent(graphComponent)
    } else {
      showDecisionTreeComponent(graphComponent)
    }
    updateButtonState(graphComponent)
  })
}

/**
 * Shows the editor graph and hides the decision tree.
 * @param {!GraphComponent} graphComponent
 */
function showEditorComponent(graphComponent) {
  hideDecisionTree()

  document.getElementById('graphComponent').classList.remove('hidden')
  document.getElementById('editor-toolbar').classList.remove('hidden')
  document.getElementById('decision-tree').classList.add('hidden')
  document.getElementById('decision-tree-toolbar').classList.add('hidden')

  switchComponentsButton.classList.remove('decision-tree')

  // ensure the model graph is completely visible
  graphComponent.fitGraphBounds()
}

/**
 * Shows the decision tree and hides the editor graph.
 * @param {!GraphComponent} graphComponent
 */
function showDecisionTreeComponent(graphComponent) {
  document.getElementById('graphComponent').classList.add('hidden')
  document.getElementById('editor-toolbar').classList.add('hidden')
  document.getElementById('decision-tree').classList.remove('hidden')
  document.getElementById('decision-tree-toolbar').classList.remove('hidden')

  switchComponentsButton.classList.add('decision-tree')

  showDecisionTree(graphComponent.graph)
}

/**
 * Enables/disables the button to toggle two components: decision tree and editor graph.
 * The button gets disabled if the graph is empty or just has group nodes in it.
 * @yjs:keep = contains
 * @param {!GraphComponent} graphComponent
 */
export function updateButtonState(graphComponent) {
  const graph = graphComponent.graph
  const activeDecisionTree = switchComponentsButton.classList.contains('decision-tree')
  if (activeDecisionTree) {
    switchComponentsButton.classList.remove('disabled')
    switchComponentsButton.title = 'Edit Decision Tree Graph'
  } else if (graph.nodes.size > 0 && graph.nodes.some((node) => !graph.isGroupNode(node))) {
    switchComponentsButton.classList.remove('disabled')
    switchComponentsButton.title = 'Show Decision Tree'
  } else {
    switchComponentsButton.classList.add('disabled')
    switchComponentsButton.title = 'Graph is empty'
  }
}
