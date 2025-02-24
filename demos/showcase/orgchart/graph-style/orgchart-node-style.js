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
import { createLitNodeStyleFromSource } from '@yfiles/demo-utils/LitNodeStyle'
/**
 * Creates a new {@link Vue2NodeStyle} with a template that shows more details on higher
 * zoom levels and fewer details on lower zoom levels.
 */
export function createOrgChartNodeStyle(graphComponent, nodeSize) {
  const nodeStyle = createLitNodeStyleFromSource(nodeStyleTemplate)
  // create the drop shadow element only once
  const defsElement = graphComponent.svgDefsManager.defs
  if (!defsElement.querySelector('#node-dropshadow')) {
    defsElement.appendChild(createDropShadowElement(nodeSize))
  }
  return nodeStyle
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
    <rect
      width="$\{layout.width}"
      height="\${zoom < 0.4 ? layout.height : zoom < 0.7 ? '10' : '5'}"
      fill='$\{tag.status === "present" ? "#76b041" :
    tag.status === "busy" ? "#ab2346" :
      tag.status === "travel" ? "#a367dc" : "#c1c1c1"}'
      class="node-background"></rect>
    <rect class='\${selected ? "yfiles-highlighted yfiles-focused" : ""}'
      fill='none' stroke-width='3'
      width='\${layout.width + 3}' height='\${layout.height + 3}' x='-1.5' y='-1.5'></rect>
    <!-- Detail View -->
    \${zoom >= 0.7 ? svg\`
      <image href="./resources/\${tag.icon}.svg" x='15' y='10' width='63.75' height='63.75'></image>
      <image href="./resources/\${tag.status}_icon.svg" x='25' y='80' height='15' width='60'></image>
      <g style='font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444'>
        <text transform='translate(100 25)' style='font-size:16px; fill:#336699'>\${tag.name}</text>
        \${formatPosition(tag.position, 30).map((line, i) => svg\`<text x='100' y='\${i*15+45}' font-size='10' font-family='Roboto,sans-serif'>\${line}</text>\`)}
        <text transform='translate(100 72)'>\${tag.email}</text>
        <text transform='translate(100 88)'>\${tag.phone}</text>
        <text transform='translate(170 88)'>\${tag.fax}</text>
      </g>
    \` :  zoom >= 0.4 ? svg\`
      <!-- Intermediate View -->
      <image href="./resources/\${tag.icon}.svg" x='15' y='20' width='56.25' height='56.25'/>
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
/**
 * Creates the drop shadow element for the nodes.
 */
function createDropShadowElement(nodeSize) {
  // pre-render the node's drop shadow using HTML5 canvas rendering
  const canvas = window.document.createElement('canvas')
  canvas.width = nodeSize.width + 30
  canvas.height = nodeSize.height + 30
  const context = canvas.getContext('2d')
  context.fillStyle = 'rgba(0,0,0,0.4)'
  context.filter = 'blur(4px)'
  context.globalAlpha = 0.6
  roundRect(context, 10, 10, nodeSize.width, nodeSize.height)
  context.fill()
  const dataUrl = canvas.toDataURL('image/png')
  // put the drop-shadow in an SVG image element
  const image = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
  image.setAttribute('width', `${canvas.width}`)
  image.setAttribute('height', `${canvas.height}`)
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
  // switch off pointer events on the drop shadow
  image.setAttribute('style', 'pointer-events: none')
  image.setAttribute('id', 'node-dropshadow')
  return image
}
/**
 * Helper function to draw a round rectangle on a given canvas context.
 */
function roundRect(ctx, x, y, width, height, radius = 5) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
