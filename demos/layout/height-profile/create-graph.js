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
import { getMax, SCALED_MAX_X, SCALED_MAX_Y, scalePoint } from './scale-data'
import { nodeData } from './resources/TrekkingData'
import { getIcon, labelNodeSize, leaderEdgeStyle } from './styles'
import {
  IconLabelStyle,
  InteriorNodeLabelModel,
  LabelStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'

/**
 * Creates the graph from the trekking dataset.
 * For each data item in the dataset, a waypoint node and an associated label node is created.
 */
export function initializeGraph(graphComponent) {
  const graph = graphComponent.graph

  // use the default node size as size for waypoint nodes
  const { width, height } = graph.nodeDefaults.size

  // get the min/max values from the dataset to be able to scale the data
  const { maxX, maxY } = getMax(nodeData.trail)

  for (const data of nodeData.waypoints) {
    const xPos = scalePoint(data.x, maxX, SCALED_MAX_X)
    const yPos = -scalePoint(data.y, maxY, SCALED_MAX_Y)

    const waypoint = graph.createNode({
      layout: new Rect(xPos - width * 0.5, yPos - height * 0.5, width, height),
      tag: { ...data, type: 'waypoint' }
    })

    // create the label node and define its tag based on the tag of the associated waypoint
    const labelNode = graph.createNode({
      tag: { ...data, type: 'label' },
      layout: new Rect(0, 0, labelNodeSize.width, labelNodeSize.height)
    })

    // set the style of the label node and ...
    graph.setStyle(
      labelNode,
      new ShapeNodeStyle({ shape: ShapeNodeShape.ROUND_RECTANGLE, fill: '#ffffff66', stroke: null })
    )
    graph.addLabel(labelNode, `${data.y} m`, InteriorNodeLabelModel.BOTTOM)
    const icon = getIcon(data)
    if (icon) {
      graph.addLabel(
        labelNode,
        '',
        InteriorNodeLabelModel.TOP,
        new IconLabelStyle({
          href: icon,
          iconPlacement: InteriorNodeLabelModel.TOP,
          iconSize:
            data.category === 'yWorks'
              ? new Size(labelNodeSize.width * 0.6, labelNodeSize.height * 0.6)
              : new Size(labelNodeSize.height * 0.6, labelNodeSize.height * 0.6)
        })
      )
    } else {
      graph.addLabel(
        labelNode,
        data.name,
        InteriorNodeLabelModel.TOP,
        new LabelStyle({ font: '16px sans-serif', textFill: '#336699' })
      )
    }

    // ... create an edge between the waypoint and the label node
    graph.createEdge(waypoint, labelNode, leaderEdgeStyle)
  }
}
