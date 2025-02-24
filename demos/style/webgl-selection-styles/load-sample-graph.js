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
  ExteriorNodeLabelModel,
  WebGLArcEdgeStyle,
  WebGLArrowType,
  WebGLBridgeEdgeStyle,
  WebGLLabelShape,
  WebGLLabelStyle,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeShape,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
/**
 * Creates an initial sample graph.
 */
export function createGraph(graph) {
  const polylineEdgeStyle = new WebGLPolylineEdgeStyle({
    stroke: '2px gray',
    targetArrow: WebGLArrowType.TRIANGLE_LARGE
  })
  const n1 = graph.createNode([0, 0, 100, 100])
  graph.setStyle(
    n1,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.ROUND_RECTANGLE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const nl1 = graph.addLabel(
    n1,
    'node 1',
    new ExteriorNodeLabelModel({ margins: 20 }).createParameter('bottom')
  )
  graph.setStyle(
    nl1,
    new WebGLLabelStyle({
      shape: WebGLLabelShape.ROUND_RECTANGLE,
      backgroundColor: 'lightgray',
      padding: 10
    })
  )
  const n2 = graph.createNode([300, 0, 100, 100])
  graph.setStyle(
    n2,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.TRIANGLE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const e1 = graph.createEdge(n1, n2)
  graph.setStyle(
    e1,
    new WebGLArcEdgeStyle({
      height: 60,
      stroke: '2px gray',
      targetArrow: WebGLArrowType.TRIANGLE_LARGE
    })
  )
  const n3 = graph.createNode([475, 300, 150, 100])
  graph.setStyle(
    n3,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.PILL,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const nl2 = graph.addLabel(
    n3,
    'node 3',
    new ExteriorNodeLabelModel({ margins: 20 }).createParameter('left')
  )
  graph.setStyle(
    nl2,
    new WebGLLabelStyle({
      shape: WebGLLabelShape.PILL,
      backgroundColor: 'lightgray',
      padding: 10
    })
  )
  const e2 = graph.createEdge(n2, n3)
  graph.setStyle(e2, polylineEdgeStyle)
  const el1 = graph.addLabel(e2, 'edge 2')
  graph.setStyle(
    el1,
    new WebGLLabelStyle({
      shape: WebGLLabelShape.ROUND_RECTANGLE,
      backgroundColor: 'lightgray',
      padding: 10
    })
  )
  const n4 = graph.createNode([275, 600, 150, 100])
  graph.setStyle(
    n4,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.ELLIPSE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const e3 = graph.createEdge(n3, n4)
  graph.setStyle(e3, polylineEdgeStyle)
  const el2 = graph.addLabel(e3, 'edge 3')
  graph.setStyle(
    el2,
    new WebGLLabelStyle({
      shape: WebGLLabelShape.PILL,
      backgroundColor: 'lightgray',
      padding: 10
    })
  )
  const n5 = graph.createNode([0, 600, 100, 100])
  graph.setStyle(
    n5,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.OCTAGON,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const e4 = graph.createEdge(n4, n5)
  graph.setStyle(
    e4,
    new WebGLBridgeEdgeStyle({
      height: -80,
      fanLength: 100,
      stroke: '2px gray',
      targetArrow: WebGLArrowType.TRIANGLE_LARGE
    })
  )
  const n6 = graph.createNode([-150, 300, 100, 100])
  graph.setStyle(
    n6,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.RECTANGLE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const e5 = graph.createEdge(n5, n6)
  graph.setStyle(e5, polylineEdgeStyle)
  const el3 = graph.addLabel(e5, 'edge 5')
  graph.setStyle(
    el3,
    new WebGLLabelStyle({
      shape: WebGLLabelShape.RECTANGLE,
      backgroundColor: 'lightgray',
      padding: 10
    })
  )
  const n7 = graph.createNode([150, 300, 100, 100])
  graph.setStyle(
    n7,
    new WebGLShapeNodeStyle({
      shape: WebGLShapeNodeShape.HEXAGON,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )
  const nl3 = graph.addLabel(
    n7,
    'node 7',
    new ExteriorNodeLabelModel({ margins: 20 }).createParameter('bottom')
  )
  graph.setStyle(
    nl3,
    new WebGLLabelStyle({
      shape: WebGLLabelShape.RECTANGLE,
      backgroundColor: 'lightgray',
      padding: 10
    })
  )
  const e6 = graph.createEdge(n6, n7)
  graph.addBend(e6, [25, 300])
  graph.addBend(e6, [75, 400])
  graph.setStyle(e6, polylineEdgeStyle)
}
