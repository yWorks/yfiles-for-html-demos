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
