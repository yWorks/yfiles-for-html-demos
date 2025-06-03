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
import { Component, createRef, RefObject } from 'react'
import {
  Arrow,
  ExteriorNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  IGraph,
  License,
  Point,
  PolylineEdgeStyle,
  Size
} from '@yfiles/yfiles'
import './ReactGraphComponent.css'
import yFilesLicense from '../license.json'
import { ReactComponentNodeStyle } from '../ReactComponentNodeStyle'
import NodeTemplate from './NodeTemplate'

export default class ReactGraphComponent extends Component {
  private readonly div: RefObject<HTMLDivElement | null>
  private readonly graphComponent: GraphComponent

  constructor(props: object) {
    super(props)
    this.div = createRef<HTMLDivElement>()

    // include the yFiles License
    License.value = yFilesLicense

    // initialize the GraphComponent
    this.graphComponent = new GraphComponent()
    // register interaction
    this.graphComponent.inputMode = this.createInputMode()
    // specify default styles for newly created nodes and edges
    this.initializeDefaultStyles()
  }

  async componentDidMount(): Promise<void> {
    // Append the GraphComponent to the DOM
    this.div.current!.appendChild(this.graphComponent.htmlElement)
    this.createSampleGraph(this.graphComponent.graph)
    await this.graphComponent.fitGraphBounds()
  }

  componentWillUnmount() {
    this.graphComponent.graph.clear()
    this.div.current!.removeChild(this.graphComponent.htmlElement)
  }

  /**
   * Sets default styles for the graph.
   */
  initializeDefaultStyles(): void {
    this.graphComponent.graph.nodeDefaults.size = new Size(60, 40)
    this.graphComponent.graph.nodeDefaults.style = new ReactComponentNodeStyle(NodeTemplate)
    this.graphComponent.graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM
    this.graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      smoothingLength: 25,
      stroke: '4px #66485B',
      targetArrow: new Arrow({
        fill: '#66485B',
        lengthScale: 2,
        widthScale: 2,
        type: 'ellipse'
      })
    })
  }

  createInputMode(): GraphInputMode {
    const mode = new GraphEditorInputMode()
    mode.addEventListener('node-created', ({ item }, modeInput) => {
      item.tag = { name: `Node ${modeInput.graph!.nodes.size + 1}` }
    })
    return mode
  }

  /**
   * Creates an initial sample graph.
   */
  createSampleGraph(graph: IGraph): void {
    graph.clear()
    const node1 = graph.createNodeAt({ location: [110, 20], tag: { name: 'Node 1' } })
    const node2 = graph.createNodeAt({ location: [145, 95], tag: { name: 'Node 2' } })
    const node3 = graph.createNodeAt({ location: [75, 95], tag: { name: 'Node 3' } })
    const node4 = graph.createNodeAt({ location: [30, 175], tag: { name: 'Node 4' } })
    const node5 = graph.createNodeAt({ location: [100, 175], tag: { name: 'Node 5' } })

    const edge1 = graph.createEdge(node1, node2)
    const edge2 = graph.createEdge(node1, node3)
    const edge3 = graph.createEdge(node3, node4)
    const edge4 = graph.createEdge(node3, node5)
    const edge5 = graph.createEdge(node1, node5)
    graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
    graph.setPortLocation(edge1.targetPort, new Point(145, 75))
    graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
    graph.setPortLocation(edge2.targetPort, new Point(75, 75))
    graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
    graph.setPortLocation(edge3.targetPort, new Point(30, 155))
    graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
    graph.setPortLocation(edge4.targetPort, new Point(90, 155))
    graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
    graph.setPortLocation(edge5.targetPort, new Point(110, 155))
    graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
    graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
    graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
    graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])
  }

  render() {
    return <div className="graph-component-container" ref={this.div} />
  }
}
