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
  FreeNodePortLocationModel,
  type GraphInputMode,
  GraphItemTypes,
  type IGraph,
  type INode,
  IPort,
  type IPortLocationModelParameter,
  Size
} from '@yfiles/yfiles'
import { CollapseExpandPortStyle } from '../orgchart/graph-style/CollapseExpandPortStyle'

type PortStyleTag = {
  collapsed?: boolean
  collapsible?: boolean
  action?: (collapse: boolean) => void
}

/**
 * This class is responsible for the implementation of the toggled ports.
 */
export class TogglePortButtonSupport {
  /**
   * Adds the ports on the given node.
   * @param graph The given graph
   * @param node The given node
   * @param locationParameter The location of the port
   * @param action The action to bind with this port
   */
  addPort(
    graph: IGraph,
    node: INode,
    locationParameter: IPortLocationModelParameter = FreeNodePortLocationModel.BOTTOM,
    action: (collapse: boolean) => void
  ): void {
    const style = new CollapseExpandPortStyle(
      new Size(20, 20),
      (port: IPort): boolean => (port.tag as PortStyleTag).collapsed ?? false
    )
    graph.addPort({
      owner: node,
      style,
      locationParameter: locationParameter,
      tag: { collapsed: false, collapsible: true, action }
    })
  }

  /**
   * Initializes the input mode and the click listener for the port items.
   * @param graphInputMode The given input mode
   */
  initializeInputMode(graphInputMode: GraphInputMode): void {
    graphInputMode.clickableItems = graphInputMode.clickableItems | GraphItemTypes.PORT
    graphInputMode.clickHitTestOrder = [
      GraphItemTypes.PORT,
      GraphItemTypes.NODE,
      GraphItemTypes.ALL
    ]

    graphInputMode.addEventListener('item-clicked', (evt) => {
      if (!(evt.item instanceof IPort) || !(evt.item.style instanceof CollapseExpandPortStyle)) {
        return
      }
      const port = evt.item
      const styleTag = port.tag as PortStyleTag
      const collapsed = styleTag.collapsed ?? false
      port.tag = { ...styleTag, collapsed: !collapsed }
      evt.handled = true
      graphInputMode.graph!.invalidateDisplays()
      styleTag.action?.(!collapsed)
    })
  }
}
