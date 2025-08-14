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
  Arrow,
  Color,
  DelegatingEdgeStyle,
  DelegatingNodeStyle,
  Fill,
  IArrow,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Stroke
} from '@yfiles/yfiles'
import { getTag } from './demo-types'
import { useDirectedEdges } from './ui/ui-utils'

/**
 * An extended node which chooses the colors of the node's
 * stroke and fill depending on the information in the tag.
 */

export class TagColoredShapeNodeStyle extends DelegatingNodeStyle {
  delegatingStyle = new ShapeNodeStyle({ shape: 'ellipse' })

  getStyle(node) {
    this.delegatingStyle.fill = this.getFill(node)
    this.delegatingStyle.stroke = this.getStroke(node)
    return this.delegatingStyle
  }

  getFill(node) {
    const tag = getTag(node)
    if (tag?.type === 'start' || tag?.type === 'end') {
      return Color.WHITE
    }

    const componentColor = getDisplayedComponentColor(node)
    return componentColor != null ? Fill.from(componentColor) : Color.LIGHT_GRAY
  }

  getStroke(node) {
    const tag = getTag(node)
    const highlighted = isHighlighted(node)
    const highlightedStrokeWidth = highlighted ? 6 : 4

    // first check if the node is a start or end node for the algorithm
    if (tag?.type === 'start') {
      return Stroke.from(`${highlightedStrokeWidth}px #9acd32`)
    } else if (tag?.type === 'end') {
      return Stroke.from(`${highlightedStrokeWidth}px #cd5c5c`)
    }

    const componentColor = getDisplayedComponentColor(node)
    if (componentColor == null) {
      // if the edge doesn't belong to a component, render it grey
      return Stroke.from(`3px darkgrey`)
    }
    return highlighted ? new Stroke(componentColor, highlightedStrokeWidth) : null
  }
}

/**
 * An extended {@link PolylineEdgeStyle} which chooses the color and width of the edge's
 * stroke depending on the information in the tag.
 */
export class TagColoredPolylineEdgeStyle extends DelegatingEdgeStyle {
  static arrowCache = new Map().set('none', IArrow.NONE)
  delegatingStyle = new PolylineEdgeStyle()

  getStyle(edge) {
    this.delegatingStyle.stroke = this.getStroke(edge)
    this.delegatingStyle.targetArrow = this.getTargetArrow(edge)
    return this.delegatingStyle
  }

  getStroke(edge) {
    const componentColor = getDisplayedComponentColor(edge)
    if (componentColor == null) {
      // if the edge doesn't belong to a component, render it grey
      return Stroke.from('3px darkgrey')
    }
    return new Stroke(componentColor, isHighlighted(edge) ? 8 : 5)
  }

  getTargetArrow(edge) {
    const directed = useDirectedEdges()
    if (!directed) {
      return IArrow.NONE
    }

    const highlighted = isHighlighted(edge)
    const componentColor = getDisplayedComponentColor(edge) ?? 'darkgrey'
    const strokeWidth = highlighted ? 5 : 1
    return TagColoredPolylineEdgeStyle.getArrow(componentColor, strokeWidth)
  }

  /**
   * Returns an arrow with the given color and stroke width. Either returns
   * a cached version if such an arrow already exists or creates and caches
   * a new instance.
   */
  static getArrow(color, strokeWidth) {
    const arrowMapKey = `${color}-${strokeWidth}`
    let arrow = this.arrowCache.get(arrowMapKey)
    if (!arrow) {
      arrow = new Arrow({
        fill: color,
        stroke: `${strokeWidth}px ${color}`,
        type: 'triangle',
        widthScale: 1.5
      })
      this.arrowCache.set(arrowMapKey, arrow)
    }
    return arrow
  }
}

/**
 * Checks whether the given item is part of a highlighted component.
 */
function isHighlighted(item) {
  const tag = getTag(item)
  return tag?.highlightedComponent !== undefined
}

/**
 * Returns the color for the displayed component of the given item.
 */
function getDisplayedComponentColor(item) {
  const tag = getTag(item)
  if (tag) {
    const displayedComponent = tag.highlightedComponent ?? tag.components.at(0)
    return getColorForComponent(displayedComponent, tag.gradient)
  }
  return undefined
}

/**
 * A set of colors that can be applied to components of nodes and edges.
 */
const colors = [
  '#4281a4',
  '#ff6c00',
  '#56926e',
  '#db3a34',
  '#242265',
  '#f0c808',
  '#6c4f77',
  '#e0e04f',
  '#2d4d3a',
  '#6dbc8d',
  '#ffc914',
  '#76b041',
  '#ff6c00',
  '#17bebb',
  '#76b041'
]

/** The color at the end of the gradient (#242265, rgb(36,34,101)) */
const gradientStart = [36, 34, 101]
/** The color at the end of the gradient (#17bebb, rgb(23,190,187)) */
const gradientEnd = [23, 190, 187]

/**
 * Returns the color for the given component.
 * Colors are represented like this: "rbg(r,g,b)".
 * @param componentId The id of the component.
 * @param gradient A normalized value between 0 and 1 that describes the position in the gradient
 * @returns The color for the component.
 */
export function getColorForComponent(componentId, gradient) {
  if (componentId === undefined && gradient === undefined) {
    // there is neither a component nor a gradient
    return undefined
  }

  if (gradient === undefined) {
    // there is no gradient -> choose a color from the list
    return colors[componentId % colors.length]
  }

  // return the color from the gradient
  const [r1, g1, b1] = gradientStart
  const [r2, g2, b2] = gradientEnd
  const r = Math.round(r1 * (1 - gradient) + r2 * gradient)
  const g = Math.round(g1 * (1 - gradient) + g2 * gradient)
  const b = Math.round(b1 * (1 - gradient) + b2 * gradient)
  return `rgb(${r},${g},${b})`
}
