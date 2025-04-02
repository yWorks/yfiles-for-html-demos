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
  GraphBuilder,
  GraphComponent,
  type IGraph,
  type INode,
  LayoutExecutor,
  License,
  OrganicLayout
} from '@yfiles/yfiles'

import { type ImportNode, type Node, type TimelineData, timelineData } from './timeline-data'
import { type TimeEntry, Timeline } from './timeline-component/Timeline'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-ui/finish-loading'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'

/**
 * The main graph component that displays the graph.
 */
let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the main graph component and graph style
  graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph
  initDemoStyles(graph)

  // build graph with the given data
  buildGraph(graph, timelineData)

  //initialize the timeline component
  const timeline = initializeTimeline()

  // build timeline with the data stored in graph nodes
  timeline.items = graph.nodes.map(getNodeData).toArray()

  // apply layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new OrganicLayout())
  await graphComponent.fitGraphBounds()
}

/**
 * Initializes a timeline component without timeframe rectangle and play button,
 * and register click and hover event listeners on its bar elements.
 * @returns The timeline component
 */
function initializeTimeline(): Timeline<Node> {
  const timelineStyle = {
    inTimeframeBars: { fill: '#e0d5cc' },
    barHover: { stroke: '#662b00' },
    barSelect: { fill: '#ffc499' },
    legend: {
      even: { backgroundFill: '#ff6c00' },
      odd: { backgroundFill: '#ffc499' }
    }
  }

  const timeline = new Timeline('timeline-component', getTimeEntry, timelineStyle, false, false)

  timeline.setBarSelectListener((items: Node[]) => {
    const selection = graphComponent.selection
    selection.clear()

    const selectedItems = new Set(items.map((item) => item.id))
    graphComponent.graph.nodes.forEach((node: INode) => {
      const nodeData = getNodeData(node)
      if (selectedItems.has(nodeData.id)) {
        selection.add(node)
      }
    })
  })

  timeline.setBarHoverListener((items: Node[]) => {
    const highlights = graphComponent.highlights
    highlights.clear()

    const selectedItems = new Set(items.map((item) => item.id))
    graphComponent.graph.nodes.forEach((node) => {
      const nodeData = getNodeData(node)
      if (selectedItems.has(nodeData.id)) {
        highlights.add(node)
      }
    })
  })

  return timeline
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, data: TimelineData): void {
  const builder = new GraphBuilder(graph)

  const entityNodesSource = builder.createNodesSource(data.nodeList, 'id')

  entityNodesSource.nodeCreator.tagProvider = (node: ImportNode): Node => ({
    ...node,
    start: convertDates(node.start),
    end: convertDates(node.end)
  })

  builder.createEdgesSource(data.edgeList, 'from', 'to')

  builder.buildGraph()
}

/**
 * Returns an object or a list of objects containing the timestamps
 * of the start and end dates stored in the data for the given node.
 */
function getTimeEntry(item: Node): TimeEntry {
  const ni = item as Node

  if (ni.start.length === 1 && ni.end.length === 1) {
    return { start: ni.start[0].getTime(), end: ni.end[0].getTime() }
  } else {
    return ni.start.map((enter, index) => ({
      start: enter.getTime(),
      end: ni.end[index].getTime()
    }))
  }
}

/**
 * Returns the information stored in the data for the given node.
 */
function getNodeData(node: INode): Node {
  return node.tag as Node
}

/**
 * Returns a Date object or a list of Date objects that are converted from
 * the given string / list of string.
 */
function convertDates(dates: string[] | string): Date[] {
  return Array.isArray(dates) ? dates.map((e: string) => new Date(e)) : [new Date(dates)]
}

void run().then(finishLoading)
