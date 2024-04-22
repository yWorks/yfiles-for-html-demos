/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, GraphEditorInputMode, type IGraph, License } from 'yfiles'

// Register the license
const response = await fetch('./license.json')
License.value = await response.json()

// Initialize a graph component and enable interactive editing
const graphComponent = new GraphComponent('#graphComponent')
graphComponent.inputMode = new GraphEditorInputMode()

createSampleGraph(graphComponent.graph)

addUIElements(graphComponent)

/**
 * Creates the sample graph for this demo.
 */
function createSampleGraph(graph: IGraph) {
  graph.nodeDefaults.size = [60, 40]
  graph.addLabel(graph.createNodeAt([200, 200]), 'Node 1')
  graph.addLabel(graph.createNodeAt([400, 200]), 'Node 2')

  const nodes = graph.nodes.toArray()
  graph.createEdge(nodes[0], nodes[1])
}

/**
 * Adds UI elements to the demo.
 */
function addUIElements(graphComponent: GraphComponent) {
  const fitButton = document.createElement('button')
  fitButton.innerText = 'Fit content'
  fitButton.addEventListener('click', () => {
    graphComponent.fitGraphBounds()
  })

  document.querySelector('#actionsArea')!.append(fitButton)
}
