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
  ExteriorNodeLabelModel,
  GeneralPath,
  GeneralPathNodeStyle,
  GraphComponent,
  GraphViewerInputMode,
  HorizontalTextAlignment,
  type IGraph,
  type LabelStyle,
  License,
  Point,
  Rect
} from '@yfiles/yfiles'
import { colorSets, createDemoNodeLabelStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

/**
 * Augment the GeneralPathNodeStyle type with the data used to create labels.
 */
type CustomNodeStyle = { style: GeneralPathNodeStyle; label: string }

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData

  // initialize the graph
  const graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()
  const graph = graphComponent.graph

  // create nodes with different custom shapes
  createCustomNodes(graph)

  // center the graph
  await graphComponent.fitGraphBounds()
}

/**
 * Creates several nodes that demonstrate various custom shapes.
 * @param graph The graph in which to create nodes.
 */
function createCustomNodes(graph: IGraph): void {
  // create several style instances that display various custom shapes
  const customNodeStyles: CustomNodeStyle[] = []

  // star with 3 points and 0.1 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(3, 0.1, 0, true),
      fill: colorSets['demo-lightblue'].fill,
      stroke: colorSets['demo-lightblue'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 3\nOuter-Inner Ratio: 0.1\nStretch to Height: True'
  })

  // star with 3 points and 1.3 outer-inner ratio, stretched to full bounding box width
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(3, 1.3, 0, false, true),
      fill: colorSets['demo-green'].fill,
      stroke: colorSets['demo-green'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 3\nOuter-Inner Ratio: 1.3\nStretch to Width: True'
  })

  // star with 4 points and 10 outer-inner ratio, rotated
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(4, 10, 0.1 * Math.PI),
      fill: colorSets['demo-orange'].fill,
      stroke: colorSets['demo-orange'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 4\nOuter-Inner Ratio: 10\nRotation Angle: 0.1 * π'
  })

  // star with 5 points and 0.5 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(5, 0.5),
      fill: colorSets['demo-red'].fill,
      stroke: colorSets['demo-red'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 5\nOuter-Inner Ratio: 0.5'
  })

  // star with 5 points and 3 outer-inner ratio, stretched to full bounding width
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(5, 3, 0.3 * Math.PI, false, true),
      fill: colorSets['demo-purple'].fill,
      stroke: colorSets['demo-purple'].stroke
    }),
    label:
      'Shape: Star\nPoint Count: 5\nOuter-Inner Ratio: 3\nRotation 0.3 * π\nStretch to Width: True'
  })

  // star with 8 points and 1.4 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(8, 1.4),
      fill: colorSets['demo-blue'].fill,
      stroke: colorSets['demo-blue'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 8\nOuter-Inner Ratio: 1.4'
  })

  // star with 6 points and 0.1 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(6, 0.1),
      fill: colorSets['demo-lightblue'].fill,
      stroke: colorSets['demo-lightblue'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 6\nOuter-Inner Ratio: 0.1'
  })

  // star with 10 points and 0.5 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(10, 0.5),
      fill: colorSets['demo-green'].fill,
      stroke: colorSets['demo-green'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 10\nOuter-Inner Ratio: 0.5'
  })

  // star with 10 points and 5 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(10, 5, 0),
      fill: colorSets['demo-orange'].fill,
      stroke: colorSets['demo-orange'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 10\nOuter-Inner Ratio: 5'
  })

  // star with 30 points and 0.8 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(30, 0.8),
      fill: colorSets['demo-red'].fill,
      stroke: colorSets['demo-red'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 30\nOuter-Inner Ratio: 0.8'
  })

  // star with 30 points and 5 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(30, 5, 0),
      fill: colorSets['demo-purple'].fill,
      stroke: colorSets['demo-purple'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 30\nOuter-Inner Ratio: 5'
  })

  // star with 30 points and 1.2 outer-inner ratio
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createStarPath(30, 1.2, 0),
      fill: colorSets['demo-blue'].fill,
      stroke: colorSets['demo-blue'].stroke
    }),
    label: 'Shape: Star\nPoint Count: 30\nOuter-Inner Ratio: 1.2'
  })

  // polygon with 3 points, stretched to height
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(3, 0, true, false),
      fill: colorSets['demo-lightblue'].fill,
      stroke: colorSets['demo-lightblue'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 3\nStretch to Height: True'
  })

  // polygon with 4 points
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(4),
      fill: colorSets['demo-green'].fill,
      stroke: colorSets['demo-green'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 4'
  })

  // polygon with 5 points, rotated 0.15 * Pi degrees, stretched to full bounding box height
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(5, 0.15 * Math.PI, true, false),
      fill: colorSets['demo-orange'].fill,
      stroke: colorSets['demo-orange'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 5\nRotation Angle: 0.15 * π\nStretch to Height: True'
  })

  // polygon with 5 points
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(5),
      fill: colorSets['demo-red'].fill,
      stroke: colorSets['demo-red'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 5\nRotation Angle: 0'
  })

  // polygon with 6 points, stretched to full bounding box width
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(6, 0, false, true),
      fill: colorSets['demo-purple'].fill,
      stroke: colorSets['demo-purple'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 6\nStretch to Width: True'
  })

  // polygon with 8 points
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(8),
      fill: colorSets['demo-blue'].fill,
      stroke: colorSets['demo-blue'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 8'
  })

  // polygon with 9 points
  customNodeStyles.push({
    style: new GeneralPathNodeStyle({
      path: GeneralPathNodeStyle.createPolygonPath(9),
      fill: colorSets['demo-lightblue'].fill,
      stroke: colorSets['demo-lightblue'].stroke
    }),
    label: 'Shape: Polygon\nPoint Count: 9'
  })

  // custom factory icon, facing right
  customNodeStyles.push({
    style: createFactoryNodeStyle('right', 'demo-green'),
    label: 'Shape: Factory Icon\nDirection: Right'
  })

  // custom factory icon, facing left
  customNodeStyles.push({
    style: createFactoryNodeStyle('left', 'demo-orange'),
    label: 'Shape: Factory Icon\nDirection: Left'
  })

  // custom airplane icon
  customNodeStyles.push({
    style: createAirplaneNodeStyle('demo-red'),
    label: 'Shape: Airplane Icon'
  })

  // custom computer icon
  customNodeStyles.push({
    style: createComputerNodeStyle('demo-purple'),
    label: 'Shape: Computer Icon'
  })

  // custom person icon
  customNodeStyles.push({ style: createPersonNodeStyle('demo-blue'), label: 'Shape: Person Icon' })

  // create a node for each style instance
  let x = 0
  let y = 0
  for (let i = 1; i <= customNodeStyles.length; ++i) {
    const width = 100
    const height = 100
    const customNodeStyle = customNodeStyles[i - 1]
    // create the node and label
    graph.addLabel(
      graph.createNode(new Rect(x, y, width, height), customNodeStyle.style),
      customNodeStyle.label,
      new ExteriorNodeLabelModel({ margins: 30 }).createParameter('bottom'),
      createLabelStyle()
    )
    // display 6 nodes in every row
    if (i % 6 === 0) {
      x = 0
      y += width + 150
    } else {
      x += height + 150
    }
  }
}

