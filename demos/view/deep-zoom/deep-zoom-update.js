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
const CONTENT_RECT_MARGINS = 50

/**
 * Registers a viewport listener, that checks if the viewport is zoomed in sufficiently close on a
 * group node so that it's (virtual) children need to be added to the graph that is actually
 * displayed and vice versa.
 *
 * To avoid changing zoom and viewpoint in a listener to these changes the actual work
 * is deferred.
 * @param {!GraphComponent} graphComponent
 */
export function initializeDeepZoom(graphComponent) {
  graphComponent.addViewportChangedListener(updateDeepZoomOnViewportChanged)
}

/**
 * Exits all groups and sets the zoom to 1.
 * @param {!GraphComponent} graphComponent
 */
export function zoomToOriginal(graphComponent) {
  graphComponent.graph.foldingView.localRoot = null
  graphComponent.zoom = 1
}

/**
 * Exits all groups and calls {@link GraphComponent.fitContent}.
 * @param {!GraphComponent} graphComponent
 */
export function fitContent(graphComponent) {
  graphComponent.graph.foldingView.localRoot = null
  graphComponent.fitContent()
}

// mutex that ensures viewport modifications occur one at time
/** @type {boolean} */
let changing = false
/**
 * @param {!GraphComponent} graphComponent
 */
function updateDeepZoomOnViewportChanged(graphComponent) {
  if (changing) {
    return
  }

  // defer update
  setTimeout(() => {
    changing = true
    try {
      updateGraphComponentOnViewportChange(graphComponent)
    } finally {
      changing = false
    }
  })
}

/**
 * @param {!GraphComponent} graphComponent
 */
function updateGraphComponentOnViewportChange(graphComponent) {
  const viewport = graphComponent.viewport
  const foldingView = graphComponent.graph.foldingView
  const masterGraph = foldingView.manager.masterGraph

  // finds a group node that is not yet entered but is larger than the current viewport
  const groupNode = findGroupNodeToEnter(graphComponent, foldingView, masterGraph, viewport)

  // If such a node exists, nothing but the contents of this group node are visible.
  // Thus, its contents are now the "real" graph, and everything that is hierarchically
  // above this group node needs to be hidden.
  if (groupNode) {
    enterGroup(graphComponent, foldingView, groupNode)
  } else {
    // If no such node exists check whether the whole graph is contained in the
    // viewport and whether a local root has been set. In this case, the graph
    // is being zoomed out, and the parent needs to be made visible again.
    const graphBounds = graphComponent.contentRect
    if (foldingView.localRoot !== null && encloses(viewport, graphBounds)) {
      exitGroup(graphComponent, masterGraph, foldingView, graphBounds, foldingView.localRoot)
    }
  }

  limitMinimumZoom(graphComponent, foldingView)
  limitMaximumZoom(graphComponent, masterGraph, foldingView)
}

/**
 * Finds a group node that is not yet entered but is larger than the current viewport.
 * @param {!GraphComponent} graphComponent
 * @param {!IFoldingView} foldingView
 * @param {!IGraph} masterGraph
 * @param {!Rect} viewport
 * @returns {?INode}
 */
function findGroupNodeToEnter(graphComponent, foldingView, masterGraph, viewport) {
  return graphComponent.graph.nodes.find(node => {
    const nodeLayout = node.layout.toRect()
    const masterNode = foldingView.getMasterItem(node)
    return (
      masterGraph.isGroupNode(masterNode) &&
      masterGraph.getChildren(masterNode).size > 0 &&
      !foldingView.isExpanded(node) &&
      encloses(nodeLayout, viewport)
    )
  })
}

/**
 * @param {!Rect} outer
 * @param {!Rect} inner
 * @returns {boolean}
 */
function encloses(outer, inner) {
  return outer.contains(inner.topLeft) && outer.contains(inner.bottomRight)
}

/**
 * Enters a group and seamlessly updates the {@link GraphComponent.zoom} and
 * {@link GraphComponent.viewPoint} for the group contents.
 *
 * For this, all graph items on the same hierarchy level as the groupNode are removed from the
 * view graph and the group contents are added. Afterwards, the zoom and viewPoint are updated
 * such that the new graph appears at the same location as the preview rendered by the
 * {@link DeepZoomGroupNodeStyle}.
 * @param {!GraphComponent} graphComponent
 * @param {!IFoldingView} foldingView
 * @param {!INode} groupNode
 */
