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
  StyleDecorationZoomPolicy,
  WebGL2DefaultLabelStyle,
  WebGL2EdgeIndicatorStyle,
  WebGL2IndicatorType,
  WebGL2LabelIndicatorStyle,
  WebGL2LabelShape,
  WebGL2NodeIndicatorStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2ShapeNodeStyle
} from 'yfiles'
import type { WebGL2EdgeStyle, WebGL2LabelStyle, WebGL2NodeStyle } from './webgl2-styles-util'
import { colorSets } from 'demo-resources/demo-colors'

export const webGL2NodeStyles: WebGL2NodeStyle[] = [
  new WebGL2ShapeNodeStyle({ fill: colorSets['demo-palette-21'].fill, shape: 'ellipse' }),
  new WebGL2ShapeNodeStyle({ fill: colorSets['demo-palette-22'].fill, shape: 'pill' }),
  new WebGL2ShapeNodeStyle({ fill: colorSets['demo-palette-23'].fill, shape: 'hexagon' }),
  new WebGL2ShapeNodeStyle({ fill: colorSets['demo-palette-24'].fill, shape: 'round-rectangle' }),
  new WebGL2ShapeNodeStyle({
    fill: colorSets['demo-green'].fill,
    shape: 'triangle',
    stroke: '1px dashed black'
  })
]

export const webGL2EdgeStyles: WebGL2EdgeStyle[] = [
  new WebGL2PolylineEdgeStyle({ stroke: '2px solid ' + colorSets['demo-red'].fill }),
  new WebGL2PolylineEdgeStyle({ stroke: '2px dashed ' + colorSets['demo-blue'].fill }),
  new WebGL2PolylineEdgeStyle({ stroke: '2px dotted ' + colorSets['demo-green'].fill })
]

export const webGL2LabelStyles: WebGL2LabelStyle[] = [
  new WebGL2DefaultLabelStyle({
    shape: WebGL2LabelShape.RECTANGLE,
    textColor: 'black',
    backgroundStroke: 'black',
    backgroundColor: 'white',
    textAlignment: 'center'
  }),
  new WebGL2DefaultLabelStyle({
    shape: WebGL2LabelShape.ROUND_RECTANGLE,
    textColor: 'black',
    backgroundStroke: '2px dashed red',
    backgroundColor: 'white',
    textAlignment: 'center'
  })
]

export const nodeSelectionStyle = new WebGL2NodeIndicatorStyle({
  type: WebGL2IndicatorType.DOUBLE_BORDER,
  thickness: 3,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED
})
export const nodeFocusStyle = new WebGL2NodeIndicatorStyle({
  type: WebGL2IndicatorType.STRIPES,
  thickness: 5,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED,
  primaryColor: 'red'
})
export const nodeHighlightStyle = new WebGL2NodeIndicatorStyle({
  type: WebGL2IndicatorType.SOLID,
  thickness: 5,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED,
  primaryColor: 'green'
})
export const edgeSelectionStyle = new WebGL2EdgeIndicatorStyle({
  type: WebGL2IndicatorType.HATCH_BRUSH,
  thickness: 3,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED
})
export const edgeFocusStyle = new WebGL2EdgeIndicatorStyle({
  type: WebGL2IndicatorType.DOT,
  thickness: 5,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED,
  primaryColor: 'red'
})
export const edgeHighlightStyle = new WebGL2EdgeIndicatorStyle({
  type: WebGL2IndicatorType.DOUBLE_LINE,
  thickness: 5,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED,
  primaryColor: 'green',
  secondaryColor: 'red'
})
export const labelSelectionStyle = new WebGL2LabelIndicatorStyle({
  type: WebGL2IndicatorType.DASH,
  thickness: 5,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED
})
export const labelFocusStyle = new WebGL2LabelIndicatorStyle({
  type: WebGL2IndicatorType.DOTTED_HAIRLINE_BORDER,
  thickness: 3,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED,
  primaryColor: 'red'
})
export const labelHighlightStyle = new WebGL2LabelIndicatorStyle({
  type: WebGL2IndicatorType.DOUBLE_BORDER_THICK,
  thickness: 5,
  zoomPolicy: StyleDecorationZoomPolicy.MIXED,
  primaryColor: 'green'
})
