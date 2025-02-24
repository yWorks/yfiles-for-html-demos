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
import {
  BaseClass,
  Color,
  GraphComponent,
  GraphEditorInputMode,
  INode,
  IRenderContext,
  IVisualCreator,
  LayoutExecutor,
  License,
  OrganicLayout,
  OrganicLayoutData,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'
import WebglBlobVisual from './WebglBlobVisual'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { checkWebGLSupport, finishLoading } from '@yfiles/demo-resources/demo-page'
let graphComponent
const blueColor = Color.from('#242265')
const redColor = Color.from('#e01a4f')
const greyColor = Color.from('#767586')
const purpleColor = Color.from('#aa4586')
async function run() {
  if (!checkWebGLSupport()) {
    return
  }
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode({
    allowEditLabel: true,
    editLabelInputMode: {
      hideLabelDuringEditing: false
    }
  })
  createSampleGraph()
  // add a blob visualization for the reddish group
  const renderTree = graphComponent.renderTree
  renderTree.createElement(
    renderTree.backgroundGroup,
    new BlobBackground(
      (n) => {
        const color = n.style.fill
        return color == redColor || color == purpleColor
      },
      new Color(224, 113, 113, 196),
      120
    )
  )
  // add a blob visualization for the bluish group
  renderTree.createElement(
    renderTree.backgroundGroup,
    new BlobBackground(
      (n) => {
        const color = n.style.fill
        return color == blueColor || color == purpleColor
      },
      new Color(144, 142, 208, 196),
      150
    )
  )
  changeLayout()
  initializeUI()
}
const redStyle = new ShapeNodeStyle({
  shape: 'ellipse',
  fill: redColor,
  stroke: null
})
const blueStyle = new ShapeNodeStyle({
  shape: 'ellipse',
  fill: blueColor,
  stroke: null
})
const purpleStyle = new ShapeNodeStyle({
  shape: 'ellipse',
  fill: purpleColor,
  stroke: null
})
const greyStyle = new ShapeNodeStyle({
  shape: 'ellipse',
  fill: greyColor,
  stroke: null
})
/**
 * Creates the initial sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  graph.nodeDefaults.size = new Size(50, 50)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: redColor
  })
  graph.decorator.nodes.reshapeHandleProvider.hide()
  const styles = [greyStyle, redStyle, purpleStyle, blueStyle]
  for (const type of '0002211333000221333000221333000221333000221333000221333') {
    graph.createNode({ style: styles[Number(type)] })
  }
  const edges = (
    '0:1,0:2,1:2,8:9,9:7,7:8,5:6,1:9,3:6,4:6,6:8,10:11,10:12,11:12,17:18,18:16,16:17,' +
    '5:15,11:18,13:15,14:15,15:17,19:20,19:21,20:21,26:27,27:25,25:26,5:24,20:27,22:24,23:24,' +
    '24:26,28:29,28:30,29:30,35:36,36:34,34:35,5:33,29:36,31:33,32:33,33:35,37:38,37:39,38:39,' +
    '44:45,45:43,43:44,5:42,38:45,40:42,41:42,42:44,46:47,46:48,47:48,53:54,54:52,52:53,5:51,' +
    '47:54,49:51,50:51,51:53,21:12,10:2,0:37'
  )
    .split(',')
    .map((e) => e.split(':').map(Number))
  const nodes = graph.nodes.toArray()
  for (const e of edges) {
    graph.createEdge(nodes[e[0]], nodes[e[1]])
  }
  graphComponent.fitGraphBounds()
}
/**
 * Modifies the tag of each leaf node.
 */
function changeLayout() {
  const organicLayout = new OrganicLayout({
    compactnessFactor: Math.random() * 0.8,
    defaultPreferredEdgeLength: 70 + Math.random() * 20
  })
  const organicLayoutData = new OrganicLayoutData({
    scope: {
      nodes: graphComponent.graph.nodes
    }
  })
  new LayoutExecutor({
    graphComponent,
    layout: organicLayout,
    layoutData: organicLayoutData,
    animationDuration: '1s',
    animateViewport: true,
    easedAnimation: true
  }).start()
}
function initializeUI() {
  document.querySelector('#change-layout').addEventListener('click', changeLayout)
}
/**
 * A background visual creator that produces the metaball groups.
 */
class BlobBackground extends BaseClass(IVisualCreator) {
  selector
  size
  color
  constructor(selector, color, size) {
    super()
    this.selector = selector
    this.size = size
    this.color = color
  }
  createVisual(renderContext) {
    return new WebglBlobVisual(
      renderContext.canvasComponent.graph.nodes
        .filter(this.selector)
        .map((n) => n.layout.center.toPoint()),
      this.color,
      this.size
    )
  }
  updateVisual(renderContext, oldVisual) {
    return oldVisual
  }
}
run().then(finishLoading)
