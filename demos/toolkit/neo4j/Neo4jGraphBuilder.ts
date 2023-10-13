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
import { GraphBuilder, GraphComponent, INodeStyle, ShapeNodeStyle } from 'yfiles'
import type { Integer, Node, Relationship } from './Neo4jUtil'

/**
 * Helper method to convert the Neo4j "long" ids, to a simple string
 */
function getId(identity: Integer): string {
  return `${identity.low.toString()}:${identity.high.toString()}`
}

// label names that are well suited to be a primary label
const labelNameCandidates = ['name', 'title', 'firstName', 'lastName', 'email', 'content']
// some pre-defined node styles
const predefinedNodesStyles = [
  new ShapeNodeStyle({
    shape: 'ellipse',
    fill: '#00d8ff'
  }),
  new ShapeNodeStyle({
    shape: 'triangle',
    fill: '#f66a00'
  }),
  new ShapeNodeStyle({
    shape: 'diamond',
    fill: '#242265'
  }),
  new ShapeNodeStyle({
    shape: 'rectangle',
    fill: '#c0fc1a'
  }),
  new ShapeNodeStyle({
    shape: 'hexagon',
    fill: '#ba85ff'
  }),
  new ShapeNodeStyle({
    shape: 'octagon',
    fill: '#fcfe1f'
  })
]

/**
 * Returns a GraphBuilder that is configured to work well with Neo4J query results.
 * @yjs:keep = end
 */
export function createGraphBuilder(
  graphComponent: GraphComponent,
  nodes: Node[],
  edges: Relationship[]
): GraphBuilder {
  // mapping from labels to node styles
  const nodeStyleMapping: { [label: string]: INodeStyle } = {}
  let nodeStyleCounter = 0
  const graph = graphComponent.graph

  const graphBuilder = new GraphBuilder(graph)
  const nodeCreator = graphBuilder.createNodesSource({
    data: nodes,
    id: (node: Node): string => getId(node.identity),
    layout: 'layout',
    labels: ['label']
  }).nodeCreator
  nodeCreator.createLabelBinding(node => {
    if (node.properties) {
      for (const propertyName of Object.keys(node.properties)) {
        // try to find a suitable node label
        if (labelNameCandidates.includes(propertyName)) {
          // trim the label
          return (node.properties as any)[propertyName].substring(0, 30)
        }
      }
    }
    return node.labels && node.labels.length > 0 ? node.labels.join(' - ') : null
  })
  graphBuilder.createEdgesSource({
    data: edges,
    sourceId: (edge: Relationship): string => getId(edge.start),
    targetId: (edge: Relationship): string => getId(edge.end),
    labels: ['type']
  })

  graphBuilder.addNodeCreatedListener((_, { graph, item, dataItem }) => {
    // look for a mapping for any of the nodes labels and use the mapped style
    let matchingLabel: string = dataItem.labels.find((label: string) => label in nodeStyleMapping)
    if (!matchingLabel) {
      matchingLabel = dataItem.labels[0]
      nodeStyleMapping[matchingLabel] = predefinedNodesStyles[nodeStyleCounter]
      nodeStyleCounter = (nodeStyleCounter + 1) % predefinedNodesStyles.length
    }
    const nodeStyle = nodeStyleMapping[matchingLabel]
    graph.setStyle(item, nodeStyle)
    // start the animation from the center of the viewport
    graph.setNodeCenter(item, graphComponent.viewport.center)
  })

  return graphBuilder
}
