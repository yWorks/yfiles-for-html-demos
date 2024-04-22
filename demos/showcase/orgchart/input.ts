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
  type GraphComponent,
  GraphFocusIndicatorManager,
  GraphItemTypes,
  GraphViewerInputMode,
  type HoveredItemChangedEventArgs,
  ICommand,
  INode,
  IPort,
  Key,
  type KeyboardInputMode,
  ModifierKeys,
  ShowFocusPolicy,
  VoidNodeStyle
} from 'yfiles'
import type { CollapsibleTree } from './CollapsibleTree'
import { showNodeProperties } from './ui/orgchart-properties-view'
import { setOrgChartPortStyle } from './graph-style/orgchart-port-style'
import { configureContextMenu } from './ui/orgchart-context-menu'

export const showAllCommand = ICommand.createCommand()

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

  graphViewerInputMode.addItemDoubleClickedListener(() => {
    orgChartGraph.zoomToItem(graphComponent.currentItem as INode)
  })

  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener((_, evt): void => {
    // we use the highlight manager to highlight hovered items
    const manager = graphComponent.highlightIndicatorManager
    if (evt.oldItem) {
      manager.removeHighlight(evt.oldItem)
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,@typescript-eslint/strict-boolean-expressions
    if (evt.item) {
      manager.addHighlight(evt.item)
    }
  })
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE

  // display information about the current employee
  graphComponent.addCurrentItemChangedListener(() => {
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
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    showFocusPolicy: ShowFocusPolicy.ALWAYS,
    nodeStyle: VoidNodeStyle.INSTANCE
  })
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
  graphViewerInputMode.addItemClickedListener((_, evt) => {
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
  keyboardInputMode.addCommandBinding(
    showAllCommand,
    () => {
      void orgChartGraph.executeShowAll()
      return true
    },
    () => orgChartGraph.canExecuteShowAll()
  )
  keyboardInputMode.addKeyBinding(Key.MULTIPLY, ModifierKeys.NONE, showAllCommand)

  keyboardInputMode.addKeyBinding({
    key: Key.SUBTRACT,
    execute: () => {
      void orgChartGraph.executeHideChildren(graphComponent.currentItem as INode)
      return true
    },
    canExecute: () => orgChartGraph.canExecuteHideChildren(graphComponent.currentItem as INode)
  })
  keyboardInputMode.addKeyBinding({
    key: Key.ADD,
    execute: () => {
      void orgChartGraph.executeShowChildren(graphComponent.currentItem as INode)
      return true
    },
    canExecute: () => orgChartGraph.canExecuteShowChildren(graphComponent.currentItem as INode)
  })
  keyboardInputMode.addKeyBinding({
    key: Key.PAGE_DOWN,
    execute: () => {
      void orgChartGraph.executeHideParent(graphComponent.currentItem as INode)
      return true
    },
    canExecute: () => orgChartGraph.canExecuteHideParent(graphComponent.currentItem as INode)
  })
  keyboardInputMode.addKeyBinding({
    key: Key.PAGE_UP,
    execute: () => {
      void orgChartGraph.executeShowParent(graphComponent.currentItem as INode)
      return true
    },
    canExecute: () => orgChartGraph.canExecuteShowParent(graphComponent.currentItem as INode)
  })
}
