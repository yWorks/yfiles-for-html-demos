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
import { FoldingEdgeStateId, type FoldingManager, type IGraph } from 'yfiles'

/**
 * Applies the given graph's default styles to the graph's items.
 */
export function applyDefaultStyles(graph: IGraph): void {
  const foldingView = graph.foldingView
  if (foldingView) {
    applyDefaultStylesAndUpdateFoldingStates(foldingView.manager)
  } else {
    applyDefaultStylesImpl(graph)
  }
}

/**
 * Applies the default styles of the manager's master graph to the master graph's items as well as
 * to all the manager's folding states.
 */
function applyDefaultStylesAndUpdateFoldingStates(foldingManager: FoldingManager): void {
  const graph = foldingManager.masterGraph
  applyDefaultStylesImpl(graph)

  const groupLabelDefaults = graph.groupNodeDefaults.labels
  const groupPortDefaults = graph.groupNodeDefaults.ports

  for (const node of graph.nodes) {
    if (graph.isGroupNode(node) && foldingManager.hasFolderNodeState(node)) {
      const state = foldingManager.getFolderNodeState(node)
      state.style = node.style
      for (const foldedLabel of state.labels) {
        foldedLabel.style = groupLabelDefaults.getStyleInstance(node)
      }
      for (const foldedPort of state.ports) {
        foldedPort.style = groupPortDefaults.getStyleInstance(node)
      }
    }
  }

  const edgeLabelDefaults = graph.edgeDefaults.labels

  for (const edge of graph.edges) {
    const source = edge.sourceNode
    const target = edge.targetNode
    if (graph.getParent(source!) != null || graph.getParent(target!) != null) {
      for (let tmpSource = source; tmpSource; tmpSource = graph.getParent(tmpSource)) {
        for (let tmpTarget = target; tmpTarget; tmpTarget = graph.getParent(tmpTarget)) {
          const stateId = new FoldingEdgeStateId(
            edge,
            tmpSource,
            tmpSource !== source,
            tmpTarget,
            tmpTarget !== target
          )

          if (foldingManager.hasFoldingEdgeState(stateId)) {
            const state = foldingManager.getFoldingEdgeState(stateId)
            state.style = edge.style
            for (const foldedLabel of state.labels) {
              foldedLabel.style = edgeLabelDefaults.getStyleInstance(edge)
            }
            state.sourcePort.style = edge.sourcePort!.style
            state.targetPort.style = edge.targetPort!.style
          }
        }
      }
    }
  }
}

/**
 * Applies the given graph's default styles to the graph's items.
 */
function applyDefaultStylesImpl(graph: IGraph): void {
  for (const item of graph.nodes) {
    graph.setStyle(
      item,
      graph.isGroupNode(item)
        ? graph.groupNodeDefaults.getStyleInstance()
        : graph.nodeDefaults.getStyleInstance()
    )
  }
  for (const item of graph.nodeLabels) {
    graph.setStyle(item, graph.nodeDefaults.labels.getStyleInstance(item.owner!))
  }
  for (const item of graph.edges) {
    graph.setStyle(item, graph.edgeDefaults.getStyleInstance())
  }
  for (const item of graph.edgeLabels) {
    graph.setStyle(item, graph.edgeDefaults.labels.getStyleInstance(item.owner!))
  }
  for (const item of graph.ports) {
    graph.setStyle(item, graph.nodeDefaults.ports.getStyleInstance(item.owner!))
  }
  // There are no ports at edges, and no labels at ports in this demo
}