/**
 * Returns a GeneralPathNodeStyle instance that displays a factory icon.
 * @param direction The direction to which the shape should face.
 * @param colorSetName The name of the color set to use for nodes.
 */
function createFactoryNodeStyle(
  direction: 'right' | 'left',
  colorSetName:
    | 'demo-orange'
    | 'demo-blue'
    | 'demo-red'
    | 'demo-green'
    | 'demo-purple'
    | 'demo-lightblue'
): GeneralPathNodeStyle {
  const colorSet = colorSets[colorSetName]
  const generalPath = new GeneralPath()

  if (direction === 'right') {
    generalPath.moveTo(0.064, 0)
    generalPath.lineTo(0.17, 0)
    generalPath.lineTo(0.191, 0.625)
    generalPath.lineTo(0.234, 0.625)
    generalPath.lineTo(0.489, 0.475)
    generalPath.lineTo(0.489, 0.625)
    generalPath.lineTo(0.745, 0.475)
    generalPath.lineTo(0.745, 0.625)
    generalPath.lineTo(1, 0.475)
    generalPath.lineTo(1, 1)
    generalPath.lineTo(0, 1)
    generalPath.lineTo(0, 0.625)
    generalPath.lineTo(0.042, 0.625)
    generalPath.close()
  } else {
    generalPath.moveTo(0, 0.413)
    generalPath.lineTo(0.261, 0.543)
    generalPath.lineTo(0.261, 0.413)
    generalPath.lineTo(0.522, 0.543)
    generalPath.lineTo(0.522, 0.413)
    generalPath.lineTo(0.783, 0.543)
    generalPath.lineTo(0.826, 0.543)
    generalPath.lineTo(0.848, 0)
    generalPath.lineTo(0.956, 0)
    generalPath.lineTo(0.97, 0.543)
    generalPath.lineTo(1, 0.543)
    generalPath.lineTo(1, 1)
    generalPath.lineTo(0, 1)
    generalPath.close()
  }

  return new GeneralPathNodeStyle({
    path: generalPath,
    fill: colorSet.fill,
    stroke: colorSet.stroke
  })
}

