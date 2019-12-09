/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  Injector,
  ViewChild
} from '@angular/core'
import {
  IArrow,
  ICommand,
  IGraph,
  PolylineEdgeStyle,
  OrganicEdgeRouter,
  Size,
  TreeLayout,
  TreeReductionStage,
  INode
} from 'yfiles'
import { GraphComponentComponent } from './graph-component/graph-component.component'
import { EDGE_DATA, NODE_DATA } from './data'
import 'yfiles/view-layout-bridge.js'
import { Person } from './person'
import { NodeComponentStyle } from './NodeComponentStyle'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app'

  @ViewChild(GraphComponentComponent, { static: false })
  private gcComponent!: GraphComponentComponent

  public currentPerson?: Person

  constructor(
    private _injector: Injector,
    private _resolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    const graphComponent = this.gcComponent.graphComponent
    const graph = graphComponent.graph

    graph.nodeDefaults.size = new Size(285, 100)
    graph.nodeDefaults.style = new NodeComponentStyle(this._injector, this._resolver, this._appRef)

    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '2px rgb(170, 170, 170)',
      targetArrow: IArrow.NONE
    })

    graphComponent.addCurrentItemChangedListener(() => {
      this.currentPerson = graphComponent.currentItem!.tag
    })

    createSampleGraph(graph)

    runLayout(graph)

    graphComponent.fitGraphBounds()
  }

  zoomIn() {
    ICommand.INCREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }
  zoomOriginal() {
    ICommand.ZOOM.execute(1, this.gcComponent.graphComponent)
  }
  zoomOut() {
    ICommand.DECREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }
  fitContent() {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, this.gcComponent.graphComponent)
  }
}

function createSampleGraph(graph: IGraph) {
  const nodeMap: { [name: string]: INode } = {}

  NODE_DATA.forEach(nodeData => {
    nodeMap[nodeData.name] = graph.createNode({
      tag: new Person(nodeData)
    })
  })

  EDGE_DATA.forEach(({ from, to }) => {
    const fromNode = nodeMap[from]
    const toNode = nodeMap[to]
    if (fromNode && toNode) {
      graph.createEdge(fromNode, toNode)
    }
  })
}

function runLayout(graph: IGraph) {
  const treeLayout = new TreeLayout()
  const treeReductionStage = new TreeReductionStage()
  treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
  treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY

  treeLayout.appendStage(treeReductionStage)

  graph.applyLayout(treeLayout)
}
