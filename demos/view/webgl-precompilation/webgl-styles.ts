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
  StyleIndicatorZoomPolicy,
  WebGLEdgeIndicatorStyle,
  WebGLIndicatorType,
  WebGLLabelIndicatorStyle,
  WebGLLabelShape,
  WebGLLabelStyle,
  WebGLNodeIndicatorStyle,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import type { WebGLEdgeStyle, WebGLNodeStyle, WebGLTextStyle } from './webgl-styles-util'
import { colorSets } from '@yfiles/demo-app/demo-colors'

export const webGLNodeStyles: WebGLNodeStyle[] = [
  new WebGLShapeNodeStyle({ fill: colorSets['demo-palette-21'].fill, shape: 'ellipse' }),
  new WebGLShapeNodeStyle({ fill: colorSets['demo-palette-22'].fill, shape: 'pill' }),
  new WebGLShapeNodeStyle({ fill: colorSets['demo-palette-23'].fill, shape: 'hexagon' }),
  new WebGLShapeNodeStyle({ fill: colorSets['demo-palette-24'].fill, shape: 'round-rectangle' }),
  new WebGLShapeNodeStyle({
    fill: colorSets['demo-green'].fill,
    shape: 'triangle',
    stroke: '1px dashed black'
  })
]

export const webGLEdgeStyles: WebGLEdgeStyle[] = [
  new WebGLPolylineEdgeStyle({ stroke: '2px solid ' + colorSets['demo-red'].fill }),
  new WebGLPolylineEdgeStyle({ stroke: '2px dashed ' + colorSets['demo-blue'].fill }),
  new WebGLPolylineEdgeStyle({ stroke: '2px dotted ' + colorSets['demo-green'].fill })
]

export const webGLLabelStyles: WebGLTextStyle[] = [
  new WebGLLabelStyle({
    shape: WebGLLabelShape.RECTANGLE,
    textColor: 'black',
    backgroundStroke: 'black',
    backgroundColor: 'white',
    horizontalTextAlignment: 'center'
  }),
  new WebGLLabelStyle({
    shape: WebGLLabelShape.ROUND_RECTANGLE,
    textColor: 'black',
    backgroundStroke: '2px dashed red',
    backgroundColor: 'white',
    horizontalTextAlignment: 'center'
  })
]

export const nodeSelectionStyle = new WebGLNodeIndicatorStyle({
  type: WebGLIndicatorType.DOUBLE_BORDER,
  thickness: 3,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED
})
export const nodeFocusStyle = new WebGLNodeIndicatorStyle({
  type: WebGLIndicatorType.STRIPES,
  thickness: 5,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED,
  primaryColor: 'red'
})
export const nodeHighlightStyle = new WebGLNodeIndicatorStyle({
  type: WebGLIndicatorType.SOLID,
  thickness: 5,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED,
  primaryColor: 'green'
})
export const edgeSelectionStyle = new WebGLEdgeIndicatorStyle({
  type: WebGLIndicatorType.HATCH_BRUSH,
  thickness: 3,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED
})
export const edgeFocusStyle = new WebGLEdgeIndicatorStyle({
  type: WebGLIndicatorType.DOT,
  thickness: 5,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED,
  primaryColor: 'red'
})
export const edgeHighlightStyle = new WebGLEdgeIndicatorStyle({
  type: WebGLIndicatorType.DOUBLE_LINE,
  thickness: 5,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED,
  primaryColor: 'green',
  secondaryColor: 'red'
})
export const labelSelectionStyle = new WebGLLabelIndicatorStyle({
  type: WebGLIndicatorType.DASH,
  thickness: 5,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED
})
export const labelFocusStyle = new WebGLLabelIndicatorStyle({
  type: WebGLIndicatorType.DOTTED_HAIRLINE_BORDER,
  thickness: 3,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED,
  primaryColor: 'red'
})
export const labelHighlightStyle = new WebGLLabelIndicatorStyle({
  type: WebGLIndicatorType.DOUBLE_BORDER_THICK,
  thickness: 5,
  zoomPolicy: StyleIndicatorZoomPolicy.MIXED,
  primaryColor: 'green'
})
