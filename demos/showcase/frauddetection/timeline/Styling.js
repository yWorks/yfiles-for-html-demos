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
import {
  DefaultLabelStyle,
  INodeInsetsProvider,
  Insets,
  InteriorStretchLabelModel,
  NodeStyleDecorationInstaller,
  ShapeNodeStyle
} from 'yfiles'
import { intervalsIntersect } from './Utilities.js'

/**
 * @typedef {Partial.<object>} LegendTextStyle
 */

/**
 * @typedef {Partial.<object>} LegendItemStyle
 */

/**
 * @typedef {Partial.<object>} TimeFrameStyle
 */

/**
 * @typedef {Partial.<object>} TimelineStyle
 */

/**
 * Default style values used when no other styling is defined.
 */
export const defaultStyling = {
  timeframe: { fill: '#ffd70044', stroke: '#ffa50044' },
  bars: { fill: 'lightgrey', stroke: 'transparent' },
  inTimeframeBars: { fill: 'grey', stroke: 'transparent' },
  barHover: { fill: 'transparent', stroke: 'slateblue' },
  barSelect: { fill: '#00008b', stroke: 'transparent' },
  sectionSelect: { fill: 'none', stroke: '#00008b' },
  legend: {
    even: { backgroundFill: '#b3cddb', textFill: 'white', font: 'bold 16px Arial' },
    odd: { backgroundFill: '#4281a4', textFill: 'white', font: 'bold 16px Arial' }
  }
}

/**
 * Manages the styling of the timeline component.
 */
export class Styling {
  defaultStyle
  inTimeframeStyle

  groupStyle
  groupStyleEven
  groupStyleOdd

  /**
   * @param {!GraphComponent} graphComponent
   * @param {!TimelineStyle} style
   */
  constructor(graphComponent, style) {
    this.style = style
    this.graphComponent = graphComponent
    const nodeDecorator = graphComponent.graph.decorator.nodeDecorator
    nodeDecorator.focusIndicatorDecorator.hideImplementation()
    nodeDecorator.highlightDecorator.hideImplementation()
    nodeDecorator.selectionDecorator.setFactory(
      (node) =>
        new NodeStyleDecorationInstaller({
          nodeStyle: graphComponent.graph.isGroupNode(node)
            ? new ShapeNodeStyle(style.sectionSelect ?? defaultStyling.sectionSelect)
            : new ShapeNodeStyle(style.barSelect ?? defaultStyling.barSelect),
          zoomPolicy: 'world-coordinates',
          margins: 2
        })
    )
    nodeDecorator.insetsProviderDecorator.setImplementation(
      INodeInsetsProvider.create(() => new Insets(0, 0, 0, 20))
    )

    this.defaultStyle = new ShapeNodeStyle({
      stroke: `1px solid ${this.style.bars?.stroke ?? defaultStyling.bars?.stroke}`,
      fill: this.style.bars?.fill ?? defaultStyling.bars?.fill
    })

    this.inTimeframeStyle = new ShapeNodeStyle({
      stroke: `1px solid ${
        this.style.inTimeframeBars?.stroke ?? defaultStyling.inTimeframeBars?.stroke
      }`,
      fill: this.style.inTimeframeBars?.fill ?? defaultStyling.inTimeframeBars?.fill
    })

    this.groupStyle = new ShapeNodeStyle({ fill: null, stroke: null })

    this.groupStyleEven = new DefaultLabelStyle({
      backgroundFill:
        this.style.legend?.even?.backgroundFill ?? defaultStyling.legend?.even?.backgroundFill,
      backgroundStroke: null,
      textFill: this.style.legend?.even?.textFill ?? defaultStyling.legend?.even?.textFill,
      font: this.style.legend?.even?.font ?? defaultStyling.legend?.even?.font,
      insets: 1,
      horizontalTextAlignment: 'center'
    })
    this.groupStyleOdd = this.groupStyleEven.clone()
    this.groupStyleOdd.backgroundFill =
      this.style.legend?.odd?.backgroundFill ?? defaultStyling.legend.odd.backgroundFill
    this.groupStyleOdd.textFill =
      this.style.legend?.odd?.textFill ?? defaultStyling.legend.odd.textFill
    this.groupStyleOdd.font = this.style.legend?.odd?.font ?? defaultStyling.legend.odd.font
  }

  /**
   * Applies the current styles to the current selection and highlight.
   * @param {!TimeInterval} undefined
   */
  updateStyles([startDate, endDate]) {
    const graph = this.graphComponent.graph

    for (const node of graph.nodes) {
      const bucket = node.tag
      if (graph.isGroupNode(node)) {
        graph.setStyle(node, this.groupStyle)
        const label = node.labels.at(0)
        if (label) {
          graph.setLabelLayoutParameter(label, InteriorStretchLabelModel.SOUTH)
          const isEven = bucket.indexInLayer % 2 === 0
          const style = isEven ? this.groupStyleEven : this.groupStyleOdd
          graph.setStyle(label, style)
        }
      } else {
        const isInTimeFrame = intervalsIntersect(bucket.start, bucket.end, startDate, endDate)
        const style = isInTimeFrame ? this.inTimeframeStyle : this.defaultStyle
        graph.setStyle(node, style)
      }
    }
  }
}
