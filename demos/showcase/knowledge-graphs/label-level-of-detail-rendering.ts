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
  type GraphComponent,
  IEdge,
  type IEnumerable,
  type IGraph,
  type ILabel,
  INode
} from '@yfiles/yfiles'
import { getLabelTag } from './types'
import { getLabelStyle } from './styles/graph-styles'

/**
 * Configuration for label visibility at different zoom levels.
 */
export type LabelConfig = { threshold: number; predicate: (label: ILabel) => boolean }
/** Zoom threshold below which node text labels are hidden. */
export const nodeLabelThreshold = 0.2

/**
 * Zoom threshold below which node icon labels are hidden.
 */
export const nodeIconLabelThreshold = 0.1

/**
 * Zoom threshold below which edge labels are hidden.
 */
export const edgeLabelThreshold = 0.5

/**
 * Label visibility configurations for different label types.
 *
 * Defines zoom thresholds and filtering criteria for:
 * - Node text labels
 * - Node icon labels
 * - Edge labels
 */
const labelVisibilityConfigs: Record<string, LabelConfig> = {
  text: {
    threshold: nodeLabelThreshold,
    predicate: (label) => label.owner instanceof INode && getLabelTag(label).type === 'text'
  },
  icon: {
    threshold: nodeIconLabelThreshold,
    predicate: (label) => label.owner instanceof INode && getLabelTag(label).type === 'icon'
  },
  edge: { threshold: edgeLabelThreshold, predicate: (label) => label.owner instanceof IEdge }
}

/**
 * Toggles label visibility and updates its styling.
 *
 * @param graph - The graph containing the label
 * @param labels - The labels to toggle
 * @param visible - Whether the label should be visible
 */
export function toggleLabelVisibility(
  graph: IGraph,
  labels: IEnumerable<ILabel>,
  visible: boolean
): void {
  labels.forEach((label) => {
    const tag = getLabelTag(label)
    if (tag.visible !== visible) {
      tag.visible = visible
      graph.setStyle(label, getLabelStyle(label))
    }
  })
}

/**
 * Configures automatic label visibility based on zoom level.
 *
 * As the user zooms in and out, labels are shown or hidden based on their type
 * and configured zoom thresholds.
 *
 * @param graphComponent - The graph component to configure
 */
export function configureLevelOfDetailRendering(graphComponent: GraphComponent): void {
  graphComponent.addEventListener('zoom-changed', () => {
    const zoom = graphComponent.zoom
    const graph = graphComponent.graph

    Object.entries(labelVisibilityConfigs).forEach(([_type, config]) => {
      const shouldHide = zoom < config.threshold
      const labels = graph.labels.filter(config.predicate)
      toggleLabelVisibility(graph, labels, !shouldHide)
    })
  })
}
