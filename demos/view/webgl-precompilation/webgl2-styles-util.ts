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

export type WebGL2IndicatorManager =
  | WebGL2SelectionIndicatorManager
  | WebGL2FocusIndicatorManager
  | WebGL2HighlightIndicatorManager

export type WebGL2NodeStyle = WebGL2ShapeNodeStyle | WebGL2IconNodeStyle | WebGL2GroupNodeStyle
export type WebGL2EdgeStyle = WebGL2PolylineEdgeStyle | WebGL2ArcEdgeStyle | WebGL2BridgeEdgeStyle
export type WebGL2LabelStyle = WebGL2DefaultLabelStyle | WebGL2IconLabelStyle
export type WebGL2IndicatorStyle =
  | WebGL2NodeIndicatorStyle
  | WebGL2EdgeIndicatorStyle
  | WebGL2LabelIndicatorStyle

export type WebGL2Style =
  | WebGL2NodeStyle
  | WebGL2EdgeStyle
  | WebGL2LabelStyle
  | WebGL2IndicatorStyle

const webGL2NodeStyles = [WebGL2ShapeNodeStyle, WebGL2IconNodeStyle, WebGL2GroupNodeStyle]
const webGL2EdgeStyles = [WebGL2PolylineEdgeStyle, WebGL2ArcEdgeStyle, WebGL2BridgeEdgeStyle]
const webGL2LabelStyles = [WebGL2DefaultLabelStyle, WebGL2IconLabelStyle]
const webGL2IndicatorStyles = [
  WebGL2NodeIndicatorStyle,
  WebGL2EdgeIndicatorStyle,
  WebGL2LabelIndicatorStyle
]

export function isWebGL2NodeStyle(style: WebGL2Style): style is WebGL2NodeStyle {
  return webGL2NodeStyles.some((ns) => style instanceof ns)
}
export function isWebGL2EdgeStyle(style: WebGL2Style): style is WebGL2EdgeStyle {
  return webGL2EdgeStyles.some((es) => style instanceof es)
}
export function isWebGL2LabelStyle(style: WebGL2Style): style is WebGL2LabelStyle {
  return webGL2LabelStyles.some((ls) => style instanceof ls)
}
export function isWebGL2IndicatorStyle(style: WebGL2Style): style is WebGL2IndicatorStyle {
  return webGL2IndicatorStyles.some((is) => style instanceof is)
}
