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
import { DemoConfiguration } from './DemoConfiguration'
import {
  Arrow,
  IEdge,
  IEdgeStyle,
  IGraph,
  INode,
  INodeStyle,
  PolylineEdgeStyle,
  Rect,
  Size,
  WebGLNodeStyleDecorator,
  WebGLShapeNodeShape,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { createLitNodeStyleFromSource } from '@yfiles/demo-utils/LitNodeStyle'

export type Employee = {
  position?: string
  name: string
  email: string
  phone: string
  fax: string
  businessUnit: string
  status: string
  icon: string
  subordinates?: Employee[]
  parent?: Employee
}

const nodeStyleTemplate = `({ layout, tag, selected, zoom }) => {
  function formatPosition(position, maxLength) {
    if (!position || position.length <= maxLength) {
      return [position?.toUpperCase() || ''];
    }
    let truncated = position.slice(0, maxLength);
    let lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      return [
        truncated.slice(0, lastSpaceIndex).toUpperCase(),
        position.slice(lastSpaceIndex + 1).toUpperCase()
      ];
    }
    return [position.toUpperCase()];
  }
  return svg\`
  <g>
    <use href="#node-dropshadow" x="-10" y="-5"></use>
    <rect fill="#FFFFFF" stroke="#C0C0C0" width="$\{layout.width}" height="$\{layout.height}"></rect>
    <rect width="$\{layout.width}" height="\${zoom < 0.4 ? layout.height : zoom < 0.7 ? '10' : '5'}" class="node-background"
      fill='$\{tag.status === "present" ? "#76b041" : tag.status === "busy" ? "#ab2346" : tag.status === "travel" ? "#a367dc" : "#c1c1c1"}'>
    </rect>
    <rect class='\${selected ? "yfiles-highlighted yfiles-focused" : ""}' fill='none' stroke-width='3' width='\${layout.width + 3}' height='\${layout.height + 3}' x='-1.5' y='-1.5'></rect>
    <!-- Detail View -->
    \${zoom >= 0.7 ? svg\`
      <image href="./resources/icons/\${tag.icon}.svg" x='15' y='10' width='63.75' height='63.75'></image>
      <image href="./resources/icons/\${tag.status}_icon.svg" x='25' y='80' height='15' width='60'></image>
      <g style='font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444'>
        <text transform='translate(100 25)' style='font-size:16px; fill:#336699'>\${tag.name}</text>
        \${formatPosition(tag.position, 30).map((line, i) => svg\`<text x='100' y='\${i*15+45}' font-size='10' font-family='Roboto,sans-serif'>\${line}</text>\`)}
        <text transform='translate(100 72)'>\${tag.email}</text>
        <text transform='translate(100 88)'>\${tag.phone}</text>
        <text transform='translate(170 88)'>\${tag.fax}</text>
      </g>
    \` :  zoom >= 0.4 ? svg\`
      <!-- Intermediate View -->
      <image href="./resources/icons/\${tag.icon}.svg" x='15' y='20' width='56.25' height='56.25'/>
      <g style='font-size:15px; font-family:Roboto,sans-serif; fill:#444' width='185'>
        <text transform='translate(75 40)' style='font-size:26px; font-family:Roboto,sans-serif; fill:#336699'>\${tag.name}</text>
        \${formatPosition(tag.position, 22).map((line, i) => svg\`<text x='75' y='\${i*20+65}' font-size='15' font-family='Roboto,sans-serif'>\${line}</text>\`)}
      </g>
    \` :  svg\`
      <!-- Overview View -->
      <text transform='translate(30 50)' style='font-size:40px; font-family:Roboto,sans-serif; fill:#fff; dominant-baseline: central;'>
        \${tag.name.replace(/^(.)(\\S*)(.*)/, "$1.$3")}
      </text>
    \`}
  </g>
\`}`

export class OrgChartDemoConfiguration extends DemoConfiguration {
  graphResourcePath = 'resources/orgchart.json'

  svgThreshold = 0.25

  private webGLGroupNodeStyle = new WebGLShapeNodeStyle('rectangle', '#bbb')
  private litNodeStyle = createLitNodeStyleFromSource(nodeStyleTemplate)

  edgeStyleProvider = (_edge: IEdge, graph: IGraph): IEdgeStyle => {
    return graph.edgeDefaults.getStyleInstance()
  }

  nodeStyleProvider = (node: INode, graph: IGraph): INodeStyle => {
    if (graph.isGroupNode(node)) {
      return this.webGLGroupNodeStyle
    }
    const color = this.getColor(node.tag.status)
    return new WebGLNodeStyleDecorator(
      this.litNodeStyle,
      new WebGLShapeNodeStyle(WebGLShapeNodeShape.RECTANGLE, color)
    )
  }

  nodeCreator = null

  async initializeStyleDefaults(graph: IGraph): Promise<void> {
    return new Promise((resolve) => {
      // use the Vue2NodeStyle to display the nodes through a svg template
      // in this svg template you can see three styles in three zoom levels
      graph.nodeDefaults.style = createLitNodeStyleFromSource(nodeStyleTemplate)
      graph.nodeDefaults.size = new Size(285, 100)

      const edgeColor = 'rgb(100,100,100)'
      graph.edgeDefaults.style = new PolylineEdgeStyle({
        stroke: `2px ${edgeColor}`,
        targetArrow: new Arrow({
          type: 'triangle',
          stroke: edgeColor,
          fill: edgeColor
        }),
        smoothingLength: 10
      })
      resolve()
    })
  }

  protected createNode(graph: IGraph, _id: any, layout: Rect, nodeData: any) {
    return graph.createNode({
      layout: layout,
      tag: nodeData.tag
    })
  }

  private getColor(status: string) {
    switch (status) {
      case 'present':
        return '#55B757'
      case 'busy':
        return '#E7527C'
      case 'travel':
        return '#9945E9'
      case 'unavailable':
        return '#8D8F91'
      default:
        return '#ffffff'
    }
  }
}
