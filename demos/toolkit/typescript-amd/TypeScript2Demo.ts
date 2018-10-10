/// <amd-dependency path="../../resources/demo-app" name="app"/>
import yfiles = require('yfiles/view-editor')
import { MySimpleArrow } from './MyArrow'
import { MyMarqueeTemplate } from './MyMarqueeTemplate'
import { MyNodeStyle } from './MyNodeStyle'

declare var app: any

export function run() {
  app.show()
  document.getElementById('graphOverviewComponent').style.display = 'block'
  const demo = new TypeScript2Demo()
  demo.initializeGraph()
  demo.registerCommands()
}

export class TypeScript2Demo {
  private _graphComponent: yfiles.view.GraphComponent

  get graphComponent(): yfiles.view.GraphComponent {
    return this._graphComponent
  }

  get graph(): yfiles.graph.IGraph {
    return this.graphComponent.graph
  }

  constructor() {
    this._graphComponent = new yfiles.view.GraphComponent('graphComponent')

    const overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent')
    overviewComponent.graphComponent = this._graphComponent

    const geim = new yfiles.input.GraphEditorInputMode()
    geim.marqueeSelectionInputMode.template = new MyMarqueeTemplate()
    this.graphComponent.inputMode = geim

    this.graph.nodeDefaults.style = new MyNodeStyle()
    this.graph.nodeDefaults.size = new yfiles.geometry.Size(40, 40)
    this.graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      textFill: yfiles.view.Fill.WHITE
    })

    const pes = new yfiles.styles.PolylineEdgeStyle()
    const arrow = new MySimpleArrow()
    arrow.arrowThickness = 10
    pes.targetArrow = arrow
    this.graph.edgeDefaults.style = pes
  }

  initializeGraph() {
    let n: yfiles.graph.INode = null
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let p = this.graph.createNodeAt(new yfiles.geometry.Point(100 * j, 100 * i))
        if (n) {
          this.graph.createEdge(n, p)
        }
        n = p
      }
    }
    this.graph.nodes.forEach((node, i) => this.graph.addLabel(node, i.toString()))
    this.graphComponent.fitGraphBounds()
  }

  registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand(
      "button[data-command='ZoomIn']",
      iCommand.INCREASE_ZOOM,
      this.graphComponent,
      null
    )
    app.bindCommand(
      "button[data-command='ZoomOut']",
      iCommand.DECREASE_ZOOM,
      this.graphComponent,
      null
    )
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      this.graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, this.graphComponent, 1.0)
  }
}
