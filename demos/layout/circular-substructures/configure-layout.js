/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CircularLayout,
  CircularLayoutData,
  CircularLayoutStarSubstructureStyle,
  LayoutExecutor
} from '@yfiles/yfiles'
import { getNodeType } from './types-popup'

/**
 * Calculates a new graph layout and optionally applies the new layout in an animated fashion.
 * This method creates and configures a new circular layout algorithm for this purpose.
 */
export async function runLayoutCore(graphComponent, settings, animate) {
  // configure the circular layout algorithm
  const layout = new CircularLayout()

  const starStyle = getStarStyle(settings.starSubstructureStyle)
  if (starStyle !== CircularLayoutStarSubstructureStyle.NONE) {
    // for more compact layout, do not place children on common radius for star style radial and separated-radial
    layout.placeChildrenOnCommonRadius = false
  }
  // configure the star substructure style
  layout.starSubstructureStyle = starStyle

  // configure type separation for star substructures
  layout.starSubstructureTypeSeparation = settings.starSubstructureTypeSeparation

  // layout data is necessary to support data-driven features like node types
  const layoutData = new CircularLayoutData()

  if (settings.considerNodeTypes) {
    // if node types should be considered, define a delegate on the respective layout data property
    // that queries the type from the node's tag
    layoutData.nodeTypes = getNodeType
  }

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  // runs the layout algorithm and applies the result...
  if (animate) {
    //... with a morph animation
    await graphComponent.applyLayoutAnimated({ layout, layoutData })
  } else {
    //... without an animation
    graphComponent.graph.applyLayout(layout, layoutData)
    await graphComponent.fitGraphBounds()
  }
}

/**
 * Determines the desired star substructure style for layout calculations from the settings UI.
 */
function getStarStyle(starStyle) {
  switch (starStyle) {
    case 'RADIAL':
      return CircularLayoutStarSubstructureStyle.RADIAL
    case 'SEPARATED_RADIAL':
      return CircularLayoutStarSubstructureStyle.SEPARATED_RADIAL
    default:
      return CircularLayoutStarSubstructureStyle.NONE
  }
}
