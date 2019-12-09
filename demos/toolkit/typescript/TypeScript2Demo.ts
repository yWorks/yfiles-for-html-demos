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
import { enableWorkarounds } from './utils/Workarounds'
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
