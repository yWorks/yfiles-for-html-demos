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
import { GraphBuilder, GraphComponent, IGraph } from '@yfiles/yfiles'
import { EdgeData, GraphData, NodeData } from '../page'
import { LayoutSupport } from './LayoutSupport'
import { useEffect, useMemo } from 'react'

function createGraphBuilder(graph: IGraph) {
  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource({
    // Stores the nodes of the graph
    data: [] as NodeData[],
    // Identifies the id property of a node object
    id: 'id',
    // Use the 'name' property as node label
    tag: (item) => ({ name: item.name })
  })
  const edgesSource = graphBuilder.createEdgesSource({
    // Stores the edges of the graph
    data: [] as EdgeData[],
    // Identifies the property of an edge object that contains the source node's id
    sourceId: 'fromNode',
    // Identifies the property of an edge object that contains the target node's id
    targetId: 'toNode'
  })
  // Define a utility method that resolves a node's id to the name of the node
  const idToName = (id: number) => graphBuilder.getNodeById(id)?.tag.name

  // Add edge labels
  edgesSource.edgeCreator.createLabelBinding({
    // Edge label text should contain the names of the source and target node
    text: (edgeData) => idToName(edgeData.fromNode) + ' - ' + idToName(edgeData.toNode),
    tag: (edgeData) => {
      return { fromNode: idToName(edgeData.fromNode), toNode: idToName(edgeData.toNode) }
    }
  })
  return { graphBuilder, nodesSource, edgesSource }
}

export function useGraphBuilder(
  graphComponent: GraphComponent,
  data: GraphData,
  layoutSupport: LayoutSupport
) {
  const { graphBuilder, nodesSource, edgesSource } = useMemo(
    () => createGraphBuilder(graphComponent.graph),
    [graphComponent]
  )

  useEffect(() => {
    graphBuilder.setData(nodesSource, data.nodesSource)
    graphBuilder.setData(edgesSource, data.edgesSource)
    graphBuilder.updateGraph()
    graphComponent.fitGraphBounds()
    layoutSupport.scheduleLayout()
  }, [graphComponent, graphBuilder, data, nodesSource, edgesSource, layoutSupport])
}
