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
  WebGL2ArcEdgeStyle,
  WebGL2BridgeEdgeStyle,
  WebGL2DefaultLabelStyle,
  WebGL2EdgeIndicatorStyle,
  WebGL2FocusIndicatorManager,
  WebGL2GroupNodeStyle,
  WebGL2HighlightIndicatorManager,
  WebGL2IconLabelStyle,
  WebGL2IconNodeStyle,
  WebGL2LabelIndicatorStyle,
  WebGL2NodeIndicatorStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle
} from 'yfiles'

/**
 * @typedef {(WebGL2SelectionIndicatorManager|WebGL2FocusIndicatorManager|WebGL2HighlightIndicatorManager)} WebGL2IndicatorManager
 */

/**
 * @typedef {(WebGL2ShapeNodeStyle|WebGL2IconNodeStyle|WebGL2GroupNodeStyle)} WebGL2NodeStyle
 */
/**
 * @typedef {(WebGL2PolylineEdgeStyle|WebGL2ArcEdgeStyle|WebGL2BridgeEdgeStyle)} WebGL2EdgeStyle
 */
/**
 * @typedef {(WebGL2DefaultLabelStyle|WebGL2IconLabelStyle)} WebGL2LabelStyle
 */
/**
 * @typedef {(WebGL2NodeIndicatorStyle|WebGL2EdgeIndicatorStyle|WebGL2LabelIndicatorStyle)} WebGL2IndicatorStyle
 */

/**
 * @typedef {(WebGL2NodeStyle|WebGL2EdgeStyle|WebGL2LabelStyle|WebGL2IndicatorStyle)} WebGL2Style
 */

const webGL2NodeStyles = [WebGL2ShapeNodeStyle, WebGL2IconNodeStyle, WebGL2GroupNodeStyle]
const webGL2EdgeStyles = [WebGL2PolylineEdgeStyle, WebGL2ArcEdgeStyle, WebGL2BridgeEdgeStyle]
const webGL2LabelStyles = [WebGL2DefaultLabelStyle, WebGL2IconLabelStyle]
const webGL2IndicatorStyles = [
  WebGL2NodeIndicatorStyle,
  WebGL2EdgeIndicatorStyle,
  WebGL2LabelIndicatorStyle
]

/**
 * @param {!WebGL2Style} style
 * @returns {!WebGL2NodeStyle}
 */
export function isWebGL2NodeStyle(style) {
  return webGL2NodeStyles.some((ns) => style instanceof ns)
}
/**
 * @param {!WebGL2Style} style
 * @returns {!WebGL2EdgeStyle}
 */
export function isWebGL2EdgeStyle(style) {
  return webGL2EdgeStyles.some((es) => style instanceof es)
}
/**
 * @param {!WebGL2Style} style
 * @returns {!WebGL2LabelStyle}
 */
export function isWebGL2LabelStyle(style) {
  return webGL2LabelStyles.some((ls) => style instanceof ls)
}
/**
 * @param {!WebGL2Style} style
 * @returns {!WebGL2IndicatorStyle}
 */
export function isWebGL2IndicatorStyle(style) {
  return webGL2IndicatorStyles.some((is) => style instanceof is)
}
