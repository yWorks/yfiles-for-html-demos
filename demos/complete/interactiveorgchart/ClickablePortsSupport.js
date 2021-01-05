/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HashMap,
  IPort,
  Size,
  StringTemplatePortStyle
} from 'yfiles'

import OrgChartGraph from './OrgChartGraph.js'

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
 * this map contains a node as key and the port as a value, this map is necessary because in
 * tree layout more than one edge has the same source port, so when we click on the
 * port to hide or show the children we actually click on one or more source ports.
 * by using the map when we will be able to deal with one port, so that we are styling one port.
 */
const map = new HashMap()

export default class ClickablePortsSupport {
  constructor(orgChartGraph) {
    this.orgChartGraph = orgChartGraph

    // initialize converter
    StringTemplatePortStyle.CONVERTERS.orgChartConverters = {
      portIconStateConverter: val =>
        'port-icon ' + (val && val.collapsed ? 'port-icon-expand' : 'port-icon-collapse')
    }

    this.setDefaultPortStyle()
  }

  /**
   * We add style to the ports which has children, this style will be + when
   * the children's nodes are hidden and - when the children' s nodes are already showed
   *
   * @private
   */
  setDefaultPortStyle() {
    this.orgChartGraph.filteredGraph.edges.forEach(edge => {
      if (!map.keys.includes(edge.sourceNode)) {
        // set the map, in this map we connected evey node with on source port and that is very
        // important to styling only one source node when more than one edge sharing one source node
        map.set(edge.sourceNode, edge.sourcePort)

        // styling only the source ports which have children
        const portStyle = new StringTemplatePortStyle(portStyleTemplate)
        portStyle.renderSize = new Size(20, 20)
        portStyle.styleTag = { collapsed: false }
        this.orgChartGraph.filteredGraph.setStyle(edge.sourcePort, portStyle)
        this.orgChartGraph.filteredGraph.setPortLocationParameter(
          edge.sourcePort,
          FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
        )
      }
    })
  }

  /**
   * @param {GraphInputMode} graphInputMode
   */
  initializeInputMode(graphInputMode) {
    graphInputMode.clickableItems = GraphItemTypes.NODE | GraphItemTypes.PORT
    graphInputMode.clickHitTestOrder = [GraphItemTypes.PORT, GraphItemTypes.NODE]

    graphInputMode.addItemClickedListener((sender, args) => {
      const port = args.item
      const orgChartGraph = this.orgChartGraph
      if (IPort.isInstance(port) && orgChartGraph.completeGraph.inEdgesAt(port).size === 0) {
        const node = args.item.owner
        if (orgChartGraph.canExecuteHideChildren(node)) {
          orgChartGraph.executeHideChildren(node)
          this.setCollapsedStyleToChildren(node)
        } else {
          if (orgChartGraph.canExecuteShowChildren(node)) {
            orgChartGraph.executeShowChildren(node)

            this.setExpandStyleToNode(node)
          }
        }
        args.handled = true
      }
    })
  }

  /**
   * Set the collapsed style to all ports connected to the children to the given node and for the node it selves.
   * We use this function after hide children of a node, then we should change the style of the node's port and for the
   * children.
   */
  setCollapsedStyleToChildren(node) {
    const nodes = OrgChartGraph.collectSubtreeNodes(this.orgChartGraph.completeGraph, node)
    nodes.forEach(node => {
      const portIn = map.get(node)
      if (portIn) {
        portIn.style.styleTag = { collapsed: true }
      }
    })
  }

  /**
   * Set the expand style to the port of the given node.
   * we use this function after show children of a node, then we will change only the style of the node.
   */
  setExpandStyleToNode(node) {
    const portIn = map.get(node)
    if (portIn) {
      portIn.style.styleTag = { collapsed: false }
    }
  }
}
