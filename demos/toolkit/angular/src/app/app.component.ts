/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EnvironmentInjector,
  NgZone
} from '@angular/core'
import {
  Command,
  Graph,
  GraphComponent,
  IArrow,
  IGraph,
  INode,
  LayoutExecutorAsync,
  PolylineEdgeStyle,
  Size,
  SvgExport
} from '@yfiles/yfiles'
import { EDGE_DATA, NODE_DATA } from './data'
import { Person } from './person'
import { GraphComponentService } from './services/graph-component.service'
import { GraphSearch } from '../utils/GraphSearch'
import { FormsModule } from '@angular/forms'
import { GraphOverviewComponentComponent } from './graph-overview-component/graph-overview-component.component'
import { GraphComponentComponent } from './graph-component/graph-component.component'
import { PropertiesViewComponent } from './properties-view/properties-view.component'
import { NodeComponentStyle } from './styles/NodeComponentStyle'

const layoutWorker = new Worker(new URL('./layout.worker.ts', import.meta.url), { type: 'module' })

function downloadFile(content: string, filename: string, type: string): void {
  const objectURL = URL.createObjectURL(new Blob([content], { type }))
  const aElement = document.createElement('a')
  aElement.setAttribute('href', objectURL)
  aElement.setAttribute('download', filename)
  aElement.style.display = 'none'
  document.body.appendChild(aElement)
  aElement.click()
  document.body.removeChild(aElement)
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    FormsModule,
    GraphComponentComponent,
    GraphOverviewComponentComponent,
    PropertiesViewComponent
  ]
})
export class AppComponent implements AfterViewInit {
  title = 'app'

  public currentPerson?: Person
  private graphComponent!: GraphComponent
  searchString = ''
  graphSearch!: GraphSearch

  constructor(
    private _appRef: ApplicationRef,
    private _zone: NgZone,
    private _environmentInjector: EnvironmentInjector,
    private _graphComponentService: GraphComponentService
  ) {}

  ngAfterViewInit() {
    this.graphComponent = this._graphComponentService.getGraphComponent()

    // specify node and edge styles for newly created items
    this.setDefaultStyles(this.graphComponent.graph)

    // hook up the properties view panel with the current item of the graph
    this.graphComponent.addEventListener('current-item-changed', () => {
      this.currentPerson = this.graphComponent.currentItem!.tag
    })

    // create a sample graph from data
    createSampleGraph(this.graphComponent.graph)
    this.graphComponent.fitGraphBounds()

    // Run the layout animation outside angular zone, so no change detection
    // is initiated for listeners registered during the layout process.
    // See https://docs.yworks.com/yfileshtml/#/kb/article/848/Improving_performance_of_large_Angular_applications
    this._zone.runOutsideAngular(() => {
      // Arrange the graph elements in a tree-like fashion
      // See https://docs.yworks.com/yfileshtml/#/kb/article/848/Improving_performance_of_large_Angular_applications
      void runLayout(this.graphComponent)
    })

    // register the graph search
    this.graphSearch = new PersonSearch(this.graphComponent)
  }

  private setDefaultStyles(graph: IGraph) {
    graph.nodeDefaults.size = new Size(285, 100)
    graph.nodeDefaults.style = new NodeComponentStyle(
      this._appRef,
      this._environmentInjector,
      this._zone
    )

    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '2px rgb(170, 170, 170)',
      targetArrow: IArrow.NONE
    })
  }

  zoomIn() {
    this.graphComponent.executeCommand(Command.INCREASE_ZOOM)
  }

  zoomOriginal() {
    this.graphComponent.executeCommand(Command.ZOOM, 1)
  }

  zoomOut() {
    this.graphComponent.executeCommand(Command.DECREASE_ZOOM)
  }

  fitContent() {
    void this.graphComponent.fitGraphBounds()
  }

  /**
   * Exports the graph component to an SVG file
   */
  async exportSvg() {
    const exportComponent = new GraphComponent({ graph: this.graphComponent.graph })
    exportComponent.updateContentBounds()
    const exporter = new SvgExport({
      worldBounds: exportComponent.contentBounds,
      inlineSvgImages: true,
      zoom: this.graphComponent.zoom,
      // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
      cssStyleSheet: null
    })
    const svg = await exporter.exportSvgAsync(
      exportComponent,
      // this callback is needed since Angular needs to finish rendering its templates
      async () => this._appRef.tick()
    )
    // Dispose of the component and remove its references to the graph
    exportComponent.graph = new Graph()
    exportComponent.cleanUp()

    // download the result
    downloadFile(SvgExport.exportSvgString(svg), 'graph.svg', 'image/svg+xml')
  }

  onSearchInput(query: string) {
    this.graphSearch.updateSearch(query)
  }
}

function createSampleGraph(graph: IGraph): void {
  const nodeMap: { [name: string]: INode } = {}

  NODE_DATA.forEach((nodeData) => {
    nodeMap[nodeData.name] = graph.createNode({ tag: new Person(nodeData) })
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
  // create an asynchronous layout executor that calculates a layout on the worker
  const executor = new LayoutExecutorAsync({
    messageHandler: LayoutExecutorAsync.createWebWorkerMessageHandler(layoutWorker),
    graphComponent,
    animationDuration: '1s',
    easedAnimation: true,
    animateViewport: true
  })
  await executor.start()
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