/**
 * Returns a GeneralPathNodeStyle instance that displays a person icon.
 * @param colorSetName The name of the color set to use for nodes.
 */
function createPersonNodeStyle(
  colorSetName:
    | 'demo-orange'
    | 'demo-blue'
    | 'demo-red'
    | 'demo-green'
    | 'demo-purple'
    | 'demo-lightblue'
): GeneralPathNodeStyle {
  const colorSet = colorSets[colorSetName]
  const generalPath = new GeneralPath()

  generalPath.appendEllipse(Rect.from([0.167, 0, 0.667, 0.667]), true)
  generalPath.quadTo(new Point(0.167, 0.733), new Point(0, 1))
  generalPath.lineTo(1, 1)
  generalPath.quadTo(new Point(0.833, 0.733), new Point(0.5, 0.667))

  return new GeneralPathNodeStyle({
    path: generalPath,
    fill: colorSet.fill,
    stroke: colorSet.stroke
  })
}

/**
 * Returns a GeneralPathNodeStyle instance that displays a computer icon.
 * @param colorSetName The name of the color set to use for nodes.
 */
function createComputerNodeStyle(
  colorSetName:
    | 'demo-orange'
    | 'demo-blue'
    | 'demo-red'
    | 'demo-green'
    | 'demo-purple'
    | 'demo-lightblue'
): GeneralPathNodeStyle {
  const colorSet = colorSets[colorSetName]
  const generalPath = new GeneralPath()

  generalPath.appendRectangle(Rect.from([0, 0.4, 1, 0.5]), false)
  generalPath.moveTo(0.4, 0.9)
  generalPath.quadTo(new Point(0.42, 0.967), new Point(0.38, 1))
  generalPath.lineTo(0.62, 1)
  generalPath.quadTo(new Point(0.58, 0.967), new Point(0.6, 0.9))
  return new GeneralPathNodeStyle({
    path: generalPath,
    fill: colorSet.fill,
    stroke: colorSet.stroke
  })
}

/**
 * Returns a GeneralPathNodeStyle instance that displays an airplane icon.
 * @param colorSetName The name of the color set to use for nodes.
 */
function createAirplaneNodeStyle(
  colorSetName:
    | 'demo-orange'
    | 'demo-blue'
    | 'demo-red'
    | 'demo-green'
    | 'demo-purple'
    | 'demo-lightblue'
): GeneralPathNodeStyle {
  const colorSet = colorSets[colorSetName]
  const generalPath = new GeneralPath()

  generalPath.moveTo(0.162, 0.662)
  generalPath.lineTo(0.434, 0.529)
  generalPath.lineTo(0.434, 0.397)
  generalPath.quadTo(new Point(0.5, 0), new Point(0.567, 0.397))
  generalPath.lineTo(0.567, 0.529)
  generalPath.lineTo(0.838, 0.662)
  generalPath.lineTo(0.838, 0.706)
  generalPath.lineTo(0.603, 0.662)
  generalPath.lineTo(0.559, 0.662)
  generalPath.lineTo(0.559, 0.868)
  generalPath.lineTo(0.662, 0.926)
  generalPath.lineTo(0.662, 0.956)
  generalPath.lineTo(0.529, 0.926)
  generalPath.lineTo(0.5, 1)
  generalPath.lineTo(0.471, 0.926)
  generalPath.lineTo(0.338, 0.956)
  generalPath.lineTo(0.338, 0.926)
  generalPath.lineTo(0.456, 0.868)
  generalPath.lineTo(0.441, 0.662)
  generalPath.lineTo(0.397, 0.662)
  generalPath.lineTo(0.162, 0.706)
  generalPath.close()

  return new GeneralPathNodeStyle({
    path: generalPath,
    fill: colorSet.fill,
    stroke: colorSet.stroke
  })
}

/**
 * Creates the label style.
 */
function createLabelStyle(): LabelStyle {
  const style = createDemoNodeLabelStyle('demo-lightblue')
  style.horizontalTextAlignment = HorizontalTextAlignment.LEFT
  style.padding = [4, 8, 4, 8]
  style.textSize = 10
  return style
}

run().then(finishLoading)
