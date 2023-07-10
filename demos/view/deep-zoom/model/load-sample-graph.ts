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
import { GraphBuilder, type GraphComponent, ShapeNodeStyle } from 'yfiles'
import { sampleData } from './deep-zoom-sample'

/**
 * Loads the initial sample graph.
 */
export async function loadSampleGraph(graphComponent: GraphComponent): Promise<void> {
  const graph = graphComponent.graph

  const graphBuilder = new GraphBuilder(graph)

  // configure node creation
  graph.nodeDefaults.shareStyleInstance = false
  graphBuilder.createNodesSource({
    data: sampleData.nodes,
    id: 'id',
    parentId: 'parentId',
    styleBindings: {
      fill: data => data.fill,
      stroke: dataItem => `1.5px ${dataItem.stroke}`
    }
  })

  // configure group node creation
  graph.groupNodeDefaults.shareStyleInstance = false
  graphBuilder.createGroupNodesSource({
    data: sampleData.groupNodes,
    id: 'id',
    parentId: 'parentId',
    styleBindings: {
      backgroundStyle: dataItem =>
        new ShapeNodeStyle({
          fill: dataItem.fill,
          stroke: `2.5px ${dataItem.stroke}`,
          shape: 'round-rectangle'
        })
    }
  })

  // configure edge creation
  graph.edgeDefaults.shareStyleInstance = false
  graphBuilder.createEdgesSource({
    data: sampleData.edges,
    sourceId: 'from',
    targetId: 'to',
    styleBindings: {
      stroke: dataItem => `1.5px ${dataItem.color}`,
      targetArrow: data => `${data.color} medium triangle`
    }
  })

  // actually create the graph
  graphBuilder.buildGraph()
}
