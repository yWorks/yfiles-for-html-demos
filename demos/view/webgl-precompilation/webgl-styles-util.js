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
  WebGLArcEdgeStyle,
  WebGLBridgeEdgeStyle,
  WebGLEdgeIndicatorStyle,
  WebGLGroupNodeStyle,
  WebGLIconLabelStyle,
  WebGLImageNodeStyle,
  WebGLLabelIndicatorStyle,
  WebGLLabelStyle,
  WebGLNodeIndicatorStyle,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
const webGLNodeStyles = [WebGLShapeNodeStyle, WebGLImageNodeStyle, WebGLGroupNodeStyle]
const webGLEdgeStyles = [WebGLPolylineEdgeStyle, WebGLArcEdgeStyle, WebGLBridgeEdgeStyle]
const webGLLabelStyles = [WebGLLabelStyle, WebGLIconLabelStyle]
const webGLIndicatorStyles = [
  WebGLNodeIndicatorStyle,
  WebGLEdgeIndicatorStyle,
  WebGLLabelIndicatorStyle
]
export function isWebGLNodeStyle(style) {
  return webGLNodeStyles.some((ns) => style instanceof ns)
}
export function isWebGLEdgeStyle(style) {
  return webGLEdgeStyles.some((es) => style instanceof es)
}
export function isWebGLLabelStyle(style) {
  return webGLLabelStyles.some((ls) => style instanceof ls)
}
export function isWebGLIndicatorStyle(style) {
  return webGLIndicatorStyles.some((is) => style instanceof is)
}
