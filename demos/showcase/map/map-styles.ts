/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ArcEdgeStyle,
  DefaultLabelStyle,
  ExteriorLabelModel,
  FreeNodePortLocationModel,
  GeneralPath,
  type IEdge,
  type IGraph,
  ImageNodeStyle
} from 'yfiles'

/**
 * Initializes styles and label positions for all graph elements.
 */
export function initializeDefaultMapStyles(graph: IGraph): void {
  graph.nodeDefaults.style = createMapNodeStyle()
  graph.nodeDefaults.size = [40, 40]
  graph.nodeDefaults.labels.style = createLabelStyle()
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH
  graph.nodeDefaults.ports.locationParameter = FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED

  graph.edgeDefaults.style = createMapEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = false
}

/**
 * Creates a default style for airports.
 */
function createMapNodeStyle(): ImageNodeStyle {
  // create a normalized outline to have a drop-shaped hit-test
  const outline = new GeneralPath()
  outline.moveTo(0.5, 0)
  outline.cubicTo(0.289, 0, 0.118, 0.171, 0.118, 0.382)
  outline.cubicTo(0.118, 0.509, 0.18, 0.621, 0.275, 0.691)
  outline.cubicTo(0.287, 0.699, 0.295, 0.713, 0.307, 0.722)
  outline.lineTo(0.5, 1)
  outline.lineTo(0.725, 0.684)
  outline.cubicTo(0.82, 0.614, 0.882, 0.502, 0.882, 0.375)
  outline.cubicTo(0.882, 0.164, 0.711, 0, 0.5, 0)
  outline.close()

  return new ImageNodeStyle({
    image: 'resources/airport-drop.svg',
    normalizedOutline: outline
  })
}

/**
 * Creates a default style for connections between airports.
 */
function createMapEdgeStyle(): ArcEdgeStyle {
  return new ArcEdgeStyle({
    stroke: '5px dashed #242265',
    height: 100
  })
}

/**
 * Creates a default style for the labels at the airports.
 */
function createLabelStyle(): DefaultLabelStyle {
  return new DefaultLabelStyle({
    shape: 'pill',
    backgroundFill: '#c5e4d1',
    textFill: '#2c4b38',
    insets: [3, 6]
  })
}

/**
 * Returns the height of the edge arc considering the length of the edge.
 * This ensures that long edges still have a visible arc.
 */
export function getArcHeight(edge: IEdge): number {
  const sourceCenter = edge.sourceNode!.layout.center
  const targetCenter = edge.targetNode!.layout.center
  const distance = sourceCenter.distanceTo(targetCenter)
  if (distance < 500) {
    return distance / 10
  }
  return 100
}
