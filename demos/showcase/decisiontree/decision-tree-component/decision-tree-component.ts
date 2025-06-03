/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { DecisionTree } from './DecisionTree'
import { getRootNode, readSampleGraph, setAsRootNode } from '../editor-component/editor-component'
import {
  Command,
  type GraphComponent,
  type GraphEditorInputMode,
  type IGraph
} from '@yfiles/yfiles'
import { addNavigationButtons } from '@yfiles/demo-resources/demo-page'
import './decision-tree.css'

let decisionTree: DecisionTree | null

/**
 * Initializes the decision tree component.
 * Wires-up the buttons in the toolbar of the decision tree component.
 * @param graphComponent the editor graph component
 */
export function initializeDecisionTreeComponent(graphComponent: GraphComponent): void {
  document.querySelector<HTMLButtonElement>('#restart')!.addEventListener('click', () => {
    showDecisionTree(graphComponent.graph)
  })
  bindCommand('INCREASE_ZOOM_DECISION_TREE', Command.INCREASE_ZOOM)
  bindCommand('DECREASE_ZOOM_DECISION_TREE', Command.DECREASE_ZOOM)

  document
    .querySelector<HTMLButtonElement>("button[data-command='FIT_GRAPH_BOUNDS']")!
    .addEventListener('click', async () => {
      await graphComponent.fitGraphBounds()
    })

  bindCommand('ZOOM_ORIGINAL_DECISION_TREE', Command.ZOOM, 1)

  // add the sample graphs
  const samples = document.querySelector<HTMLSelectElement>('#samples')!
  ;['cars', 'what-to-do', 'quiz'].forEach((graph) => {
    const option = document.createElement('option')
    option.text = graph
    option.value = graph
    samples.add(option)
  })
  addNavigationButtons(samples).addEventListener('change', async () => {
    setAsRootNode(graphComponent, undefined)
    await readSampleGraph(graphComponent)
    showDecisionTree(graphComponent.graph)
  })
}

/**
 * Creates a new decision tree based on the given graph.
 */
export function showDecisionTree(graph: IGraph): void {
  hideDecisionTree()
  try {
    // create a new decision tree with the current graph and display it in the DOM
    const decisionTreeContainer = document.querySelector<HTMLDivElement>('#decision-tree')!
    decisionTree = new DecisionTree(
      graph,
      decisionTreeContainer,
      getRootNode(),
      setLayoutRunning,
      setLayoutRunning
    )
  } catch {
    alert(
      'No suitable root node found. The root node is a node with no incoming edges, if not specified explicitly.'
    )
  }
}

/**
 * Disposes and hides the decision tree.
 */
export function hideDecisionTree(): void {
  if (decisionTree) {
    // dispose the old decision tree
    decisionTree.dispose()
    decisionTree = null
  }
}

/**
 * Updates the demo's UI depending on whether a layout is currently calculated.
 * @param running true indicates that a layout is currently calculated
 * @param graphComponent the decision tree graph component
 */
function setLayoutRunning(running: boolean, graphComponent: GraphComponent): void {
  ;(graphComponent.inputMode as GraphEditorInputMode).waitInputMode.waiting = running
  document
    .querySelectorAll<HTMLInputElement>('#decision-tree-toolbar Button,Select')
    .forEach((element) => {
      element.disabled = running
    })
}

/**
 * Binds the given command and command parameter to the {@link HTMLButtonElement} that matches the
 * given <code>data-command</code> name in the decision tree's toolbar.
 */
function bindCommand(name: string, command: Command, parameter: number | null = null): void {
  document
    .querySelector<HTMLButtonElement>(`#decision-tree-toolbar button[data-command='${name}']`)!
    .addEventListener('click', () => {
      if (decisionTree) {
        decisionTree.graphComponent.executeCommand(command, parameter)
      }
    })
}
