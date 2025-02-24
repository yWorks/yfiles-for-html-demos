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
import NodeTypePanel from '@yfiles/demo-utils/NodeTypePanel'
import { colorSets, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import type { GraphComponent, INode } from '@yfiles/yfiles'
import type { ColorSetName } from '@yfiles/demo-resources/demo-colors'
import type { MultiPageNodeType } from './resources/SampleData'

/**
 * The color sets for the eight different node types.
 */
export const nodeTypeColors: ColorSetName[] = [
  'demo-palette-21',
  'demo-palette-22',
  'demo-palette-23',
  'demo-palette-15',
  'demo-palette-25',
  'demo-palette-11',
  'demo-palette-12',
  'demo-palette-14'
]

/**
 * Gets the type of the given node by querying it from the node's tag.
 */
export function getNodeType(node: INode): number {
  return (node.tag as MultiPageNodeType | undefined | null)?.type ?? 0
}

/**
 * Sets the type for the given node by updating the node's tag and the according style.
 * This function is invoked when the type of node is changed via the type panel.
 */
export function setNodeType(node: INode, type: number): void {
  // set a new tag and style so that this change is easily undo-able
  node.tag = { type: type }
}

/**
 * Initializes the context menu for changing a node's type.
 */
export function initializeTypePanel(graphComponent: GraphComponent): NodeTypePanel {
  const graph = graphComponent.graph
  const typePanel = new NodeTypePanel(graphComponent, nodeTypeColors, colorSets)
  typePanel.nodeTypeChanged = (node, newType): void => {
    setNodeType(node, newType)
    graph.setStyle(node, createDemoNodeStyle(nodeTypeColors[newType]))
  }

  // update the nodes whose types will be changed on selection change events
  graphComponent.selection.addEventListener(
    'item-added',
    () =>
      (typePanel.currentItems = graphComponent.selection.nodes
        .filter((n) => !graph.isGroupNode(n))
        .toArray())
  )

  return typePanel
}
