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
  IComparer,
  ILayoutGroupBoundsCalculator,
  LayoutGraphAdapter,
  LayoutGraphUtilities,
  LayoutStageBase,
  NodeHalo,
  PartitionGrid,
  PartitionGridData,
  RecursiveGroupLayout,
  SequentialLayout,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutNodeLayoutDescriptor,
  TabularLayoutPolicy,
  TextRenderSupport
} from 'yfiles'
import { getBucket } from './bucket-aggregation.js'

/**
 * Applies a RecursiveGroupLayout with a PartitionGrid to the managed graph.
 * @template TDataItem
 * @param {!GraphComponent} graphComponent
 * @param {!Styling} styling
 * @param {number} zoom
 * @param {number} minZoom
 * @param {number} maxZoom
 */
export function applyTimelineLayout(graphComponent, styling, zoom, minZoom, maxZoom) {
  const recursiveGroupLayout = new RecursiveGroupLayout({
    coreLayout: new TabularLayout({
      nodeComparer: IComparer.create((a, b) => {
        const tagProvider = a.graph.getDataProvider(LayoutGraphAdapter.ORIGINAL_TAG_DP_KEY)
        const tagA = tagProvider.get(a)
        const tagB = tagProvider.get(b)
        return (tagA.index ?? -1) - (tagB.index ?? -1)
      }),
      layoutPolicy: TabularLayoutPolicy.FIXED_SIZE,
      considerNodeLabels: false,
      defaultNodeLayoutDescriptor: new TabularLayoutNodeLayoutDescriptor({
        verticalAlignment: 1
      })
    })
  })

  const layoutData = new TabularLayoutData({
    partitionGridData: new PartitionGridData({
      grid: new PartitionGrid({ rowCount: 1, columnCount: 31 })
    }),
    nodeHalos: (item) => {
      const bucket = getBucket(item)
      const index = bucket.index ?? -1
      return NodeHalo.create(
        0,
        index === 0 ? 0 : 2,
        0,
        bucket.parent?.children.length === index + 1 ? 0 : 2
      )
    }
  })

  recursiveGroupLayout.groupBoundsCalculator = ILayoutGroupBoundsCalculator.create(
    (graph, groupNode, children) => {
      const groupBounds = LayoutGraphUtilities.getBoundingBoxOfNodes(graph, children.nodes())

      const tagProvider = graph.getDataProvider(LayoutGraphAdapter.ORIGINAL_TAG_DP_KEY)
      const tag = tagProvider.get(groupNode)
      if (tag?.type === 'group' && tag.label != null) {
        const groupLabelSizeEven = TextRenderSupport.measureText(
          tag.label,
          styling.groupStyleEven.font
        )
        const groupLabelSizeOdd = TextRenderSupport.measureText(
          tag.label,
          styling.groupStyleOdd.font
        )
        const minWidth = Math.max(groupLabelSizeEven.width, groupLabelSizeOdd.width) + 10
        const minHeight = Math.max(groupLabelSizeEven.height, groupLabelSizeOdd.height) + 4
        groupBounds.setRect(
          groupBounds.x,
          groupBounds.y,
          Math.max(groupBounds.width, minWidth),
          groupBounds.height + minHeight
        )
      }

      return groupBounds
    }
  )

  const fontHeight = graphComponent.graph.nodeLabels.reduce((maxHeight, label) => {
    return Math.max(maxHeight, label.layout.bounds.height)
  }, 0)
  // calculate the maximum height for the bars by subtracting the height of the calendar labels and a small margin
  const maxHeight = graphComponent.size.height - (maxZoom - zoom + 1) * (fontHeight + 4) - 20
  const scaleBars = new BarScalingStage(maxHeight, zoom)

  const layout = new SequentialLayout({
    layouts: [scaleBars, recursiveGroupLayout]
  })

  graphComponent.graph.applyLayout(layout, layoutData)
}

/**
 * A {@link ILayoutStage} that scales the height of the bars so that they fit into the graph
 * components bounds.
 */
class BarScalingStage extends LayoutStageBase {
  /**
   * @param {number} maxHeight
   * @param {number} zoom
   */
  constructor(maxHeight, zoom) {
    super()
    this.zoom = zoom
    this.maxHeight = maxHeight
  }

  /**
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    const tagProvider = graph.getDataProvider(LayoutGraphAdapter.ORIGINAL_TAG_DP_KEY)

    let maxValue = 0
    graph.nodes.forEach((node) => {
      const tag = tagProvider.get(node)
      if (tag?.type === 'group' && tag.layer === this.zoom) {
        maxValue = Math.max(maxValue, tag.aggregatedValue)
      }
    })
    const scale = maxValue > 0 ? this.maxHeight / maxValue : 1
    graph.nodes.forEach((node) => {
      const tag = tagProvider.get(node)
      if (tag?.type === 'group') {
        graph.setSize(node, graph.getWidth(node), tag.aggregatedValue * scale)
      }
    })
  }
}
