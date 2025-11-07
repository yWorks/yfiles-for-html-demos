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
import {
  AdjacencyTypes,
  type CreateEdgeInputMode,
  type GraphComponent,
  GraphEditorInputMode,
  IHitTestable,
  INode,
  ShapeNodeStyle,
  ShowPortCandidates,
  Stroke
} from '@yfiles/yfiles'
import { LayerColors, type SubtreePlacerPanel } from './SubtreePlacerPanel'

/**
 * Initializes interactive behavior
 */
export function initializesInputMode(
  graphComponent: GraphComponent,
  subtreePlacerPanel: SubtreePlacerPanel,
  layoutCallback: (arg0: boolean) => Promise<void>
): void {
  // create a new GraphEditorInputMode
  const inputMode = new GraphEditorInputMode({
    // disable label editing on double click, so it won't interfere with toggling the node's assistant marking
    allowEditLabelOnDoubleClick: false,
    // disabled clipboard and undo operations
    allowClipboardOperations: false,
    allowUndoOperations: false,
    // forbid node creation and allow only node deletion to maintain the tree-structure
    allowCreateNode: false,
    selectableItems: 'node',
    deletableItems: 'node',
    focusableItems: 'none',
    createEdgeInputMode: { priority: 45 },
    // forbid moving unselected items
    moveUnselectedItemsInputMode: { enabled: false }
  })

  // always delete the whole subtree
  inputMode.addEventListener('deleting-selection', (evt) => {
    const selectedNodes = evt.selection
    const nodesToDelete: INode[] = []
    selectedNodes.forEach((selectedNode) => {
      collectSubtreeNodes(graphComponent, selectedNode as INode, nodesToDelete)
    })
    nodesToDelete.forEach((node) => {
      if (graphComponent.graph.inDegree(node)) {
        evt.selection.add(node)
      } else {
        // do not delete the root node to be able to build a new tree
        evt.selection.remove(node)
      }
    })
  })
  // update the layout and the settings panel when nodes are deleted
  inputMode.addEventListener('deleted-selection', async () => await layoutCallback(false))

  // run a layout every time a node/bend is dragged or a node is resized
  inputMode.moveSelectedItemsInputMode.addEventListener(
    'drag-finished',
    async () => await layoutCallback(false)
  )
  inputMode.handleInputMode.addEventListener(
    'drag-finished',
    async () => await layoutCallback(false)
  )

  // update the settings panel when selection changed to be able to edit its subtree placer
  inputMode.addEventListener(
    'multi-selection-finished',
    async (evt) =>
      await subtreePlacerPanel.onNodeSelectionChanged(evt.selection.ofType(INode).toArray())
  )

  // toggle the assistant marking for the double-clicked node
  inputMode.addEventListener('item-double-clicked', async (evt) => {
    if (evt.item instanceof INode) {
      const node = evt.item
      node.tag.assistant = !node.tag.assistant
      const nodeStyle = node.style.clone()
      ;(nodeStyle as ShapeNodeStyle).stroke = node.tag.assistant
        ? new Stroke({ fill: 'black', thickness: 2, dashStyle: 'dash' })
        : null
      graphComponent.graph.setStyle(node, nodeStyle)
      await layoutCallback(false)
    }
  })

  // labels may influence the order of child nodes, if they are changed a new layout should be calculated
  inputMode.addEventListener('label-added', async (evt) => {
    if (!Number.isNaN(Number(evt.item.text))) {
      await layoutCallback(false)
    }
  })
  inputMode.editLabelInputMode.addEventListener('label-edited', async (evt) => {
    if (!Number.isNaN(Number(evt.item.text))) {
      await layoutCallback(false)
    }
  })

  configureEdgeCreation(inputMode.createEdgeInputMode, graphComponent, layoutCallback)

  // assign the input mode to the graph component
  graphComponent.inputMode = inputMode
}

/**
 * Finds all nodes in the subtree rooted by the selected node and collects them in the given array.
 */
function collectSubtreeNodes(
  graphComponent: GraphComponent,
  selectedNode: INode,
  nodesToDelete: INode[]
): void {
  nodesToDelete.push(selectedNode)

  graphComponent.graph.outEdgesAt(selectedNode).forEach((outEdge) => {
    const target = outEdge.targetNode
    collectSubtreeNodes(graphComponent, target, nodesToDelete)
  })
}

/**
 * Modify edge creation to always create a new target node.
 */
function configureEdgeCreation(
  createEdgeInputMode: CreateEdgeInputMode,
  graphComponent: GraphComponent,
  layoutCallback: (arg0: boolean) => Promise<void>
): void {
  // never search for target ports
  createEdgeInputMode.endHitTestable = IHitTestable.NEVER
  // any location is a valid target location
  createEdgeInputMode.prematureEndHitTestable = IHitTestable.ALWAYS

  // ignore port candidates and don't show highlights:
  // we don't want to connect to existing nodes
  createEdgeInputMode.forceSnapToCandidate = false
  createEdgeInputMode.snapToEndCandidate = false
  createEdgeInputMode.showPortCandidates = ShowPortCandidates.NONE
  createEdgeInputMode.allowSelfLoops = false
  createEdgeInputMode.startOverCandidateOnly = false
  graphComponent.graph.decorator.nodes.highlightRenderer.hide()

  // display the new target node during edge creation
  // provide the default size
  createEdgeInputMode.previewGraph.nodeDefaults.size = graphComponent.graph.nodeDefaults.size
  // set the style according to the layer
  createEdgeInputMode.addEventListener('gesture-started', () => {
    const startNode = createEdgeInputMode.startPortCandidate!.owner as INode
    const endNode = createEdgeInputMode.previewEndNode
    const layer = getLayer(graphComponent, startNode) + 1
    endNode.tag = { layer: layer }
    const layerColor = LayerColors[layer % LayerColors.length]
    const style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: layerColor.stroke,
      fill: layerColor.fill
    })
    createEdgeInputMode.previewGraph.setStyle(endNode, style)
  })

  // let the EdgeCreator create a new target node and connect the new edge to it
  createEdgeInputMode.edgeCreator = (
    context,
    graph,
    sourcePortCandidate,
    _targetPortCandidate,
    previewEdge
  ) => {
    // copy the style from the dummy node
    const dummyTargetNode = createEdgeInputMode.previewEndNode
    const node = graph.createNode(
      dummyTargetNode.layout.toRect(),
      dummyTargetNode.style,
      dummyTargetNode.tag
    )
    // create a port at the center
    const targetPort = graph.addPort(node, createEdgeInputMode.previewEndNodePort.locationParameter)
    // create the edge from the source port candidate to the new node
    return graph.createEdge(sourcePortCandidate.createPort(context), targetPort, previewEdge.style)
  }

  // update layout and settings panel when an edge was created
  createEdgeInputMode.addEventListener('edge-created', async () => await layoutCallback(false))
}

function getLayer(graphComponent: GraphComponent, n: INode): number {
  let layer = 0
  let node = n
  while (true) {
    const inEdges = graphComponent.graph.edgesAt(node, AdjacencyTypes.INCOMING)
    if (inEdges.size == 0) {
      break
    }
    node = inEdges.first()!.sourcePort.owner as INode
    layer++
  }
  return layer
}
