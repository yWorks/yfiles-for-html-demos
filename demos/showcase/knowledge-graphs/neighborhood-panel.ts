/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CloneTypes,
  Color,
  GraphComponent,
  GraphCopier,
  IBend,
  IEdge,
  ILabel,
  type IModelItem,
  INode,
  IPort,
  NodeStyleIndicatorRenderer,
  Rect,
  ShapeNodeStyle,
  Stroke,
  WebGLGraphModelManager,
  type WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { getLabelStyle } from './styles/graph-styles'
import { getNodeTag } from './types'

/**
 * Creates and configures a GraphComponent to display a neighborhood view.
 */
export function createNeighborhoodView(): GraphComponent {
  const neighborhoodComponent = new GraphComponent('#neighborhood-graphComponent')
  neighborhoodComponent.graphModelManager = new WebGLGraphModelManager()
  neighborhoodComponent.minimumZoom = 0.01
  neighborhoodComponent.maximumZoom = 4

  // Initialize selection style
  neighborhoodComponent.graph.decorator.nodes.selectionRenderer.addFactory((node) => {
    const strokeColor = getNodeTag(node).problem
      ? '#ff4400'
      : Color.from((node.style as WebGLShapeNodeStyle).stroke.color)
    return new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({
        shape: 'rectangle',
        fill: 'none',
        stroke: new Stroke(strokeColor, 4)
      }),
      margins: 6,
      zoomPolicy: 'mixed'
    })
  })

  document.addEventListener('keydown', (e) => {
    const component = document.querySelector<HTMLDivElement>('#neighborhood-graphComponent')!
    if (e.key === 'Escape' && component.classList.contains('open')) {
      toggleNeighborhoodPanel(false)
    }
  })

  document
    .querySelector<HTMLButtonElement>('#neighborhood-close')
    ?.addEventListener('click', () => {
      toggleNeighborhoodPanel(false)
    })

  document.querySelector<HTMLDivElement>('.demo-page__toolbar')!.addEventListener('click', () => {
    toggleNeighborhoodPanel(false)
  })

  document
    .querySelector<HTMLDivElement>('#neighborhood-backdrop')!
    .addEventListener('click', () => toggleNeighborhoodPanel(false))

  return neighborhoodComponent
}

/**
 * Shows the neighborhood of the given node from the sourceComponent inside the targetComponent.
 *
 * @param sourceComponent - The GraphComponent to copy items from.
 * @param targetComponent - The GraphComponent to copy items into (displayed neighborhood).
 * @param node - The node whose neighborhood should be shown.
 */
export async function showNeighborhood(
  sourceComponent: GraphComponent,
  targetComponent: GraphComponent,
  node: INode
): Promise<void> {
  const srcGraph = sourceComponent.graph
  const tgtGraph = targetComponent.graph

  tgtGraph.clear()
  toggleNeighborhoodPanel(true)

  const nodesToCopy = new Set([node, ...srcGraph.neighbors(node)])

  // Filter edges that connect only nodes in our set
  const edgesToCopy = srcGraph.edges
    .filter((edge) => nodesToCopy.has(edge.sourceNode) && nodesToCopy.has(edge.targetNode))
    .toArray()

  // Merge nodes and edges into one collection
  const itemsToCopy = new Set<IModelItem>([...nodesToCopy, ...edgesToCopy])

  // Copy with predicate
  const graphCopier = new GraphCopier({ cloneTypes: CloneTypes.ALL })
  let selectedNode: INode
  graphCopier.copy({
    sourceGraph: srcGraph,
    targetGraph: tgtGraph,
    copyPredicate: (item) => shouldCopyItem(item, itemsToCopy),
    itemCopiedCallback: (original: IModelItem, copy: IModelItem) => {
      if (copy instanceof ILabel) {
        // Apply a label style suitable for the neighborhood view
        tgtGraph.setStyle(copy, getLabelStyle(original as ILabel, true))
      } else if (copy instanceof INode) {
        // Position copied node at the center of the target component for a nicer layout animation
        tgtGraph.setNodeLayout(
          copy,
          Rect.from([
            targetComponent.center.x,
            targetComponent.center.y,
            (original as INode).layout.width,
            (original as INode).layout.height
          ])
        )
        if (original === node) {
          // Select the corresponding node of the targetComponent
          selectedNode = copy
        }
      }
    }
  })
  targetComponent.selection.add(selectedNode!)
}

/**
 * Predicate used by the GraphCopier to determine which source items should be copied.
 *
 * @param item - The item being considered for copying.
 * @param itemsToCopy - A set containing nodes and edges selected for copying.
 * @returns true if the item should be copied into the target graph.
 */
function shouldCopyItem(item: IModelItem, itemsToCopy: Set<IModelItem>): boolean {
  if (item instanceof INode || item instanceof IEdge) {
    return itemsToCopy.has(item)
  } else if (item instanceof ILabel || item instanceof IPort || item instanceof IBend) {
    return itemsToCopy.has(item.owner)
  }
  return true
}

/**
 * Show or hide the neighborhood panel UI.
 * @param visible - True to open the panel, false to close it.
 */
export function toggleNeighborhoodPanel(visible: boolean): void {
  const neighborhoodPanel = document.querySelector<HTMLDivElement>('#neighborhood-panel')!
  const backdrop = document.querySelector<HTMLDivElement>('#neighborhood-backdrop')!
  if (visible) {
    neighborhoodPanel.classList.add('open')
    backdrop.style.display = 'block'
  } else {
    neighborhoodPanel.classList.remove('open')
    backdrop.style.display = 'none'
  }
}
