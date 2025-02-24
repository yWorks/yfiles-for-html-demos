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
import { InteractiveOrganicLayoutHelper } from '../../utils/InteractiveOrganicLayoutHelper'
import {} from '@yfiles/yfiles'
/**
 * Provides methods for configuring the interactive organic layout to
 * react to manual dragging of nodes.
 */
export class InteractiveOrganicLayoutInputHelper {
  graph
  layoutHelper
  constructor(graph, config) {
    this.graph = graph
    this.layoutHelper = new InteractiveOrganicLayoutHelper(graph, config)
  }
  /**
   * Starts the layout using {@link setInterval}. Can be used in a worker thread.
   */
  startInterval() {
    this.prepareStructureChanges()
    this.layoutHelper.startInterval()
  }
  /**
   * Configures the layout to react to the user starting to drag a node.
   */
  startDrag(draggedNode, draggedComponent) {
    this.layoutHelper.updateInertiaAndStressForAllNodes(0.8, 0.2)
    this.restartLayout(draggedNode, draggedComponent)
  }
  /**
   * Configures the layout to react to the user dragging a node.
   */
  drag(draggedNode, draggedComponent, delta = 0.5) {
    this.updateStressAndInertiaForOtherNodes(draggedNode, draggedComponent, delta)
    this.layoutHelper.fixNode(draggedNode, 1)
  }
  /**
   * Configures the layout to react to the user finishing to drag a node.
   */
  finishDrag(draggedNode, draggedComponent) {
    this.layoutHelper.fixNode(draggedNode, 1, 0)
    this.updateStressAndInertiaForOtherNodes(draggedNode, draggedComponent, -1)
  }
  /**
   * Registers the necessary listeners that react to structural changes to the graph like node/edge
   * addition/deletion so that the layout algorithm is updated accordingly.
   */
  prepareStructureChanges() {
    this.graph.addEventListener('node-created', (evt) => {
      // we want the node to animate, so we don't fix it.
      this.layoutHelper.addNode(evt.item, false)
    })
    this.graph.addEventListener('node-removed', () => {
      this.layoutHelper.removeNode()
    })
    this.graph.addEventListener('edge-created', (evt) => {
      this.layoutHelper.addEdge(evt.item)
    })
    this.graph.addEventListener('edge-removed', (evt) => {
      this.layoutHelper.removeEdge(evt.sourcePortOwner, evt.targetPortOwner)
    })
  }
  /**
   * When a node is first dragged, the interactive layout is restarted with
   * an updated graph structure.
   */
  restartLayout(draggedNode, draggedComponent) {
    this.drag(draggedNode, draggedComponent, 0.5)
    this.layoutHelper.warmupNodes()
    this.layoutHelper.fixNode(draggedNode)
  }
  /**
   * Allow the nodes of the moved component to move close to the dragged node.
   * @param draggedNode the node that will be dragged.
   * @param draggedComponent the nodes that belong to the dragged component
   * @param delta defines what stress to add to the nodes and what inertia to *remove* from the node.
   */
  updateStressAndInertiaForOtherNodes(draggedNode, draggedComponent, delta = 0.1) {
    for (const node of draggedComponent) {
      if (node !== draggedNode) {
        // allow the nodes of the moved component to move close to the dragged node
        this.layoutHelper.changeStress(node, delta)
        this.layoutHelper.changeInertia(node, -delta)
      }
    }
  }
}
