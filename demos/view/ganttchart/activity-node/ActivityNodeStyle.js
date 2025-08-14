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
  Fill,
  IHandleProvider,
  IHighlightRenderer,
  INodeSnapResultProvider,
  IPortCandidateProvider,
  NodeStyleBase,
  NodeStyleIndicatorRenderer,
  PatternFill,
  Point,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  SvgVisual
} from '@yfiles/yfiles'
import { getFollowUpWidth, getLeadWidth } from '../gantt-utils'
import { ActivityNodePortCandidateProvider } from './ActivityNodePortCandidateProvider'
import { ActivityNodeHandleProvider } from './ActivityNodeHandleProvider'
import { ActivityNodeSnapResultProvider } from './ActivityNodeSnapResultProvider'
import { getActivity } from '../resources/data-model'

export const patternFill = createPatternFill()

/**
 * A node style for activity nodes that renders lead and follow-up time.
 * The visualization consists of a 'solid' part that shows the actual duration of the activity, and
 * two parts with hatch fill that show lead/follow-up time, if such time exists.
 */
export class ActivityNodeStyle extends NodeStyleBase {
  color
  constructor(color) {
    super()
    this.color = color
  }

  /**
   * Creates the visualization for the given node which contains a filled rectangle, and two
   * hatch fills for the lead/follow-up time, if any.
   */
  createVisual(context, node) {
    const { x, y, width, height } = node.layout
    const activity = getActivity(node)

    // create the container element
    const outerG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    outerG.setAttribute('color', this.color)
    outerG.classList.add('activity-node')

    // create the clipped container
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // get the width of the lead and follow-up decorations
    const leadWidth = getLeadWidth(activity)
    const followUpWidth = getFollowUpWidth(activity)

    // create the background rectangle
    g.appendChild(createRect(context, 0, 0, width, height, false, 'currentColor'))

    // create pattern rect
    g.appendChild(createRect(context, 0, 0, width, height, false, patternFill))

    // create the main rectangle
    const mainWidth = width - leadWidth - followUpWidth
    const mainBackground = createRect(context, leadWidth, 0, mainWidth, height, false, 'white')
    mainBackground.classList.add('activity-main')
    const mainRect = createRect(context, leadWidth, 0, mainWidth, height, false, 'currentColor')
    mainRect.classList.add('activity-main')
    mainRect.setAttribute('fill-opacity', '0.8')
    g.append(mainBackground, mainRect)

    const clipId = context.svgDefsManager.generateUniqueDefsId()
    const rectId = context.svgDefsManager.generateUniqueDefsId()
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    const clipRect = createRect(context, 0, 0, width, height, true)
    clipRect.id = rectId
    clipPath.append(clipRect)
    clipPath.id = clipId

    g.setAttribute('clip-path', `url(#${clipId})`)

    outerG.append(g, clipPath)

    // render outline by re-using the clip rectangle
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttribute('href', '#' + rectId)
    use.setAttribute('stroke', 'currentColor')
    outerG.append(use)

    // translate container to node position
    SvgVisual.setTranslate(outerG, x, y)

    // save node layout for later use in update
    return SvgVisual.from(outerG, {
      leadWidth: leadWidth,
      followUpWidth: followUpWidth,
      color: this.color,
      width: width
    })
  }

  /**
   * Updates the visual element for the node with the current data.
   */
  updateVisual(context, oldVisual, node) {
    const { x, y, width } = node.layout
    const activity = getActivity(node)

    // get the width of the lead and follow-up decorations
    const leadWidth = getLeadWidth(activity)
    const followUpWidth = getFollowUpWidth(activity)

    const cache = oldVisual.tag
    const outerG = oldVisual.svgElement

    SvgVisual.setTranslate(outerG, x, y)

    if (cache.color !== this.color) {
      outerG.setAttribute('color', this.color)
      cache.color = this.color
    }

    if (
      leadWidth !== cache.leadWidth ||
      followUpWidth !== cache.followUpWidth ||
      width !== cache.width
    ) {
      const mainWidth = width - leadWidth - followUpWidth

      for (const rect of outerG.getElementsByTagName('rect')) {
        if (rect.classList.contains('activity-main')) {
          // the main part
          rect.x.baseVal.value = leadWidth
          rect.width.baseVal.value = mainWidth
        } else {
          rect.width.baseVal.value = width
        }
      }

      cache.leadWidth = leadWidth
      cache.followUpWidth = followUpWidth
      cache.width = width
    }

    return oldVisual
  }

  /**
   * Overridden to switch off the default selection decoration.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lookup(node, type) {
    if (type === IHighlightRenderer) {
      return new NodeStyleIndicatorRenderer({
        nodeStyle: new ShapeNodeStyle({
          shape: ShapeNodeShape.PILL,
          stroke: '4px goldenrod',
          fill: null
        }),
        margins: 2
      })
    }
    if (type === IPortCandidateProvider) {
      return new ActivityNodePortCandidateProvider(node)
    }
    if (type === IHandleProvider) {
      return new ActivityNodeHandleProvider(node)
    }
    if (type === INodeSnapResultProvider) {
      return new ActivityNodeSnapResultProvider()
    }

    return super.lookup.call(this, node, type)
  }
}

function createRect(context, x, y, width, height, rounded, fill, stroke) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.width.baseVal.value = width
  rect.height.baseVal.value = height
  rect.x.baseVal.value = x
  rect.y.baseVal.value = y
  if (rounded) {
    rect.rx.baseVal.value = rect.ry.baseVal.value = height / 2
  }

  if (fill instanceof Fill) {
    fill.applyTo(rect, context)
  } else {
    rect.setAttribute('fill', fill ?? 'none')
  }

  if (stroke !== undefined) {
    rect.setAttribute('stroke', stroke)
  }

  return rect
}

/**
 * Creates a white hatch fill for the lead/follow-up time that can be overlaid on
 * top of the node color to get a striped effect.
 */
function createPatternFill() {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  const patternSize = 6
  path.setAttribute(
    'd',
    `M 0 ${patternSize / 2} ` +
      `l ${patternSize} ${-patternSize} ` +
      `M ${patternSize / 2} ${patternSize} ` +
      `l ${patternSize} ${-patternSize}`
  )
  path.setAttribute('stroke', 'white')
  path.setAttribute('stroke-width', '3')
  path.setAttribute('stroke-linecap', 'square')

  const fill = new PatternFill()
  fill.origin = Point.ORIGIN
  fill.content = new SvgVisual(path)
  fill.size = new Size(patternSize, patternSize)
  return fill
}
