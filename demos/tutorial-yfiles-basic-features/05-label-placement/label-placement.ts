/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  type IGraph,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  NinePositionsEdgeLabelModel,
  SmartEdgeLabelModel
} from 'yfiles'

/**
 * Configures the default label placement.
 */
export function setDefaultLabelLayoutParameters(graph: IGraph): void {
  // Place node labels in the node center
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  // Use a rotated layout for edge labels
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    autoRotation: true
  }).createParameterFromSource({
    segmentIndex: 0,
    distance: 10.0, // distance between the label's box and the edge path
    segmentRatio: 0.5 // placement near the center of the path
  })
}

/**
 * Changes the placement of some labels.
 */
export function changeLabelLayoutParameters(graph: IGraph) {
  const label1 = graph.nodeLabels.at(1)!
  const label2 = graph.nodeLabels.at(2)!
  const edgeLabel = graph.edgeLabels.at(0)!

  // InteriorStretchLabelModel stretches the label width or height to match the node size
  const interiorStretchModel = new InteriorStretchLabelModel({ insets: 3 })
  graph.setLabelLayoutParameter(
    label1,
    interiorStretchModel.createParameter('north')
  )

  // ExteriorLabelModel places the label on discrete positions outside the node bounds
  const exteriorLabelModel = new ExteriorLabelModel({ insets: 10 })

  graph.setLabelLayoutParameter(
    label2,
    exteriorLabelModel.createParameter('south')
  )

  // NinePositionsEdgeLabelModel provides a set of 9 predefined locations on an edge
  graph.setLabelLayoutParameter(
    edgeLabel,
    NinePositionsEdgeLabelModel.CENTER_ABOVE
  )
}

/**
 * Resets each label layout to the graph default.
 */
export function resetLabelLayoutParameters(graph: IGraph) {
  graph.nodeLabels.forEach((label) =>
    graph.setLabelLayoutParameter(
      label,
      graph.nodeDefaults.labels.layoutParameter
    )
  )
  graph.edgeLabels.forEach((label) =>
    graph.setLabelLayoutParameter(
      label,
      graph.edgeDefaults.labels.layoutParameter
    )
  )
}
