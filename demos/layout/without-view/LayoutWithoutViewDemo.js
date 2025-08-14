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
  HierarchicalLayout,
  LayoutEdge,
  LayoutGraph,
  LayoutGraphAlgorithms,
  LayoutGrid,
  LayoutNode,
  License,
  OrientedRectangle,
  Point
} from '@yfiles/yfiles'

async function run() {
  const response = await fetch('./license.json')
  License.value = await response.json()

  // create the graph in memory
  const layoutGraph = new LayoutGraph()

  // define some convenience methods to create elements
  function createNode(x, y, width, height) {
    return layoutGraph.createNode({ layout: [x, y, width, height] })
  }

  // build the graph
  const node1 = createNode(0, 0, 30, 30)
  layoutGraph.addLabel(node1, new OrientedRectangle(0, 0, 50, 10))

  const node2 = createNode(150, 0, 30, 30)
  layoutGraph.addLabel(node2, new OrientedRectangle(0, 0, 50, 10))

  const node3 = createNode(100, 50, 30, 30)

  const edge = layoutGraph.createEdge(node1, node3)
  layoutGraph.addBend(edge, 50, 20)

  layoutGraph.createEdge(node2, node3)
  layoutGraph.addLabel(layoutGraph.createEdge(node3, node1), new OrientedRectangle(0, 0, 60, 20))

  log('Graph dump before algorithm')
  logGraph(layoutGraph)

  const centralNode = runAlgorithm(layoutGraph)
  runLayout(layoutGraph, centralNode)

  log('Graph dump after analysis and layout')
  logGraph(layoutGraph)
}

function runAlgorithm(graph) {
  // create data storage
  const edgeCosts = graph.createEdgeDataMap()

  // assign some arbitrary costs
  graph.edges.forEach((edge, i) => {
    edgeCosts.set(edge, i / graph.edges.size)
  })

  // run the algorithm
  const closenessResult = LayoutGraphAlgorithms.closenessCentrality(graph, true, edgeCosts)

  log('Centrality values')
  for (const node of graph.nodes) {
    log(` node ${node.index} : ${closenessResult.get(node)}`)
  }

  // find the most central node
  const centralNode = graph.nodes
    .map((node) => ({ node, centrality: closenessResult.get(node) }))
    .reduce((a, b) => (a.centrality > b.centrality ? a : b)).node

  // release resources
  graph.disposeEdgeDataMap(edgeCosts)
  graph.disposeNodeDataMap(closenessResult)

  log()

  return centralNode
}

function runLayout(layoutGraph, centralNode) {
  // create and configure the layout
  const layout = new HierarchicalLayout({
    layoutOrientation: 'top-to-bottom',
    stopDuration: '0.5s'
  })
  layout.defaultEdgeDescriptor.backLoopRouting = true

  // create the partition
  const layoutGrid = new LayoutGrid(2, 1, 0, 5, 30, 30)
  const layoutData = layout.createLayoutData(layoutGraph)
  // assign the central node to its own row
  layoutData.layoutGridData.layoutGridCellDescriptors = (node) =>
    layoutGrid.createRowSpanDescriptor(node === centralNode ? 0 : 1)

  // and run it
  layoutGraph.applyLayout(layout, layoutData)

  const firstRow = layoutGrid.rows.first()
  const second = layoutGrid.rows.last()
  log(`Layout Grid results`)
  log(`First row (${firstRow.index}): ${firstRow.position}, ${firstRow.height}`)
  log(`Second row (${second.index}): ${second.position}, ${second.height}`)
  log()
}

function logGraph(layoutGraph) {
  function logOrientedBox(orientedBox) {
    let rotation
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
    log(` layout ${node.layout.x}, ${node.layout.y}, ${node.layout.width}, ${node.layout.height}`)

    if (node.labels.size > 0) {
      log(' labels')
      node.labels.forEach((label) => {
        logOrientedBox(label.layout)
      })
    }
  }

  for (const edge of layoutGraph.edges) {
    log(`edge ${edge.index}  (${edge.source.index} -> ${edge.target.index})`)
    const sourcePortLocation = new Point(
      edge.source.layout.center.x - edge.sourcePortLocation.x,
      edge.source.layout.center.y - edge.sourcePortLocation.y
    )
    log(`  source port offset : ${sourcePortLocation.x}, ${sourcePortLocation.y}`)
    const targetPortLocation = new Point(
      edge.target.layout.center.x - edge.targetPortLocation.x,
      edge.target.layout.center.y - edge.targetPortLocation.y
    )
    log(`  target port offset : ${targetPortLocation.x}, ${targetPortLocation.y}`)
    edge.bends.forEach((bend, index) =>
      log(`  bend ${index}: ${bend.location.x}, ${bend.location.y}`)
    )
    if (edge.labels.size > 0) {
      log('  labels')
      edge.labels.forEach((label) => logOrientedBox(label.layout))
    }
  }
  log()
}

/* Helper element and function to log to the HTML page */
const logElement = document.querySelector('#log')

function log(value) {
  if (arguments.length === 0) {
    value = ''
  }
  logElement.textContent += `${value}\n`
}

void run()
