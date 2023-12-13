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
  BufferedLayout,
  CentralityAlgorithm,
  DefaultLayoutGraph,
  Edge,
  Graph,
  HierarchicLayout,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  IEdgeLabelLayout,
  INodeLabelLayout,
  LayoutGraph,
  LayoutGraphUtilities,
  LayoutOrientation,
  License,
  SwimlaneDescriptor,
  YDimension,
  YNode,
  YOrientedRectangle,
  YPoint
} from 'yfiles'

async function run(): Promise<void> {
  const response = await fetch('../../../lib/license.json')
  License.value = await response.json()

  // create the graph in memory
  const layoutGraph = new DefaultLayoutGraph()
  const labelFactory = LayoutGraphUtilities.getLabelFactory(layoutGraph)!

  // define some convenience methods to create elements
  function createNode(x: number, y: number, width: number, height: number): YNode {
    const node = layoutGraph.createNode()
    layoutGraph.setSize(node, new YDimension(width, height))
    layoutGraph.setLocation(node, new YPoint(x, y))
    return node
  }

  function addBend(edge: Edge, x: number, y: number): void {
    const edgeLayout = layoutGraph.getLayout(edge)
    edgeLayout.addPoint(x, y)
  }

  function addLabel(
    item: YNode | Edge,
    width: number,
    height: number
  ): INodeLabelLayout | IEdgeLabelLayout {
    const labelBox = new YOrientedRectangle(0, 0, width, height)
    if (item instanceof YNode) {
      const layout = labelFactory.createLabelLayout(item, labelBox)!
      labelFactory.addLabelLayout(item, layout)
      return layout
    } else {
      const layout = labelFactory.createLabelLayout(item, labelBox)!
      labelFactory.addLabelLayout(item, layout)
      return layout
    }
  }

  // build the graph
  const node1 = createNode(0, 0, 30, 30)
  addLabel(node1, 50, 10)

  const node2 = createNode(150, 0, 30, 30)
  addLabel(node2, 50, 10)

  const node3 = createNode(100, 50, 30, 30)

  const edge = layoutGraph.createEdge(node1, node3)
  addBend(edge, 50, 20)

  layoutGraph.createEdge(node2, node3)
  addLabel(layoutGraph.createEdge(node3, node1), 60, 20)

  log('Graph dump before algorithm')
  logGraph(layoutGraph)

  const centralNode = runAlgorithm(layoutGraph)
  runLayout(layoutGraph, centralNode)

  log('Graph dump after analysis and layout')
  logGraph(layoutGraph)
}

function runAlgorithm(graph: Graph): YNode {
  // create data storage
  const closenessResult = graph.createNodeMap()
  const edgeCosts = graph.createEdgeMap()

  // assign some arbitrary costs
  graph.edges.forEach((edge, i) => {
    edgeCosts.setNumber(edge, i / graph.edgeCount)
  })

  // run the algorithm
  CentralityAlgorithm.closenessCentrality(graph, closenessResult, true, edgeCosts)

  log('Centrality values')
  for (const node of graph.nodes) {
    log(` node ${node.index} : ${closenessResult.getNumber(node)}`)
  }

  // find the most central node
  const centralNode = graph.nodes
    .map((node) => ({ node, centrality: closenessResult.getNumber(node) }))
    .reduce((a, b) => (a.centrality > b.centrality ? a : b)).node

  // release resources
  graph.disposeEdgeMap(edgeCosts)
  graph.disposeNodeMap(closenessResult)

  log()

  return centralNode
}

