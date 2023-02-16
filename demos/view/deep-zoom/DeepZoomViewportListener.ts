/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import type { GraphComponent, PropertyChangedEventArgs } from 'yfiles'

const CONTENT_RECT_MARGINS = 50

// mutex that ensures viewport modifications occur one at time
let changing = false

/**
 * A custom viewport listener, that checks if the viewport is zoomed in sufficiently close on a
 * group node so that it's (virtual) children need to be added to the graph that is actually
 * displayed and vice versa.
 *
 * To avoid changing zoom and viewpoint in a listener to these changes the actual work
 * is deferred.
 *
 * @param sender The given GraphComponent
 * @param evt The object that contains the event data
 */
export function deepZoomViewportListener(
  sender: GraphComponent,
  evt: PropertyChangedEventArgs
): void {
  const graphComponent = sender

  if (changing) {
    return
  }

  setTimeout(() => zoomChanged(graphComponent))
}

function zoomChanged(graphComponent: GraphComponent) {
  changing = true
  const viewport = graphComponent.viewport
  const foldingView = graphComponent.graph.foldingView!
  const masterGraph = foldingView.manager.masterGraph

  // get the group node that is larger than the current viewport and not yet expanded
  const groupNode = graphComponent.graph.nodes.find(node => {
    const nodeLayout = node.layout.toRect()
    const masterNode = foldingView.getMasterItem(node)
    return (
      masterGraph.isGroupNode(masterNode) &&
      !foldingView.isExpanded(node) &&
      masterGraph.getChildren(masterNode).size > 0 &&
      nodeLayout.contains(viewport.topLeft) &&
      nodeLayout.contains(viewport.bottomLeft)
    )
  })

  // If such a node exists, nothing but the contents of this group node are visible. Thus, its contents are now the "real" graph,
  // and everything that is hierarchically above this group node needs to be hidden. This is the point where the style shows
  // the contents as an actual graph. Since this graph has an actual size that is greater than the preview image the group node will be shown until
  // a new viewport is computed that seamlessly presents the contents.
  if (groupNode) {
    // the center of the group node in view coordinates
    const groupLayout = groupNode.layout
    const groupNodeCenterInView = graphComponent.toViewCoordinates(groupLayout.center)
    const oldZoom = graphComponent.zoom

    // setting the local root to this group node effectively removes nodes higher up in the hierarchy from the view graph.
    foldingView.localRoot = foldingView.getMasterItem(groupNode)
    // after programmatically changing the graph, the content rect has to be updated manually
    graphComponent.updateContentRect({ margins: CONTENT_RECT_MARGINS })

    const graphBounds = graphComponent.contentRect
    // match the zoom factor of how large the group node contents appeared to the actual size of the contents
    const oldScale = Math.min(
      groupLayout.width / graphBounds.width,
      groupLayout.height / graphBounds.height
    )
    graphComponent.zoom = oldZoom * oldScale

    // Modify the viewPoint as well so that the center of the group node into which we have zoomed in
    // coincides with the center of the graph we are now presenting as the group nodes contents.
    const graphCenterInView = graphComponent.toViewCoordinates(graphBounds.center)
    const delta = graphCenterInView
      .subtract(groupNodeCenterInView)
      .multiply(1 / graphComponent.zoom)
    graphComponent.viewPoint = graphComponent.viewPoint.add(delta)
  } else {
    // If no such node exists check whether the whole graph is contained in the viewport and whether a local root has been set.
    // In this case, the graph has been zoomed in on before, is being zoomed out, and the parent needs to be made visible again.
    const graphBounds = graphComponent.contentRect
    if (
      viewport.contains(graphBounds.topLeft) &&
      viewport.contains(graphBounds.bottomRight) &&
      foldingView.localRoot !== null
    ) {
      const graphCenterInView = graphComponent.toViewCoordinates(graphBounds.center)

      const oldZoom = graphComponent.zoom
      const oldRoot = foldingView.localRoot

      // switch the localRoot so that the viewGraph displays the parent group node.
      foldingView.localRoot = masterGraph.getParent(foldingView.localRoot)
      // after programmatically changing the graph, the content rect has to be updated manually
      graphComponent.updateContentRect({ margins: CONTENT_RECT_MARGINS })

      // modify the zoom so that the parent group node appears to be of the same size as its contents.
      const groupNode = foldingView.getViewItem(oldRoot)!
      const groupLayout = groupNode.layout
      const newScale = Math.min(
        groupLayout.width / graphBounds.width,
        groupLayout.height / graphBounds.height
      )
      graphComponent.zoom = oldZoom / newScale

      // likewise, adjust the viewPoint so that the center of the groups' contents coincide with the center of the group node
      const groupNodeCenterInView = graphComponent.toViewCoordinates(groupLayout.center)

      const delta = groupNodeCenterInView
        .subtract(graphCenterInView)
        .multiply(1 / graphComponent.zoom)
      graphComponent.viewPoint = graphComponent.viewPoint.add(delta)
    }
  }

  // limit zoom if at minimum or maximum depth of hierarchy
  if (foldingView.localRoot) {
    // unrestricted zooming out
    graphComponent.minimumZoom = 0.0000001
  } else {
    // no local root, so we're maximally zoomed out
    graphComponent.minimumZoom = 1
  }

  // if the current root node has no grandchildren, limit zooming further in
  if (
    masterGraph
      .getChildren(foldingView.localRoot)
      .filter(n => masterGraph.isGroupNode(n))
      .map(group => masterGraph.getChildren(group))
      .filter(children => {
        for (let i = 0; i < children.size; i++) {
          if (masterGraph.isGroupNode(children.get(i))) {
            return true
          }
        }
        return false
      }).size == 0
  ) {
    // no further children, limit zooming in
    graphComponent.maximumZoom = 4
  } else {
    // there are further group nodes one may zoom 'into', un-restrict zooming in.
    graphComponent.maximumZoom = 10000000
  }

  changing = false
}
