import 'yfiles/yfiles.css'
import '../../resources/style/demo.css'

import {
  License,
  CanvasComponent,
  DefaultLabelStyle,
  Fill,
  GraphComponent,
  GraphOverviewComponent,
  ICommand,
  IGraph,
  INode,
  Point,
  PolylineEdgeStyle,
  Size,
  GraphEditorInputMode
} from 'yfiles'
import { MySimpleArrow } from './MyArrow'
import { MyMarqueeTemplate } from './MyMarqueeTemplate'
import { MyNodeStyle } from './MyNodeStyle'
// @ts-ignore: no declarations available for this plain js file
import { enableWorkarounds } from '../../utils/Workarounds'
import licenseData from '../../../lib/license.json'

License.value = licenseData

// enable browser-bug workarounds
enableWorkarounds()

function run() {
  document.getElementById('graphOverviewComponent')!.style.display = 'block'
  const demo = new TypeScript2Demo()
  demo.initializeGraph()
  demo.registerCommands()
}

export class TypeScript2Demo {
  private _graphComponent: GraphComponent

  get graphComponent(): GraphComponent {
    return this._graphComponent
  }

  get graph(): IGraph {
    return this.graphComponent.graph
  }

  constructor() {
    this._graphComponent = new GraphComponent('graphComponent')

    const overviewComponent = new GraphOverviewComponent('overviewComponent')
    overviewComponent.graphComponent = this._graphComponent

    const geim = new GraphEditorInputMode()
    geim.marqueeSelectionInputMode.template = new MyMarqueeTemplate()
    this.graphComponent.inputMode = geim

    this.graph.nodeDefaults.style = new MyNodeStyle()
    this.graph.nodeDefaults.size = new Size(40, 40)
    this.graph.nodeDefaults.labels.style = new DefaultLabelStyle({ textFill: Fill.WHITE })

    const pes = new PolylineEdgeStyle()
    const arrow = new MySimpleArrow()
    arrow.arrowThickness = 10
    pes.targetArrow = arrow
    this.graph.edgeDefaults.style = pes
  }

  initializeGraph() {
    let n: INode | null = null
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let p = this.graph.createNodeAt(new Point(100 * j, 100 * i))
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
    bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, this.graphComponent, null)
    bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, this.graphComponent, null)
    bindCommand(
      "button[data-command='FitContent']",
      ICommand.FIT_GRAPH_BOUNDS,
      this.graphComponent,
      null
    )
    bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, this.graphComponent, 1.0)
  }
}

function bindCommand(
  selector: string,
  command: ICommand,
  target: CanvasComponent,
  parameter: Object | null
) {
  const element = document.querySelector(selector)!
  command.addCanExecuteChangedListener((sender, e) => {
    if (command.canExecute(parameter, target)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })
  element.addEventListener('click', e => {
    if (command.canExecute(parameter, target)) {
      command.execute(parameter, target)
    }
  })
}

run()
