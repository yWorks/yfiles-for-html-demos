import {
  Component,
  AfterViewInit,
  ElementRef,
  Injector,
  Output,
  EventEmitter,
  Compiler,
  ComponentFactoryResolver
} from '@angular/core'
import { NodeComponentStyle } from './NodeComponentStyle'
import { GraphDataService } from './graph-data.service'
import { NodeData } from './node-data'
import { NodeComponent } from './node.component'

@Component({
  entryComponents: [NodeComponent],
  selector: 'graph-component',
  //directives: [NodeComponent],
  template: `<div class="graph-component-container"></div>`,
  styles: [
    `
    .graph-component-container {
      position: absolute;
      left: 0;
      top: 60px;
      right: 0;
      bottom: 0;
      background-color: #FFFFFF;
    }
  `
  ]
})
export class GraphControlComponent implements AfterViewInit {
  @Output() currentItem: EventEmitter<any> = new EventEmitter()

  _graphComponent: yfiles.view.GraphComponent
  constructor(
    private _dataService: GraphDataService,
    private _element: ElementRef,
    private _injector: Injector,
    private _resolver: ComponentFactoryResolver
  ) {}

  ngAfterViewInit() {
    const containerDiv: HTMLDivElement = this._element.nativeElement.getElementsByClassName(
      'graph-component-container'
    )[0]
    this._graphComponent = new yfiles.view.GraphComponent(containerDiv)

    this._graphComponent.inputMode = new yfiles.input.GraphViewerInputMode()
    ;(<any>this._graphComponent).addCurrentItemChangedListener(
      (sender: yfiles.view.GraphComponent, args) => {
        const currentNode: yfiles.graph.INode = <yfiles.graph.INode>sender.currentItem
        const currentNodeData: NodeData = <NodeData>currentNode.tag
        this.currentItem.emit(currentNodeData)
      }
    )

    Promise.all([
      this._dataService.getNodeData() as any,
      this._dataService.getEdgeData() as any
    ]).then(values => {
      const nodes = values[0]
      const edges = values[1]

      const graphBuilder = new yfiles.binding.GraphBuilder(this._graphComponent.graph)

      graphBuilder.graph.nodeDefaults.style = new NodeComponentStyle(this._injector, this._resolver)
      graphBuilder.graph.nodeDefaults.size = new yfiles.geometry.Size(250, 100)

      graphBuilder.nodeIdBinding = 'name'
      graphBuilder.sourceNodeBinding = 'from'
      graphBuilder.targetNodeBinding = 'to'

      // assign the nodes and edges source - filter the nodes
      graphBuilder.nodesSource = nodes
      graphBuilder.edgesSource = edges

      // build the graph from the source data
      const graph = graphBuilder.buildGraph()

      this._graphComponent.graph = graph

      this._doLayout()
      this._graphComponent.fitGraphBounds()
    })
  }

  private _createTreeLayout(): yfiles.layout.ILayoutAlgorithm {
    const gtl = new yfiles.tree.TreeLayout()
    const /**yfiles.tree.TreeReductionStage*/ treeReductionStage = new yfiles.tree.TreeReductionStage()
    treeReductionStage.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
    treeReductionStage.nonTreeEdgeSelectionKey =
      yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY

    gtl.appendStage(treeReductionStage)
    return gtl
  }

  private _doLayout(): void {
    this._graphComponent.graph.applyLayout(this._createTreeLayout())
  }
}