function runLayout(layoutGraph: DefaultLayoutGraph, centralNode: YNode): void {
  // assign the central node to its own swimlane
  // create the map that holds the information
  const swimlaneMap = layoutGraph.createNodeMap()
  // register it with the graph
  layoutGraph.addDataProvider(HierarchicLayout.SWIMLANE_DESCRIPTOR_DP_KEY, swimlaneMap)

  // populate the map
  const centerLane = new SwimlaneDescriptor(0)
  centerLane.indexFixed = true
  centerLane.leftLaneInset = centerLane.rightLaneInset = 5
  centerLane.minimumLaneWidth = 30
  const otherLane = new SwimlaneDescriptor(1)
  otherLane.indexFixed = true
  otherLane.minimumLaneWidth = 30

  layoutGraph.nodes.forEach((node) => {
    if (node === centralNode) {
      swimlaneMap.set(node, centerLane)
    } else {
      swimlaneMap.set(node, otherLane)
    }
  })

  // create and configure the layout
  const layout = new HierarchicLayout()
  layout.layoutOrientation = LayoutOrientation.TOP_TO_BOTTOM
  layout.maximumDuration = 500
  layout.backLoopRouting = true
  layout.integratedEdgeLabeling = true
  layout.considerNodeLabels = true
  layout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
    HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL
  )

  // and run it
  new BufferedLayout(layout).applyLayout(layoutGraph)

  log(`Swimlane results`)
  log(
    ` center lane (${centerLane.computedLaneIndex}): ${centerLane.computedLanePosition}, ${centerLane.computedLaneWidth}`
  )
  log(
    ` other  lane (${otherLane.computedLaneIndex}): ${otherLane.computedLanePosition}, ${otherLane.computedLaneWidth}`
  )
  log()

  // clean up map resources
  layoutGraph.disposeNodeMap(swimlaneMap)
}

function logGraph(layoutGraph: LayoutGraph): void {
  function logOrientedBox(orientedBox: YOrientedRectangle): void {
    let rotation: string
    if (orientedBox.upY !== -1) {
      // rotated
      rotation = `${orientedBox.upX}, ${orientedBox.upY}`
    } else {
      rotation = ''
    }
    log(
      `    ${orientedBox.anchorX}, ${orientedBox.anchorY}, ${orientedBox.width}, ${orientedBox.height}  ${rotation}`
    )
  }

  for (const node of layoutGraph.nodes) {
    log(`node ${node.index}`)
    const nodeLayout = layoutGraph.getLayout(node)
    log(` layout ${nodeLayout.x}, ${nodeLayout.y}, ${nodeLayout.width}, ${nodeLayout.height}`)
    const nodeLabelLayouts = layoutGraph.getLabelLayout(node)
    if (nodeLabelLayouts && nodeLabelLayouts.length > 0) {
      log(' labels')
      for (const label of nodeLabelLayouts) {
        logOrientedBox(label.orientedBox)
      }
    }
  }

  for (const edge of layoutGraph.edges) {
    log(`edge ${edge.index}  (${edge.source.index} -> ${edge.target.index})`)
    const edgeLayout = layoutGraph.getLayout(edge)
    const sourcePortLocation = layoutGraph.getSourcePointRel(edge)
    log(`  source port offset : ${sourcePortLocation.x}, ${sourcePortLocation.y}`)
    const targetPortLocation = layoutGraph.getTargetPointRel(edge)
    log(`  target port offset : ${targetPortLocation.x}, ${targetPortLocation.y}`)
    for (let i = 0; i < edgeLayout.pointCount(); i++) {
      const bendPoint = edgeLayout.getPoint(i)
      log(`  bend ${i}: ${bendPoint.x}, ${bendPoint.y}`)
    }
    const edgeLabelLayouts = layoutGraph.getLabelLayout(edge)
    if (edgeLabelLayouts && edgeLabelLayouts.length > 0) {
      log(' labels')
      for (const label of edgeLabelLayouts) {
        logOrientedBox(label.orientedBox)
      }
    }
  }
  log()
}

/* Helper element and function to log to the HTML page */
const logElement = document.querySelector<HTMLTextAreaElement>('#log')!

function log(value?: string | object | undefined): void {
  if (arguments.length === 0) {
    value = ''
  }
  logElement.textContent += `${value}\n`
}

run()
