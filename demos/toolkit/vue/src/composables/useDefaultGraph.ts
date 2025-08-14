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
  GraphComponent,
  InteriorNodeLabelModel,
  LabelStyle,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import { onMounted } from 'vue'

export function useDefaultGraph(getGraphComponent: () => GraphComponent) {
  let graphComponent: GraphComponent
  onMounted(() => {
    graphComponent = getGraphComponent()
    style()
    create()
  })

  /**
   * Sets default styles for the graph.
   */
  function style(): void {
    const graph = graphComponent.graph

    // configure the styles of the nodes and their labels
    graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: '#FF6C00',
      stroke: '#662F01',
      shape: 'round-rectangle'
    })
    graph.nodeDefaults.labels.style = new LabelStyle({
      textSize: 12,
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center',
      wrapping: 'wrap-word',
      textFill: '#662F01',
      backgroundFill: '#FFC398',
      padding: 2
    })
    graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER

    // configure the style of the edges
    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '#662F01',
      targetArrow: new Arrow({ type: 'triangle', stroke: '#662F01', fill: '#662F01' })
    })
  }

  /**
   * Creates the default graph.
   */
  function create(): void {
    const graph = graphComponent.graph

    graph.clear()
    const node1 = graph.createNode({ layout: new Rect(241, 273, 130, 70), labels: ['Hobbies'] })
    const node2 = graph.createNode({ layout: new Rect(309, 126, 70, 40), labels: ['Games'] })
    const node3 = graph.createNode({ layout: new Rect(435, 318, 70, 40), labels: ['Sport'] })
    const node4 = graph.createNode({ layout: new Rect(249, 451, 70, 40), labels: ['Books'] })
    const node5 = graph.createNode({ layout: new Rect(116, 323, 70, 40), labels: ['Diy'] })
    const node6 = graph.createNode({ layout: new Rect(157, 187, 70, 40), labels: ['Collecting'] })
    const node7 = graph.createNode({ layout: new Rect(232, 579, 70, 40), labels: ['Fantasy'] })
    const node8 = graph.createNode({
      layout: new Rect(343, 530, 130, 40),
      labels: ['Science Fiction']
    })
    const node9 = graph.createNode({ layout: new Rect(137, 503, 70, 40), labels: ['Thriller'] })
    const node10 = graph.createNode({
      layout: new Rect(201, 30, 130, 40),
      labels: ['Cops and Robbers']
    })
    const node11 = graph.createNode({
      layout: new Rect(422, 85, 130, 40),
      labels: ['The Settlers of Catan']
    })
    const node12 = graph.createNode({ layout: new Rect(341, 0, 70, 40), labels: ['Computer'] })
    const node13 = graph.createNode({ layout: new Rect(61, 109, 70, 40), labels: ['Stamps'] })
    const node14 = graph.createNode({ layout: new Rect(463, 435, 70, 40), labels: ['Dancing'] })
    const node15 = graph.createNode({ layout: new Rect(568, 349, 70, 40), labels: ['Climbing'] })
    const node16 = graph.createNode({ layout: new Rect(508, 222, 70, 40), labels: ['Soccer'] })
    const node17 = graph.createNode({ layout: new Rect(654, 442, 70, 40), labels: ['Rock'] })
    const node18 = graph.createNode({ layout: new Rect(679, 294, 70, 40), labels: ['Ice'] })
    const node19 = graph.createNode({ layout: new Rect(0, 272, 70, 40), labels: ['Planes'] })
    const node20 = graph.createNode({ layout: new Rect(16, 403, 70, 40), labels: ['Cars'] })

    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)
    graph.createEdge(node1, node4)
    graph.createEdge(node1, node5)
    graph.createEdge(node1, node6)
    graph.createEdge(node2, node10)
    graph.createEdge(node2, node11)
    graph.createEdge(node2, node12)
    graph.createEdge(node3, node14)
    graph.createEdge(node3, node15)
    graph.createEdge(node3, node16)
    graph.createEdge(node4, node7)
    graph.createEdge(node4, node8)
    graph.createEdge(node4, node9)
    graph.createEdge(node5, node19)
    graph.createEdge(node5, node20)
    graph.createEdge(node6, node13)
    graph.createEdge(node15, node17)
    graph.createEdge(node15, node18)

    graphComponent.fitGraphBounds()
  }

  return { create }
}
