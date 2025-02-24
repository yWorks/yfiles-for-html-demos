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
  type GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  INode,
  IPort,
  type KeyboardInputMode,
  ModifierKeys
} from '@yfiles/yfiles'
import type { CollapsibleTree } from './CollapsibleTree'
import { showNodeProperties } from './ui/orgchart-properties-view'
import { setOrgChartPortStyle } from './graph-style/orgchart-port-style'
import { configureContextMenu } from './ui/orgchart-context-menu'

/**
 * Set up the graph viewer input mode to and enables interactivity to expand and collapse subtrees.
 */
export function initializeInputMode(
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree
): void {
  const graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.PORT,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE,
    toolTipItems: GraphItemTypes.NONE,
    contextMenuItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.PORT, GraphItemTypes.NODE]
  })
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

  graphViewerInputMode.addEventListener('item-double-clicked', () => {
    orgChartGraph.zoomToItem(graphComponent.currentItem as INode)
  })

  graphViewerInputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt): void => {
    // we use the highlight manager to highlight hovered items
    if (evt.oldItem) {
      graphComponent.highlights.remove(evt.oldItem)
    }
    if (evt.item) {
      graphComponent.highlights.add(evt.item)
    }
  })
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

  // display information about the current employee
  graphComponent.addEventListener('current-item-changed', () => {
    if (graphComponent.currentItem instanceof INode) {
      showNodeProperties(graphComponent.currentItem, orgChartGraph)
    }
  })

  initializeHighlights(graphComponent)

  graphComponent.inputMode = graphViewerInputMode
}

/**
 * Enables collapsing and expanding nodes by clicking on node ports and with keyboard commands.
 */
export function initializeInteractivity(
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree
): void {
  const graphViewerInputMode = graphComponent.inputMode as GraphViewerInputMode
  initializeClickablePorts(graphViewerInputMode, orgChartGraph)
  initializeKeyboardInputMode(graphViewerInputMode.keyboardInputMode, graphComponent, orgChartGraph)
  // set the port style after the graph is built, since we need to know the graph structure
  setOrgChartPortStyle(orgChartGraph)
  // add a context menu
  configureContextMenu(graphComponent, orgChartGraph)
}

/**
 * Initializes the highlights for selected or focused elements.
 */
function initializeHighlights(graphComponent: GraphComponent): void {
  graphComponent.selectionIndicatorManager.enabled = false

  // Hide the default focus highlight in favor of the CSS highlighting from the template styles
  graphComponent.focusIndicatorManager.showFocusPolicy = 'always'
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
}

/**
 * Modifies the given input mode to support the collapse/expand functionality on port clicks.
 */
function initializeClickablePorts(
  graphViewerInputMode: GraphViewerInputMode,
  orgChartGraph: CollapsibleTree
): void {
  // add ports to the clickable items
  graphViewerInputMode.clickableItems = GraphItemTypes.NODE | GraphItemTypes.PORT
  graphViewerInputMode.clickHitTestOrder = [GraphItemTypes.PORT, GraphItemTypes.NODE]

  // listen to clicks on items
  graphViewerInputMode.addEventListener('item-clicked', (evt) => {
    const port = evt.item
    if (port instanceof IPort && orgChartGraph.completeGraph.inEdgesAt(port).size === 0) {
      // if the item is a port, and it has not incoming edges expand or collapse the subtree
      const node = port.owner as INode
      if (orgChartGraph.canExecuteHideChildren(node)) {
        void orgChartGraph.executeHideChildren(node)
      } else {
        if (orgChartGraph.canExecuteShowChildren(node)) {
          void orgChartGraph.executeShowChildren(node)
        }
      }
      evt.handled = true
    }
  })
}

/**
 * Adds key bindings for collapse/expand subtrees
 */
function initializeKeyboardInputMode(
  keyboardInputMode: KeyboardInputMode,
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree
): void {
  keyboardInputMode.addKeyBinding('*', ModifierKeys.NONE, () => {
    void orgChartGraph.executeShowAll()
  })

  keyboardInputMode.addKeyBinding('-', ModifierKeys.NONE, () => {
    void orgChartGraph.executeHideChildren(graphComponent.currentItem as INode)
  })

  keyboardInputMode.addKeyBinding('+', ModifierKeys.NONE, () => {
    void orgChartGraph.executeShowChildren(graphComponent.currentItem as INode)
  })

  keyboardInputMode.addKeyBinding('PageDown', ModifierKeys.NONE, () => {
    void orgChartGraph.executeHideParent(graphComponent.currentItem as INode)
  })

  keyboardInputMode.addKeyBinding('PageUp', ModifierKeys.NONE, () => {
    void orgChartGraph.executeShowParent(graphComponent.currentItem as INode)
  })
}
