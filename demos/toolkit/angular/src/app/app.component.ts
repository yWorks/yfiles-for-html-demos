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
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  Injector,
  NgZone
} from '@angular/core'
import {
  GraphComponent,
  IArrow,
  ICommand,
  IGraph,
  INode,
  LayoutExecutorAsync,
  OrganicEdgeRouter,
  PolylineEdgeStyle,
  Size,
  TreeLayout,
  TreeReductionStage
} from 'yfiles'
import { EDGE_DATA, NODE_DATA } from './data'
import { Person } from './person'
import { NodeComponentStyle } from './NodeComponentStyle'
import { GraphComponentService } from './services/graph-component.service'
import { GraphSearch } from '../utils/GraphSearch'
import { zoomDetail, zoomIntermediate } from './node.component'

// Run layout calculation on a Web Worker
let layoutWorker: Worker
if (typeof Worker != 'undefined') {
  // @ts-ignore
  layoutWorker = new Worker(new URL('./layout.worker.ts', import.meta.url), { type: 'module' })
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app'

  public currentPerson?: Person
  private graphComponent!: GraphComponent
  searchString = ''
  graphSearch!: GraphSearch

  constructor(
    private _injector: Injector,
    private _resolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _zone: NgZone,
    private _graphComponentService: GraphComponentService
  ) {}

  ngAfterViewInit() {
    this.graphComponent = this._graphComponentService.getGraphComponent()

    // specify node and edge styles for newly created items
    this.setDefaultStyles(this.graphComponent.graph)

    // hook up the properties view panel with the current item of the graph
    this.graphComponent.addCurrentItemChangedListener(() => {
      this._zone.run(() => {
        this.currentPerson = this.graphComponent.currentItem!.tag
      })
    })

    // create a sample graph from data
    createSampleGraph(this.graphComponent.graph)
    this.graphComponent.fitGraphBounds()

    // Since the node component style runs "outside of angular", we have to
    // trigger change detection manually if the level of detail needs to change.
    let oldZoom = this.graphComponent.zoom
    this.graphComponent.addZoomChangedListener((_, evt) => {
      const newZoom = this.graphComponent.zoom
      if (
        (newZoom > zoomDetail && oldZoom <= zoomDetail) ||
        (newZoom <= zoomDetail && oldZoom > zoomDetail) ||
        (newZoom > zoomIntermediate && oldZoom <= zoomIntermediate) ||
        (newZoom <= zoomIntermediate && oldZoom > zoomIntermediate)
      ) {
        this._appRef.tick()
      }
      oldZoom = newZoom
    })

    // Run the layout animation outside angular zone, so no change detection
    // is initiated for listeners registered during the layout process.
    this._zone.runOutsideAngular(() => {
      // arrange the graph elements in a tree-like fashion
      runLayout(this.graphComponent)
    })

    // register the graph search
    this.graphSearch = new PersonSearch(this.graphComponent)
  }

  private setDefaultStyles(graph: IGraph) {
    graph.nodeDefaults.size = new Size(285, 100)
    graph.nodeDefaults.style = new NodeComponentStyle(
      this._injector,
      this._resolver,
      this._appRef,
      this._zone
    )

    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '2px rgb(170, 170, 170)',
      targetArrow: IArrow.NONE
    })
  }

  zoomIn() {
    ICommand.INCREASE_ZOOM.execute(null, this.graphComponent)
  }

  zoomOriginal() {
    ICommand.ZOOM.execute(1, this.graphComponent)
  }

  zoomOut() {
    ICommand.DECREASE_ZOOM.execute(null, this.graphComponent)
  }

  fitContent() {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)
  }

  onSearchInput(query: string) {
    this.graphSearch.updateSearch(query)
  }
}

function createSampleGraph(graph: IGraph): void {
  const nodeMap: { [name: string]: INode } = {}

  NODE_DATA.forEach((nodeData) => {
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

async function runLayout(graphComponent: GraphComponent): Promise<void> {
  if (layoutWorker != null) {
    // run layout calculation in a Web Worker thread

    // helper function that performs the actual message passing to the web worker
    function webWorkerMessageHandler(data: unknown): Promise<any> {
      return new Promise((resolve) => {
        layoutWorker.onmessage = (e: any) => resolve(e.data)
        layoutWorker.postMessage(data)
      })
    }

    // create an asynchronous layout executor that calculates a layout on the worker
    const executor = new LayoutExecutorAsync({
      messageHandler: webWorkerMessageHandler,
      graphComponent,
      duration: '1s',
      easedAnimation: true,
      animateViewport: true
    })

    await executor.start()
  } else {
    // just run the layout calculation in the main thread
    const treeLayout = new TreeLayout()
    const treeReductionStage = new TreeReductionStage()
    treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY

    treeLayout.appendStage(treeReductionStage)

    await graphComponent.morphLayout(treeLayout, '1s')
  }
}

class PersonSearch extends GraphSearch {
  matches(node: INode, text: string): boolean {
    if (node.tag instanceof Person) {
      const person = node.tag
      return person.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
    }
    return false
  }
}
