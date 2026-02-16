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
import { predefinedColorSets } from './CompanyOwnershipNodeStyles'
import { colorSets } from '@yfiles/demo-app/demo-colors'
import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'

// @ts-ignore Import via URL
import { svg } from 'lit-html'

// creates the template style for the nodes
export const tableNodeStyle = new LitNodeStyle(
  ({ layout, tag }) => svg`<g>
  <rect fill="#a4aeb3" width=${layout.width} height=${layout.height} x="1" y="1"/>
  <rect fill="#f0f0f0" stroke="#a4aeb3" width=${layout.width} height=${layout.height}/>
  <rect width=${layout.width} height="3" fill=${colorSets[predefinedColorSets.get(tag.nodeType) || 'demo-palette-51'].fill || 'white'}/>
  <g style="font-family: Roboto,sans-serif; fill: #444; font-size: 12px;">
    <text transform="translate(8 20)" style="font-size: 14px; text-align: center; fill: #336699">${tag.name}</text>
    <rect transform="translate(8 24)" width="164" height="1" fill="#336699"/>

    <text transform="translate(8 40)">Type</text>
    <text transform="translate(110 40)">${tag.nodeType}</text>

    <text transform="translate(8 55)">Jurisdiction</text>
    <text transform="translate(110 55)">${tag.jurisdiction}</text>

    <text transform="translate(8 70)">Tax Status</text>
    <text transform="translate(110 70)">${tag.taxStatus ?? '---'}</text>

    <text transform="translate(8 85)">Currency</text>
    <text transform="translate(110 85)">${tag.currency ?? '---'}</text>

    <text transform="translate(8 100)">Units</text>
    <text transform="translate(110 100)">${tag.units ?? '---'}</text>
  </g>
</g>`
)
