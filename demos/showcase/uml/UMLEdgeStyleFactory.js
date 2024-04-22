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
import { Arrow, ArrowType, DashStyle, Fill, PolylineEdgeStyle, Stroke } from 'yfiles'

/**
 * Static helpers class to create UML styles and provide methods to check for certain styles.
 * @returns {!PolylineEdgeStyle}
 */
export function createAssociationStyle() {
  return new PolylineEdgeStyle()
}

/**
 * @returns {!PolylineEdgeStyle}
 */
export function createDirectedAssociationStyle() {
  return new PolylineEdgeStyle({
    targetArrow: new Arrow({
      stroke: Stroke.BLACK,
      fill: Fill.BLACK,
      type: ArrowType.DEFAULT
    })
  })
}

/**
 * @returns {!PolylineEdgeStyle}
 */
export function createRealizationStyle() {
  return new PolylineEdgeStyle({
    stroke: new Stroke({
      dashStyle: DashStyle.DASH
    }),
    sourceArrow: new Arrow({
      stroke: Stroke.BLACK,
      fill: Fill.WHITE,
      type: ArrowType.TRIANGLE
    })
  })
}

/**
 * @returns {!PolylineEdgeStyle}
 */
export function createGeneralizationStyle() {
  return new PolylineEdgeStyle({
    sourceArrow: new Arrow({
      stroke: Stroke.BLACK,
      fill: Fill.WHITE,
      type: ArrowType.TRIANGLE
    })
  })
}

/**
 * @returns {!PolylineEdgeStyle}
 */
export function createAggregationStyle() {
  return new PolylineEdgeStyle({
    sourceArrow: new Arrow({
      stroke: Stroke.BLACK,
      fill: Fill.WHITE,
      type: ArrowType.DIAMOND
    })
  })
}

/**
 * @returns {!PolylineEdgeStyle}
 */
export function createDependencyStyle() {
  return new PolylineEdgeStyle({
    stroke: new Stroke({
      dashStyle: DashStyle.DASH
    }),
    targetArrow: new Arrow({
      stroke: Stroke.BLACK,
      fill: Fill.BLACK,
      type: ArrowType.DEFAULT
    })
  })
}

/**
 * Inheritance styles, i.e. generalization or realization
 * @param {!PolylineEdgeStyle} style
 * @returns {boolean}
 */
export function isInheritance(style) {
  return isGeneralization(style) || isRealization(style)
}

/**
 * If the style symbolizes a generalization.
 * @param {!PolylineEdgeStyle} style
 * @returns {boolean}
 */
export function isGeneralization(style) {
  return hasStroke(style, DashStyle.SOLID) && hasArrow(style, ArrowType.TRIANGLE)
}

/**
 * If the style symbolizes a realization.
 * @param {!PolylineEdgeStyle} style
 * @returns {boolean}
 */
export function isRealization(style) {
  return hasStroke(style, DashStyle.DASH) && hasArrow(style, ArrowType.TRIANGLE)
}

/**
 * @param {!PolylineEdgeStyle} edgeStyle
 * @param {!DashStyle} dashStyle
 * @returns {boolean}
 */
function hasStroke(edgeStyle, dashStyle) {
  const stroke = edgeStyle.stroke
  return !!stroke && stroke.dashStyle === dashStyle
}

/**
 * @param {!PolylineEdgeStyle} style
 * @param {!ArrowType} arrowType
 * @returns {boolean}
 */
function hasArrow(style, arrowType) {
  const arrow = style.sourceArrow
  return !!arrow && arrow instanceof Arrow && arrow.type === arrowType
}
