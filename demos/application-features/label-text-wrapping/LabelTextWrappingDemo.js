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
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  Font,
  GraphComponent,
  GraphEditorInputMode,
  GraphModelManager,
  IGraph,
  LabelStyle,
  License,
  Rect,
  RectangleNodeStyle,
  ShapeNodeStyle,
  Size,
  StretchNodeLabelModel,
  WebGLGraphModelManager
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { BrowserDetection, finishLoading } from '@yfiles/demo-resources/demo-page'
import {
  initializeSvgWebGlSwitchButton,
  updateSvgWebGlSwitchButton
} from '../../style/group-node-style/svg-webgl-switch'

let graphComponent

/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  // configure the graphModelManager to support switching between svg and webgl rendering
  graphComponent.graphModelManager = BrowserDetection.webGL2
    ? new WebGLGraphModelManager({ renderMode: 'svg' })
    : new GraphModelManager()
  graphComponent.inputMode = new GraphEditorInputMode()
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // Configure default label model parameters for newly created graph elements
  setDefaultLabelLayoutParameters()

  // add a sample graph
  createGraph()

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Sets up default label model parameters for graph elements.
 * Label model parameters control the actual label placement as well as the available
 * placement candidates when moving the label interactively.
 */
function setDefaultLabelLayoutParameters() {
  // Use a label model that stretches the label over the full node layout, with small margins. The label style
  // is responsible for drawing the label in the given space. Depending on its implementation, it can either
  // ignore the given space, clip the label at the width or wrapping the text.
  // See the createGraph function where labels are added with different style options.
  graphComponent.graph.nodeDefaults.labels.layoutParameter = new StretchNodeLabelModel({
    padding: 5
  }).createParameter('center')
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates a simple sample graph.
 */
function createGraph() {
  // label model and style for the description labels above the node
  const topParameter = new ExteriorNodeLabelModel({ margins: 10 }).createParameter('top')
  const topLabelStyle = new LabelStyle({ horizontalTextAlignment: 'center' })
  const graph = graphComponent.graph
  const defaultNodeStyle = graph.nodeDefaults.style

  // create nodes
  const node1 = graph.createNode(new Rect(0, 0, 190, 200))
  const node2 = graph.createNode(new Rect(250, -150, 190, 200))
  const node3 = graph.createNode(new Rect(250, 150, 190, 200))
  const node4 = graph.createNode(new Rect(500, -150, 190, 200))
  const node5 = graph.createNode(new Rect(500, 150, 190, 200))
  const node6 = graph.createNode(
    new Rect(750, -150, 190, 200),
    new ShapeNodeStyle({
      shape: 'hexagon',
      fill: defaultNodeStyle.fill,
      stroke: defaultNodeStyle.stroke
    })
  )
  const node7 = graph.createNode(
    new Rect(750, 150, 190, 200),
    new ShapeNodeStyle({
      shape: 'triangle',
      fill: defaultNodeStyle.fill,
      stroke: defaultNodeStyle.stroke
    })
  )
  const node8 = graph.createNode(
    new Rect(1000, 150, 190, 200),
    new ShapeNodeStyle({
      shape: 'ellipse',
      fill: defaultNodeStyle.fill,
      stroke: defaultNodeStyle.stroke
    })
  )
  const node9 = graph.createNode(
    new Rect(1000, -150, 190, 200),
    new ShapeNodeStyle({
      shape: 'octagon',
      fill: defaultNodeStyle.fill,
      stroke: defaultNodeStyle.stroke
    })
  )

  // use a label model that stretches the label over the full node layout, with small margins
  const centerParameter = new StretchNodeLabelModel({ padding: 5 }).createParameter('center')

  // maybe showcase right-to-left text direction
  const rtlDirection = document.querySelector('#trl-toggle').checked

  // the text that should be displayed
  const longText = rtlDirection
    ? 'כל בני האדם נולדו בני חורין ושווים בערכם בזכויותיהם. כולם התברכו בתבונה ובמצפון, לפיכך חובה לנהוג איש ברעהו ברוח של אחווה.\n\n' +
      'כל אדם זכאי לזכויות ולחירויות שנקבעו בהכרזה זו ללא אפליה מטעמי: גזע, צבע, מין, שפה, דת, דעה פוליטית או דעה בנושאים אחרים, שמקורם במוצא לאומי או חברתי, רכוש, לידה או מעמד אחר.\n' +
      'יתרה מזו, לא יופלה אדם על בסיס מעמדה המדיני, סמכותה או על פי מעמדה הבינלאומי של המדינה או הארץ שאליה הוא שייך. בין שהארץ היא עצמאית, ובין שהיא נתונה לנאמנות, בין שהיא נטולת שלטון עצמי ובין שריבונותה מוגבלת.'
    : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n \n' +
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n' +
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  const font = new Font({ fontSize: 16 })

  // A label that does not wrap at all. By default, it is clipped at the given bounds, though this can also be
  // disabled with the clipText property of the LabelStyle.
  const noWrappingStyle = new LabelStyle({
    font,
    wrapping: 'clip',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node1, longText, centerParameter, noWrappingStyle)
  graph.addLabel(node1, 'No Wrapping', topParameter, topLabelStyle)

  // A label that is wrapped at word boundaries.
  const wordWrappingStyle = new LabelStyle({
    font,
    wrapping: 'wrap-word',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node2, longText, centerParameter, wordWrappingStyle)
  graph.addLabel(node2, 'Word Wrapping', topParameter, topLabelStyle)

  // A label that is wrapped at single characters.
  const characterWrappingStyle = new LabelStyle({
    font,
    wrapping: 'wrap-character',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node3, longText, centerParameter, characterWrappingStyle)
  graph.addLabel(node3, 'Character Wrapping', topParameter, topLabelStyle)

  // A label that is wrapped at word boundaries but also renders ellipsis if there is not enough space.
  const ellipsisWordWrappingStyle = new LabelStyle({
    font,
    wrapping: 'wrap-word-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node4, longText, centerParameter, ellipsisWordWrappingStyle)
  graph.addLabel(node4, 'Word Wrapping\nwith Ellipsis', topParameter, topLabelStyle)

  // A label that is wrapped at single characters but also renders ellipsis if there is not enough space.
  const ellipsisCharacterWrappingStyle = new LabelStyle({
    font,
    wrapping: 'wrap-character-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node5, longText, centerParameter, ellipsisCharacterWrappingStyle)
  graph.addLabel(node5, 'Character Wrapping\nwith Ellipsis', topParameter, topLabelStyle)

  // A label that is wrapped at word boundaries but uses a hexagon shape to fit the text inside.
  // The textWrappingShape can be combined with any wrapping and the textWrappingPadding is kept
  // empty inside this shape.
  const wordHexagonShapeStyle = new LabelStyle({
    font,
    wrapping: 'wrap-word',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left',
    textWrappingShape: 'hexagon',
    textWrappingPadding: 5
  })
  graph.addLabel(node6, longText, centerParameter, wordHexagonShapeStyle)
  graph.addLabel(node6, 'Word Wrapping\nat Hexagon Shape', topParameter, topLabelStyle)

  // A label that is wrapped at single characters inside a triangular shape.
  const characterEllipsisTriangleShapeStyle = new LabelStyle({
    font,
    wrapping: 'wrap-character-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left',
    textWrappingShape: 'triangle',
    textWrappingPadding: 5
  })
  graph.addLabel(node7, longText, centerParameter, characterEllipsisTriangleShapeStyle)
  graph.addLabel(node7, 'Character Wrapping\nat Triangle Shape', topParameter, topLabelStyle)

  // A label that is wrapped at single characters inside an elliptic shape.
  // In addition to the textWrappingPadding, some paddings are defined for the top and bottom side
  // to keep the upper and lower part of the ellipse empty.
  const characterEllipsisEllipseShapeStyle = new LabelStyle({
    font,
    wrapping: 'wrap-character-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left',
    textWrappingShape: 'ellipse',
    textWrappingPadding: 5,
    padding: [20, 20, 20, 20]
  })
  graph.addLabel(node8, longText, centerParameter, characterEllipsisEllipseShapeStyle)
  graph.addLabel(
    node8,
    'Character Wrapping\nat Ellipse Shape\nwith Top/Bottom Insets',
    topParameter,
    topLabelStyle
  )

  // A label that is wrapped at word boundaries inside an octagon shape.
  // In addition to the textWrappingPadding, some paddings are defined for the top and bottom side
  // to keep the upper and lower part of the octagon empty.
  const wordEllipsisOctagonShapeStyle = new LabelStyle({
    font,
    wrapping: 'wrap-word-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left',
    textWrappingShape: 'octagon',
    textWrappingPadding: 5,
    padding: [20, 20, 20, 20]
  })
  graph.addLabel(node9, longText, centerParameter, wordEllipsisOctagonShapeStyle)
  graph.addLabel(
    node9,
    'Word Wrapping\nat Octagon Shape\nwith Top/Bottom Insets',
    topParameter,
    topLabelStyle
  )

  graph.undoEngine.clear()
  void graphComponent.fitGraphBounds()
}

/**
 * Rebuilds the demo when the text direction changes.
 */
function reinitializeDemo() {
  // Dispose of the previous component
  graphComponent.cleanUp()

  const gcContainer = document.querySelector('#graphComponent')
  while (gcContainer.childElementCount > 0) {
    gcContainer.removeChild(gcContainer.firstElementChild)
  }
  graphComponent = new GraphComponent('#graphComponent')
  // configure the graphModelManager to support switching between svg and webgl rendering
  graphComponent.graphModelManager = BrowserDetection.webGL2
    ? new WebGLGraphModelManager({ renderMode: 'svg' })
    : new GraphModelManager()
  graphComponent.inputMode = new GraphEditorInputMode()
  graphComponent.graph.undoEngineEnabled = true
  initializeGraph(graphComponent.graph)
  setDefaultLabelLayoutParameters()
  createGraph()

  updateSvgWebGlSwitchButton('#render-modes', graphComponent)
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI() {
  document.querySelector('#trl-toggle').addEventListener('click', () => {
    const gcContainer = document.querySelector('#graphComponent')
    gcContainer.style.direction = document.querySelector('#trl-toggle').checked ? 'rtl' : 'ltr'
    reinitializeDemo()
  })
  initializeSvgWebGlSwitchButton('#render-modes', graphComponent)
}

run().then(finishLoading)
