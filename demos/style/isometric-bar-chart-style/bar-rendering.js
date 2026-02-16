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
import { GraphModelManager, IObjectRenderer, Rect, Size } from '@yfiles/yfiles'
import { AugmentationNodeRenderer } from './AugmentationNodeRenderer'
import { IsometricWebGLNodeStyle } from './IsometricWebGLNodeStyle'
import { IsometricBarLabelNodeStyle } from './IsometricBarLabelNodeStyle'

let barManager
let barLabelManager

/**
 * Enable the isometric bar augmentations and their labels.
 */
export function initializeAugmentations(graphComponent, getTagData) {
  // bars should have a floor space of 10x10 at the node center
  const layoutProvider = (node) => Rect.fromCenter(node.layout.center, new Size(10, 10))

  // bars should be visualized on top of the normal content group
  const renderTree = graphComponent.renderTree
  const barGroup = renderTree.createGroup(renderTree.rootGroup)
  barGroup.above(renderTree.contentGroup)

  // use the layoutProvider and getTagData method to provide render information to the IsometricWebGLNodeStyle
  // which uses WebGL rendering
  const barRenderer = new AugmentationNodeRenderer(
    new IsometricWebGLNodeStyle(),
    layoutProvider,
    getTagData
  )
  // the additional GraphModelManager adds the visualization provided by the AugmentationNodeDescriptor
  // to the GraphComponent
  barManager = createAugmentationGraphModelManager(barRenderer)
  barManager.install(graphComponent, graphComponent.graph, barGroup)

  // place the additional labels on top of the bars
  const barLabelGroup = renderTree.createGroup(renderTree.rootGroup)
  barLabelGroup.above(barGroup)
  // the IsometricBarLabelNodeStyle also uses the layoutProvider and getTagData method to place
  // the label close to the top of the bars
  const barLabelRenderer = new AugmentationNodeRenderer(
    new IsometricBarLabelNodeStyle(),
    layoutProvider,
    getTagData
  )
  // add another GraphModelManager for the bar labels that use SVG rendering
  // Note that we could have used just one additional GraphModelManager if both would use the
  // same rendering technique
  barLabelManager = createAugmentationGraphModelManager(barLabelRenderer)
  barLabelManager.install(graphComponent, graphComponent.graph, barLabelGroup)
}

function createAugmentationGraphModelManager(nodeRenderer) {
  const graphModelManager = new GraphModelManager()
  graphModelManager.nodeRenderer = nodeRenderer
  graphModelManager.edgeRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
  graphModelManager.portRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
  graphModelManager.nodeLabelRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
  graphModelManager.edgeLabelRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
  graphModelManager.portLabelRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
  return graphModelManager
}

/**
 * Handles a selection change in the bar data combo box.
 */
export function showBars(graphComponent) {
  const barManagersInactive = barManager.graph == null
  if (barManagersInactive) {
    // enable the augmentations by installing the additional GraphModelManagers
    barManager.install(graphComponent, graphComponent.graph)
    barLabelManager.install(graphComponent, graphComponent.graph)
  }

  graphComponent.invalidate()
}

/**
 * Handles a selection change in the bar data combo box.
 */
export function hideBars(graphComponent) {
  const barManagersActive = barManager.graph != null
  if (barManagersActive) {
    // disable the augmentations by uninstalling the additional GraphModelManagers
    barManager.uninstall(graphComponent)
    barLabelManager.uninstall(graphComponent)
  }

  graphComponent.invalidate()
}

/**
 * Shows or hides the labels
 */
export function toggleLabelVisibility(enabled, graphComponent) {
  if (enabled && barLabelManager.graph == null) {
    barLabelManager.install(graphComponent, graphComponent.graph)
  } else if (!enabled && barLabelManager.graph != null) {
    barLabelManager.uninstall(graphComponent)
  }
  graphComponent.invalidate()
}
