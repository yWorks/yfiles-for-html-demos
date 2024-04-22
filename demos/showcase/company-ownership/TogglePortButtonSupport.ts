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
  FreeNodePortLocationModel,
  type GraphInputMode,
  GraphItemTypes,
  type IGraph,
  type INode,
  IPort,
  type IPortLocationModelParameter,
  Size,
  StringTemplatePortStyle
} from 'yfiles'

// Elements stored in the 'global' defs section are copied to the main SVG's defs section
// and can be referenced in the templates. In this case, this happens via converters.
const portStyleTemplate =
  '<g id="PortStyleTemplate">\n' +
  '  <g class="port">\n' +
  '    <ellipse rx="8" ry="8"/>\n' +
  '    <line x1="-6" y1="0" x2="6" y2="0" class="port-icon"></line>\n' +
  '    <line x1="0" y1="-1" x2="0" y2="1"\n' +
  '      class="{TemplateBinding styleTag, Converter=companyOwnershipConverters.portIconStateConverter}"></line>\n' +
  '  </g>\n' +
  '</g>\n'

type PortStyleTag = {
  collapsed?: boolean
  collapsible?: boolean
  action?: (collapse: boolean) => void
}

type CompanyOwnershipConverters = {
  companyOwnershipConverters: { portIconStateConverter: (val: PortStyleTag) => string }
}

/**
 * This class is responsible for the implementation of the toggled ports.
 */
export default class TogglePortButtonSupport {
  constructor() {
    // initialize converter
    ;(StringTemplatePortStyle.CONVERTERS as CompanyOwnershipConverters).companyOwnershipConverters =
      {
        portIconStateConverter: (val: PortStyleTag): string =>
          'port-icon ' + (val.collapsed ?? false ? 'port-icon-expand' : 'port-icon-collapse')
      }
  }

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
    locationParameter: IPortLocationModelParameter = FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
    action: (collapse: boolean) => void
  ): void {
    const style = new StringTemplatePortStyle(portStyleTemplate)
    style.renderSize = new Size(20, 20)
    style.styleTag = { collapsed: false, collapsible: true, action }
    graph.addPort({ owner: node, style, locationParameter: locationParameter })
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

    graphInputMode.addItemClickedListener((_, evt) => {
      if (!(evt.item instanceof IPort)) {
        return
      }
      const port = evt.item
      if (port instanceof IPort && port.style instanceof StringTemplatePortStyle) {
        const styleTag = port.style.styleTag as PortStyleTag
        const collapsed = styleTag.collapsed ?? false
        port.style.styleTag = { ...styleTag, collapsed: !collapsed }
        evt.handled = true
        graphInputMode.graph!.invalidateDisplays()
        styleTag.action?.(!collapsed)
      }
    })
  }
}
