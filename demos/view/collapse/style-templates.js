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
// language=HTML
import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'
// @ts-ignore Import via URL
import { svg } from 'lit-html'

export function initializeStyles(graphComponent) {
  const defs = graphComponent.svgDefsManager.defs
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  element.innerHTML = `<g id="expand_icon" transform="translate(21 6)">
      <polygon stroke="#FFFFFF" stroke-width="3" fill="none"
        points="6,17 6,12 1,12 1,6 6,6 6,1 12,1 12,6 17,6 17,12 12,12 12,17" />
      <polygon stroke="none" fill="#999999" points="6,17 6,12 1,12 1,6 6,6 6,1 12,1 12,6 17,6 17,12 12,12 12,17" />
    </g>
    <g id="collapse_icon" transform="translate(21 6)">
      <rect x="1" y="6" fill="none" stroke="#FFFFFF" stroke-width="3" width="16" height="6" />
      <rect x="1" y="6" fill="#999999" stroke="none" width="16" height="6" />
    </g>`
  defs.appendChild(element)

  const templateLeafNodeStyle = new LitNodeStyle(
    () => svg`
  <rect stroke="none" fill="#76b041" rx="4" ry="4" width="58" height="28" transform="translate(1 1)"/>
`
  )

  const templateInnerNodeStyle = new LitNodeStyle(
    ({ tag }) => svg`
      <g>
        <rect stroke="none" fill=${tag.collapsed ? '#f26419' : '#01baff'}
              rx="4" ry="4" width="60" height="30" />
        <use href=${tag.collapsed ? '#expand_icon' : '#collapse_icon'}
             style="pointer-events:none" />
      </g>`
  )

  return { templateInnerNodeStyle, templateLeafNodeStyle }
}
