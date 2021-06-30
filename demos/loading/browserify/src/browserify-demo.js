/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
const {
  License,
  GraphComponent,
  GraphEditorInputMode,
  PolylineEdgeStyle,
  SolidColorFill,
  ShapeNodeStyle
} = require('yfiles-umd/view-editor')
const { OrganicLayout, MinimumNodeSizeStage } = require('yfiles-umd/layout-organic')
require('yfiles-umd/view-layout-bridge')

const Color = require('color')

const licenseData = require('../../../../lib/license.json')
License.value = licenseData

const graphComponent = new GraphComponent('graphComponent')

graphComponent.inputMode = new GraphEditorInputMode()

// Set the default edge- and node styles
graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle()
const color = Color('#2c3e50')
const defaultColor = color.rotate(-75).lighten(0.75)
graphComponent.graph.nodeDefaults.style = createStyle(defaultColor)

createSampleGraph(graphComponent.graph, color)
layout()
graphComponent.fitGraphBounds()

function layout() {
  const layoutAlgorithm = new MinimumNodeSizeStage(new OrganicLayout())
  graphComponent.morphLayout(layoutAlgorithm, '2s')
}

/**
 * @param {IGraph} graph
 * @param {Color} styleColor
 */
function createSampleGraph(graph, styleColor) {
  graph.clear()

  /** @type {INode[]} */
  const nodes = []
  for (let j = 0; j < 27; j++) {
    nodes[j] = graph.createNode()
    styleColor = styleColor.rotate(-5).lighten(0.05)
    graph.setStyle(nodes[j], createStyle(styleColor))
  }

  graph.createEdge(nodes[3], nodes[7])
  graph.createEdge(nodes[0], nodes[1])
  graph.createEdge(nodes[0], nodes[4])
  graph.createEdge(nodes[1], nodes[2])
  graph.createEdge(nodes[0], nodes[9])
  graph.createEdge(nodes[6], nodes[10])
  graph.createEdge(nodes[11], nodes[12])
  graph.createEdge(nodes[11], nodes[13])
  graph.createEdge(nodes[8], nodes[11])
  graph.createEdge(nodes[15], nodes[16])
  graph.createEdge(nodes[16], nodes[17])
  graph.createEdge(nodes[18], nodes[19])
  graph.createEdge(nodes[20], nodes[21])
  graph.createEdge(nodes[7], nodes[17])
  graph.createEdge(nodes[9], nodes[22])
  graph.createEdge(nodes[22], nodes[3])
  graph.createEdge(nodes[19], nodes[0])
  graph.createEdge(nodes[8], nodes[4])
  graph.createEdge(nodes[18], nodes[25])
  graph.createEdge(nodes[24], nodes[8])
  graph.createEdge(nodes[26], nodes[25])
  graph.createEdge(nodes[10], nodes[20])
  graph.createEdge(nodes[5], nodes[23])
  graph.createEdge(nodes[25], nodes[15])
  graph.createEdge(nodes[10], nodes[15])
  graph.createEdge(nodes[21], nodes[17])
  graph.createEdge(nodes[26], nodes[6])
  graph.createEdge(nodes[13], nodes[12])
  graph.createEdge(nodes[12], nodes[14])
  graph.createEdge(nodes[14], nodes[11])
  graph.createEdge(nodes[21], nodes[5])
  graph.createEdge(nodes[5], nodes[6])
  graph.createEdge(nodes[9], nodes[7])
  graph.createEdge(nodes[19], nodes[24])
}

/**
 * Use the Color npm module to create color variants for the node style
 * @param {Color} styleColor
 * @return {ShapeNodeStyle}
 */
function createStyle(styleColor) {
  const c = styleColor.rgb().round()
  const brush = new SolidColorFill(c.red(), c.green(), c.blue(), c.alpha() * 255)
  return new ShapeNodeStyle({
    shape: 'ellipse',
    stroke: null,
    fill: brush
  })
}
