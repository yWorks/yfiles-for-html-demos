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
import { FreeNodePortLocationModel, Size, StringTemplatePortStyle } from 'yfiles'

// Elements stored in the 'global' defs section are copied to the main SVG's defs section
// and can be referenced in the templates. In this case, this happens via converters.
const portStyleTemplate = `<g id="PortStyleTemplate">
  <g class="port">
    <ellipse rx="8" ry="8"/>
    <line x1="-6" y1="0" x2="6" y2="0" class="port-icon"/>
    <line x1="0" y1="-1" x2="0" y2="1"
      class="{TemplateBinding styleTag, Converter=orgChartConverters.portIconStateConverter}"/>
  </g>
</g>
`

/**
 * Sets the expand/collapse style for each edge's source port.
 *
 * For multiple outgoing edges with different ports, only one of the ports is styled.
 * @param {!CollapsibleTree} orgChartGraph
 */
export function setOrgChartPortStyle(orgChartGraph) {
  initializeStringTemplatePortStyle()
  setPortStylesToFirstOutgoingPorts(orgChartGraph)
  orgChartGraph.addCollapsedStateUpdatedListener(setCollapsedState)
}

/**
 * Determines the first port with an out-edge and adds the port style indicating the option to
 * collapse expand the subtree.
 * @param {!CollapsibleTree} orgChartGraph
 */
function setPortStylesToFirstOutgoingPorts(orgChartGraph) {
  const filteredGraph = orgChartGraph.filteredGraph
  for (const node of filteredGraph.nodes) {
    const outEdges = filteredGraph.outEdgesAt(node)
    if (outEdges.size > 0) {
      const firstOutgoingPort = outEdges.first().sourcePort
      const portStyle = createStringTemplatePortStyle()
      filteredGraph.setStyle(firstOutgoingPort, portStyle)
      filteredGraph.setPortLocationParameter(
        firstOutgoingPort,
        FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
      )
    }
  }
}

/**
 * @typedef {Object} OrgChartConverters
 * @property {object} orgChartConverters
 */

/**
 * Initializes the converters for the string template node style.
 */
function initializeStringTemplatePortStyle() {
  StringTemplatePortStyle.CONVERTERS.orgChartConverters = {
    portIconStateConverter: val =>
      'port-icon ' + (val.collapsed ?? false ? 'port-icon-expand' : 'port-icon-collapse')
  }
}

/**
 * Creates a template port style showing a '+' for expand and a '-' for collapse.
 * @returns {!StringTemplatePortStyle}
 */
function createStringTemplatePortStyle() {
  const portStyle = new StringTemplatePortStyle({
    svgContent: portStyleTemplate,
    renderSize: new Size(20, 20)
  })
  portStyle.styleTag = { collapsed: false }
  return portStyle
}

/**
 * Sets the collapsed state on the {@link StringTemplatePortStyle.styleTag}.
 * @param {!IPort} port
 * @param {boolean} collapsed
 */
function setCollapsedState(port, collapsed) {
  const style = port.style
  if (style instanceof StringTemplatePortStyle) {
    style.styleTag = { collapsed }
  }
}
