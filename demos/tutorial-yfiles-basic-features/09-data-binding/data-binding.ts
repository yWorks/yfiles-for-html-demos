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
import { type GraphComponent, type GraphEditorInputMode, GraphItemTypes, INode, Rect } from '@yfiles/yfiles'

/**
 * Sets up simple data binding by storing the creation date in the node tag.
 */
export function enableDataBinding(
  graphComponent: GraphComponent,
  graphEditorInputMode: GraphEditorInputMode
): void {
  const graph = graphComponent.graph

  // typically you specify the tag of an item at creation time:
  // Store the current time as node creation time
  graph.createNode({ layout: new Rect(0, 80, 30, 30), tag: new Date() })

  // In this example we subscribe to the low-level node creation event to record the node creation time.
  graph.addEventListener('node-created', (evt): void => {
    // Store the current time as node creation time
    const node = evt.item
    // if there is no tag associated with the node, already, add one
    if (node.tag === null) {
      node.tag = new Date()
    }
  })

  graphEditorInputMode.addEventListener('node-created', (evt): void => {
    // Store the current time as node creation time
    const node = evt.item
    node.tag = new Date()
  })
}

/**
 * Setup tooltips that return the value that is stored in the tag of the nodes.
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for the 'query-item-tool-tip'
 * event of the {@link GraphEditorInputMode} using the {@link QueryItemToolTipEventArgs} parameter.
 * The {@link QueryItemToolTipEventArgs} parameter provides three relevant properties:
 * handled, queryLocation, and toolTip. The {@link QueryItemToolTipEventArgs.handled} property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * {@link QueryItemToolTipEventArgs.queryLocation} property contains the mouse position for the query in world coordinates.
 * The {@link QueryItemToolTipEventArgs.toolTip} is set by setting the ToolTip property.
 */
export function setupTooltips(
  graphEditorInputMode: GraphEditorInputMode
): void {
  graphEditorInputMode.toolTipItems = GraphItemTypes.NODE
  graphEditorInputMode.addEventListener('query-item-tool-tip', (evt): void => {
    if (evt.handled) {
      // Tooltip content has already been assigned -> nothing to do
      return
    }
    const item = evt.item
    if (item instanceof INode) {
      const node = item
      // Set the tooltip content
      evt.toolTip =
        'Created: ' +
        (node.tag instanceof Date
          ? new Intl.RelativeTimeFormat().format(
              node.tag.getTime() - new Date().getTime(),
              'seconds'
            )
          : 'Who knows?')

      // Indicate that the tooltip content has been set
      evt.handled = true
    }
  })
}

/**
 * Adds a context menu for nodes.
 */
export function setupContextMenu(
  graphComponent: GraphComponent,
  graphEditorInputMode: GraphEditorInputMode
): void {
  graphEditorInputMode.contextMenuItems = GraphItemTypes.NODE

  // Add item-specific menu entries
  graphEditorInputMode.addEventListener(
    'populate-item-context-menu',
    (evt): void => {
      if (evt.item instanceof INode) {
        evt.contextMenu = [
          {
            label: 'Set to now',
            action: (): void => {
              const node = evt.item as INode
              node.tag = new Date()
            }
          }
        ]
      }
    }
  )
}