function enterGroup(graphComponent, foldingView, groupNode) {
  const groupLayout = groupNode.layout
  const groupNodeCenterInView = graphComponent.toViewCoordinates(groupLayout.center)

  // Setting the local root to this group node effectively removes nodes higher up
  // in the hierarchy from the view graph.
  setLocalRoot(graphComponent, foldingView, foldingView.getMasterItem(groupNode))

  const graphBounds = graphComponent.contentRect
  // match the zoom factor of how large the group node contents appeared to
  // the actual size of the contents
  const oldScale = Math.min(
    groupLayout.width / graphBounds.width,
    groupLayout.height / graphBounds.height
  )
  const oldZoom = graphComponent.zoom
  graphComponent.zoom = oldZoom * oldScale

  // Modify the viewPoint as well so that the center of the group node into which we have zoomed in
  // coincides with the center of the graph we are now presenting as the group nodes contents.
  const graphCenterInView = graphComponent.toViewCoordinates(graphBounds.center)
  const delta = graphCenterInView.subtract(groupNodeCenterInView).multiply(1 / graphComponent.zoom)
  graphComponent.viewPoint = graphComponent.viewPoint.add(delta)
}

/**
 * Exits a group and seamlessly updates the {@link GraphComponent.zoom} and
 * {@link GraphComponent.viewPoint} for the outer graph.
 *
 * For this, all children of the groupNode are removed from the view graph and items
 * at the groupNode's hierarchy level are added. Afterwards, the zoom and viewPoint
 * are updated such that the preview rendered by {@link DeepZoomGroupNodeStyle} inside
 * the groupNode appears at the same location as the old graph.
 * @param {!GraphComponent} graphComponent
 * @param {!IGraph} masterGraph
 * @param {!IFoldingView} foldingView
 * @param {!Rect} graphBounds
 * @param {!INode} oldRoot
 */
function exitGroup(graphComponent, masterGraph, foldingView, graphBounds, oldRoot) {
  const graphCenterInView = graphComponent.toViewCoordinates(graphBounds.center)

  const oldZoom = graphComponent.zoom

  // switch the localRoot so that the viewGraph displays the parent group node.
  setLocalRoot(graphComponent, foldingView, masterGraph.getParent(oldRoot))

  // modify the zoom so that the parent group node appears to be of the same size as its contents.
  const groupNode = foldingView.getViewItem(oldRoot)
  const groupLayout = groupNode.layout
  const newScale = Math.min(
    groupLayout.width / graphBounds.width,
    groupLayout.height / graphBounds.height
  )
  graphComponent.zoom = oldZoom / newScale

  // likewise, adjust the viewPoint so that the center of the groups' contents
  // coincide with the center of the group node
  const groupNodeCenterInView = graphComponent.toViewCoordinates(groupLayout.center)
  const delta = groupNodeCenterInView.subtract(graphCenterInView).multiply(1 / graphComponent.zoom)
  graphComponent.viewPoint = graphComponent.viewPoint.add(delta)
}

/**
 * Sets the new local root and updates the {@link GraphComponent.contentRect}.
 * @param {!GraphComponent} graphComponent
 * @param {!IFoldingView} foldingView
 * @param {?INode} newRoot
 */
function setLocalRoot(graphComponent, foldingView, newRoot) {
  foldingView.localRoot = newRoot
  // after programmatically changing the graph, the content rect has to be updated manually
  graphComponent.updateContentRect({ margins: CONTENT_RECT_MARGINS })
}

/**
 * @param {!GraphComponent} graphComponent
 * @param {!IFoldingView} foldingView
 */
function limitMinimumZoom(graphComponent, foldingView) {
  // limit zoom if at minimum or maximum depth of hierarchy
  if (foldingView.localRoot) {
    // unrestricted zooming out
    graphComponent.minimumZoom = 0.0000001
  } else {
    // no local root, so we're maximally zoomed out
    graphComponent.minimumZoom = 1
  }
}

/**
 * @param {!GraphComponent} graphComponent
 * @param {!IGraph} masterGraph
 * @param {!IFoldingView} foldingView
 */
function limitMaximumZoom(graphComponent, masterGraph, foldingView) {
  // if the current root node has no group grandchildren, limit zooming further in
  if (hasGrandChildren(masterGraph, foldingView.localRoot)) {
    // there are further group nodes one may zoom 'into', un-restrict zooming in.
    graphComponent.maximumZoom = 10000000
  } else {
    // no further children, limit zooming in
    graphComponent.maximumZoom = 4
  }
}

/**
 * @param {!IGraph} masterGraph
 * @param {?INode} groupNode
 * @returns {boolean}
 */
function hasGrandChildren(masterGraph, groupNode) {
  return (
    masterGraph
      .getChildren(groupNode)
      .filter(child => masterGraph.isGroupNode(child))
      .flatMap(child => masterGraph.getChildren(child)).size > 0
  )
}
