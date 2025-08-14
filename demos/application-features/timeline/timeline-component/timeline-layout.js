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
  ILayoutGroupBoundsCalculator,
  Insets,
  LayoutGrid,
  LayoutStageBase,
  Rect,
  RecursiveGroupLayout,
  SequentialLayout,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutMode,
  TabularLayoutNodeDescriptor,
  TextRenderSupport
} from '@yfiles/yfiles'
import { getBucket } from './bucket-aggregation'

/**
 * Applies a RecursiveGroupLayout with a LayoutGrid to the managed graph.
 */
export function applyTimelineLayout(graphComponent, styling, zoom, minZoom, maxZoom) {
  const recursiveGroupLayout = new RecursiveGroupLayout({
    coreLayout: new TabularLayout({
      layoutMode: TabularLayoutMode.FIXED_SIZE,
      nodeLabelPlacement: 'ignore',
      defaultNodeDescriptor: new TabularLayoutNodeDescriptor({ verticalAlignment: 1 })
    })
  })

  const grid = new LayoutGrid({ rowCount: 1, columnCount: 31 })
  const layoutData = new TabularLayoutData({
    freeNodeComparator: (a, b) => {
      const tagA = a.tag
      const tagB = b.tag
      return (tagA.index ?? -1) - (tagB.index ?? -1)
    },
    nodeMargins: (item) => {
      const bucket = getBucket(item)
      const index = bucket.index ?? -1
      return new Insets(
        0,
        bucket.parent?.children.length === index + 1 ? 0 : 2,
        0,
        index === 0 ? 0 : 2
      )
    }
  })
  layoutData.layoutGridData.layoutGridCellDescriptors = () => grid.createDynamicCellDescriptor()

  recursiveGroupLayout.groupBoundsCalculator = ILayoutGroupBoundsCalculator.create(
    (graph, groupNode, children) => {
      let groupBounds = graph.getBounds(children, [])

      const tag = groupNode.tag
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
        groupBounds = new Rect(
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

  graphComponent.graph.applyLayout(
    new SequentialLayout(scaleBars, recursiveGroupLayout),
    layoutData
  )
}

/**
 * A {@link ILayoutStage} that scales the height of the bars so that they fit into the graph
 * components bounds.
 */
class BarScalingStage extends LayoutStageBase {
  maxHeight
  zoom
  constructor(maxHeight, zoom) {
    super()
    this.maxHeight = maxHeight
    this.zoom = zoom
  }

  applyLayoutImpl(graph) {
    let maxValue = 0
    graph.nodes.forEach((node) => {
      const tag = node.tag
      if (tag?.type === 'group' && tag.layer === this.zoom) {
        maxValue = Math.max(maxValue, tag.aggregatedValue)
      }
    })
    const scale = maxValue > 0 ? this.maxHeight / maxValue : 1
    graph.nodes.forEach((node) => {
      const tag = node.tag
      if (tag?.type === 'group') {
        node.layout.size = [node.layout.width, tag.aggregatedValue * scale]
      }
    })
  }
}
