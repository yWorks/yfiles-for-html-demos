/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import licenseData from '../../../../lib/license.json'
import {
  License,
  GraphComponent,
  ShapeNodeStyle,
  DefaultLabelStyle,
  ExteriorLabelModel,
  ICommand,
  InteriorStretchLabelModel,
  Point,
  Size,
  GraphEditorInputMode,
  PanelNodeStyle,
  HierarchicLayout,
  LayoutExecutor
} from 'yfiles'

License.value = licenseData

/**
 * A basic diagram component that encapsulates yFiles functionality such that it can be easily
 * loaded on demand with webpack's dynamic imports.
 */
export class DiagramComponent {
  get graphComponent() {
    return this.$graphComponent
  }

  constructor(container) {
    const graphComponent = new GraphComponent(container)
    graphComponent.inputMode = new GraphEditorInputMode()

    // make GraphComponent available on this instance
    this.$graphComponent = graphComponent

    // Set the default edge- and node styles
    this.initDefaultStyles()

    // add a sample graph
    this.createSampleGraph()
    this.$graphComponent.fitGraphBounds()

    // wire up toolbar buttons
    this.registerCommands()
  }

  initDefaultStyles() {
    const graph = this.$graphComponent.graph
    // configure defaults for normal nodes and their labels
    graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: 'darkorange',
      stroke: 'white'
    })
    graph.nodeDefaults.size = new Size(40, 40)
    graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'word-ellipsis'
    })
    graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

    // configure defaults for group nodes and their labels
    graph.groupNodeDefaults.style = new PanelNodeStyle({
      color: 'rgb(214, 229, 248)',
      insets: [18, 5, 5, 5],
      labelInsetsColor: 'rgb(214, 229, 248)'
    })
    graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
      horizontalTextAlignment: 'right'
    })
    graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
  }

  /**
   * Creates an initial sample graph.
   */
  createSampleGraph() {
    const graph = this.$graphComponent.graph
    const node1 = graph.createNodeAt([110, 20])
    const node2 = graph.createNodeAt([145, 95])
    const node3 = graph.createNodeAt([75, 95])
    const node4 = graph.createNodeAt([30, 175])
    const node5 = graph.createNodeAt([100, 175])

    graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

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

  /**
   * Loads separate webpack chunks that contain the yFiles layout functionality on-demand
   * and then applies a basic hierarchic layout.
   */
  async applyLayout() {
    const layout = new HierarchicLayout({
      layoutOrientation: 'left-to-right'
    })
    const executor = new LayoutExecutor(this.$graphComponent, layout)
    executor.duration = '1s'
    executor.animateViewport = true
    executor.easedAnimation = true
    executor.start()
  }

  /**
   * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
   */
  registerCommands() {
    // enable the buttons of the toolbar
    Array.prototype.slice
      .apply(document.querySelectorAll('.demo-toolbar button'))
      .forEach(button => button.removeAttribute('disabled'))

    // wire up buttons
    document.getElementById('zoom-in-btn').addEventListener('click', () => {
      ICommand.INCREASE_ZOOM.execute(null, this.$graphComponent)
    })
    document.getElementById('zoom-out-btn').addEventListener('click', () => {
      ICommand.DECREASE_ZOOM.execute(null, this.$graphComponent)
    })
    document.getElementById('reset-zoom-btn').addEventListener('click', () => {
      ICommand.ZOOM.execute(1, this.$graphComponent)
    })
    document.getElementById('fit-zoom-btn').addEventListener('click', () => {
      ICommand.FIT_GRAPH_BOUNDS.execute(null, this.$graphComponent)
    })
    document.getElementById('apply-layout-btn').addEventListener('click', () => {
      this.applyLayout()
    })
  }
}
