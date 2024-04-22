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
//language =HTML
export const constraintNodeStyle = `
  <g visibility="{Binding constraints, Converter=constraintsdemos.constraintsvisibilityconverter}">
    <rect stroke="none" fill="{Binding value, Converter=constraintsdemos.backgroundconverter}" rx="4" ry="4"
        width="{TemplateBinding width}" height="{TemplateBinding height}"/>
    <text data-content="{Binding value, Converter=constraintsdemos.constraintconverter}" x="30" y="22"
        text-anchor="middle" font-size="22"
        fill="{Binding value, Converter=constraintsdemos.textcolorconverter}"/>
    <g transform="translate(0 50)" class="button-container">
      <ellipse cx="12" cy="-12" rx="8" ry="8" stroke="none" fill="white" class="button"/>
      <path d="M 7 -12 L 17 -12" stroke="grey" stroke-width="2"/>
    </g>
    <g transform="translate(0 50)" class="button-container">
      <ellipse cx="30" cy="-12" rx="8" ry="8" stroke="none" fill="white" class="button"/>
      <ellipse cx="30" cy="-14" rx="2" ry="3" stroke="grey" fill="none"/>
      <rect width="9" height="7" rx="1" ry="1" x="25.5" y="-14" fill="grey"/>
      <path d="M 30 -11 L 30 -9" stroke="white" stroke-linecap="round" fill="none"/>
      <ellipse cx="30" cy="-11" rx="1" ry="1" stroke="none" fill="white"/>
    </g>
    <g transform="translate(0 50)" class="button-container">
      <ellipse cx="48" cy="-12" rx="8" ry="8" stroke="none" fill="white" class="button"/>
      <path d="M 48 -17 L 48 -7 M 43 -12 L 53 -12" stroke="grey" stroke-width="2"/>
    </g>
  </g>
  <g visibility="{Binding constraints, Converter=constraintsdemos.noconstraintsvisibilityconverter}">
    <rect stroke="none" fill="lightgrey" rx="4" ry="4" width="{TemplateBinding width}"
        height="{TemplateBinding height}"/>
    <g class="button-container">
      <ellipse cx="30" cy="25" rx="15" ry="15" stroke="none" fill="white" class="button"/>
      <ellipse cx="30" cy="21" rx="4" ry="6" stroke="grey" stroke-width="2" fill="none"/>
      <rect width="18" height="14" rx="2" ry="2" x="21" y="20" fill="grey"/>
      <path d="M 30 25 L 30 30" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
      <ellipse cx="30" cy="25" rx="2" ry="2" stroke="none" fill="white"/>
      <path d="M 30 20 L 36 11 L 36 20 Z" stroke="none" fill="white"/>
    </g>
  </g>
`
