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
//language=HTML
export const detailNodeStyleTemplate = `({ layout, tag, selected, zoom }) => svg\`
  <g>
    <use href='#node-dropshadow' x='-10' y='-5'></use>
    <rect fill="#FFFFFF" stroke="#C0C0C0" width="$\{layout.width}" height="$\{layout.height}"></rect>
    <rect width="$\{layout.width}" height="5" fill='$\{tag.status === "present" ? "#76b041" :
    tag.status === "busy" ? "#ab2346" : tag.status === "travel" ? "#a367dc" : "#c1c1c1"}'
          class="node-background"></rect>
    <image href="./resources/\${tag.icon}.svg" x='15' y='10' width='63.75' height='63.75'></image>
    <image href="./resources/\${tag.status}_icon.svg" x='25' y='80' height='15' width='60'></image>
    <g style='font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444'>
      <text transform='translate(100 25)' style='font-size:16px; fill:#336699'>\${tag.name}</text>
      <text x='100' y='45' font-size='10' font-family='Roboto,sans-serif'>
        \${tag.position.toUpperCase()}
      </text>
      <text transform='translate(100 72)'>\${tag.email}</text>
      <text transform='translate(100 88)'>\${tag.phone}</text>
      <text transform='translate(170 88)'>\${tag.fax}</text>
    </g>
  </g>\``

export const overviewNodeStyleTemplate = `({ layout, tag, selected, zoom }) => svg\`
  <g>
    <rect fill="#FFFFFF" stroke="#C0C0C0" width="$\{layout.width}" height="$\{layout.height}"></rect>
    <rect width="15" height="\${layout.height}" fill='$\{tag.status === "present" ? "#76b041" :
    tag.status === "busy" ? "#ab2346" : tag.status === "travel" ? "#a367dc" : "#c1c1c1"}' class="node-background"></rect>
    <text transform='translate(30 50)' style='font-size:40px; font-family:Roboto,sans-serif; fill:#444; dominant-baseline: central;'>
    \${tag.name.replace(/^(.)(\\S*)(.*)/, "$1.$3")}</text>
  </g>\``
