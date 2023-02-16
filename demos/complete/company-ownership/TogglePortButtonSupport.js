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
import {
  FreeNodePortLocationModel,
  GraphInputMode,
  GraphItemTypes,
  IGraph,
  INode,
  IPort,
  IPortLocationModelParameter,
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
  '      class="{TemplateBinding styleTag, Converter=orgChartConverters.portIconStateConverter}"></line>\n' +
  '  </g>\n' +
  '</g>\n'

/**
 * This class is responsible for the implementation of the toggled ports.
 */
export default class TogglePortButtonSupport {
  constructor() {
    // initialize converter
    StringTemplatePortStyle.CONVERTERS.orgChartConverters = {
      portIconStateConverter: val =>
        'port-icon ' + (val && val.collapsed ? 'port-icon-expand' : 'port-icon-collapse')
    }
  }

  /**
   * Adds the ports on the given node.
   * @param {!IGraph} graph The given graph
   * @param {!INode} node The given node
   * @param {!IPortLocationModelParameter} locationParameter The location of the port
   * @param {!function} action The action to bind with this port
   */
  addPort(graph, node, locationParameter = FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED, action) {
    const style = new StringTemplatePortStyle(portStyleTemplate)
    style.renderSize = new Size(20, 20)
    style.styleTag = { collapsed: false, collapsible: true, action }
    graph.addPort({ owner: node, style, locationParameter: locationParameter })
  }

  /**
   * Initializes the input mode and the click listener for the port items.
   * @param {!GraphInputMode} graphInputMode The given input mode
   */
  initializeInputMode(graphInputMode) {
    graphInputMode.clickableItems = graphInputMode.clickableItems | GraphItemTypes.PORT
    graphInputMode.clickHitTestOrder = [
      GraphItemTypes.PORT,
      GraphItemTypes.NODE,
      GraphItemTypes.ALL
    ]

    graphInputMode.addItemClickedListener((sender, args) => {
      const port = args.item
      if (
        port instanceof IPort &&
        port.style instanceof StringTemplatePortStyle &&
        port.style.styleTag.collapsible
      ) {
        port.style.styleTag = { ...port.style.styleTag, collapsed: !port.style.styleTag.collapsed }
        args.handled = true
        graphInputMode.graph.invalidateDisplays()
        port.style.styleTag.action(port.style.styleTag.collapsed)
      }
    })
  }
}
