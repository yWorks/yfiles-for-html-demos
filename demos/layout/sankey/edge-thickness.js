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
import { getVoterShift } from './data-types'
import { TagChangeUndoUnit } from './interaction/TagChangeUndoUnit'
import { updateEdgeStyle } from './styles-support'

/**
 * Returns the thickness from the given string or numerical value.
 * Since the thickness will be used for the edge stroke and for the layout,
 * for cosmetic reasons, we assume a minimum thickness of 2.
 */
export function getThickness(voters) {
  return Math.max(2, typeof voters === 'string' ? parseFloat(voters) : voters)
}

/**
 * Updates the edge data when the thickness changes, so that the new value is stored in the
 * edge's tag. It also updates the edge stroke and creates an undo unit so
 * that the change can be reverted.
 */
export function updateEdgeThickness(edge, thickness, graphComponent) {
  // update the edge data
  const oldData = { ...getVoterShift(edge) }
  const newData = getVoterShift(edge)
  newData.thickness = thickness

  // create the undo unit to revert the change if needed
  const tagUndoUnit = new TagChangeUndoUnit(
    'Thickness changed',
    'Thickness changed',
    oldData,
    newData,
    edge,
    () => updateEdgeStyle(edge)
  )

  // add the undo unit to the graph's undoEngine
  graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
}

/**
 * Normalizes the thickness of the edges based on the current label texts. The largest
 * thickness is 200, while the smallest 2. If no label text exists, edge thickness 2 will be assigned.
 */
export function normalizeThickness(graphComponent) {
  // find the minimum and maximum number of voters from the graph's edge labels
  const graph = graphComponent.graph
  const minMax = graph.edgeLabels.reduce(
    (acc, label) => {
      const thickness = getThickness(label.text)
      return [Math.min(thickness, acc[0]), Math.max(thickness, acc[1])]
    },
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  )

  const min = minMax[0]
  const max = minMax[1]
  const largestThickness = 200
  const smallestThickness = 2

  // normalize the thickness of the graph's edges
  graph.edges.forEach((edge) => {
    let thickness = 2
    if (edge.labels.size !== 0 && !Number.isNaN(max - min)) {
      const normalizedThickness = getThickness(edge.labels.at(0).text)
      const thicknessScale = (largestThickness - smallestThickness) / (max - min)
      thickness = Math.floor(smallestThickness + (normalizedThickness - min) * thicknessScale)
    }
    // update the edge data and the stroke of the edge with the new normalized value
    updateEdgeThickness(edge, thickness, graphComponent)
  })
}
