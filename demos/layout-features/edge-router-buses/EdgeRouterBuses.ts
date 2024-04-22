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
  EdgeRouter,
  EdgeRouterBusDescriptor,
  EdgeRouterData,
  IEnumerable,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  Rect,
  YList,
  YPoint,
  YPointPath
} from 'yfiles'

/**
 * Demonstrates how to configure the {@link EdgeRouter} to create bus-like orthogonal routes.
 * In this example we use the data stored in the edge's tag to determine which edge belongs to which bus.
 * @param graph The graph to be laid out
 * @returns {{EdgeRouter, EdgeRouterData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const layout = new EdgeRouter()
  const layoutData = new EdgeRouterData()

  // define and configure the first bus
  configureFirstBus(layoutData)

  // define and configure the second bus
  configureSecondBus(layoutData, graph)

  return { layout, layoutData }
}

/**
 * Configures a bus where the backbone is not manually configured but will be computed automatically.
 */
function configureFirstBus(layoutData: EdgeRouterData) {
  // define the first bus
  const descriptorFirstBus = new EdgeRouterBusDescriptor()
  const firstBus = layoutData.buses.add(descriptorFirstBus)
  // specify the edges that belong to the first bus via a delegate
  firstBus.delegate = (e) => e.tag.bus === 1
}

/**
 * Configures a bus where the location of the backbone is manually defined.
 */
function configureSecondBus(layoutData: EdgeRouterData, graph: IGraph) {
  // define the bus
  const descriptorSecondBus = new EdgeRouterBusDescriptor()
  const secondBus = layoutData.buses.add(descriptorSecondBus)

  // specify the edges that belong to the second bus via a list of items (just for the
  // purpose of the example, could be defined using a delegate as for the first bus as well)
  const secondBusEdges = graph.edges.filter((e) => e.tag.bus === 2).toList()
  secondBus.items = secondBusEdges

  // now define the custom backbone that this bus should use: in this example we assume a node
  // arrangement in a row-like fashion and we define the backbone to be left and in between
  // the node rows
  const secondBusNodes = graph.nodes.filter((n) => graph.edgesAt(n).some((e) => e.tag.bus === 2))

  // get the bounding box of the nodes on the bus
  const bounds = getBoundingBox(secondBusNodes)

  // the backbone is defined as a list of YPoint objects and it must be an orthogonal path
  const backbone = new YList()

  // some constants assumed for this example with nodes arranged in rows
  const inset = 100
  const rowHeight = 50
  const nodeRowDistance = 70
  const backboneLeftX = bounds.topLeft.x - inset

  // start left, go down to where the first "backbone row" should start
  backbone.add(new YPoint(backboneLeftX, bounds.topLeft.y - inset))
  const backboneFirstRowY = bounds.topLeft.y + rowHeight + nodeRowDistance * 0.5
  backbone.add(new YPoint(backboneLeftX, backboneFirstRowY))
  // go right and back again, creating the first backbone row
  backbone.add(new YPoint(bounds.topRight.x + inset, backboneFirstRowY))
  backbone.add(new YPoint(backboneLeftX, backboneFirstRowY))
  // go down to the second row
  const backboneSecondRowY = backboneFirstRowY + nodeRowDistance + rowHeight
  backbone.add(new YPoint(backboneLeftX, backboneSecondRowY))
  // go right and back again, creating the second backbone row
  backbone.add(new YPoint(bounds.topRight.x + inset, backboneSecondRowY))
  backbone.add(new YPoint(backboneLeftX, backboneSecondRowY))
  // go down, prolonging the left vertical backbone a bit
  backbone.add(new YPoint(backboneLeftX, bounds.bottomLeft.y + inset))

  // finally, set the created backbone as the given bus points on the descriptor instance
  descriptorSecondBus.busPoints = new YPointPath(backbone)
}

/**
 * Returns the bounding box of the given nodes.
 */
function getBoundingBox(nodes: IEnumerable<INode>): Rect {
  let nodeBounds = Rect.EMPTY
  for (const node of nodes) {
    nodeBounds = Rect.add(nodeBounds, node.layout.toRect())
  }
  return nodeBounds
}
