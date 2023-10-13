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
//language=HTML
export const orgchartPortTemplate =
  //A very basic template for ports that consists of an ellipse
  `
    <ellipse fill="rgb(229,233,240)" cx="0" cy="0"
      rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
      ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"/>`

//language=HTML
export const orgchartLabelTemplate =
  //A template for labels renders the label text with an outline stroke
  `
    <g class="orgchart-label">
      <text data-content="{TemplateBinding labelText}" dy="1em" stroke="rgb(94,103,130)"
        stroke-width="7px" stroke-linejoin="round" text-anchor="middle"
        transform="translate(50 0)"/>
      <text data-content="{TemplateBinding labelText}" dy="1em" fill="rgb(229,233,240)"
        text-anchor="middle" transform="translate(50 0)"/>
    </g>`

//language=HTML
export const orgchartNodeTemplate =
  //A template for nodes that renders the icon and name as well as a status indicator and selection visualization
  `
    <g class="orgchart-node">
      <!-- The defs section stores the clip path elements -->
      <defs>
        <clipPath id="imageClip">
          <ellipse cx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
            cy="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"
            rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5-5}"
            ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.5-5}"/>
        </clipPath>
        <clipPath id="labelClip">
          <rect x="0" y="{TemplateBinding height, Converter=calc, Parameter=$v*0.6}"
            width="{TemplateBinding width}"
            height="{TemplateBinding height, Converter=calc, Parameter=$v*0.4}"/>
        </clipPath>
      </defs>
      <!-- An ellipse that appears on hover via CSS -->
      <ellipse class="hover-ellipse" fill="{Binding businessUnit, Converter=backgroundColor}"
        cx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        cy="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"
        rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5+10}"
        ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.5+10}"/>
      <!-- The background ellipse -->
      <ellipse fill="{Binding businessUnit, Converter=backgroundColor}"
        cx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        cy="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"
        rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"/>
      <!-- The user icon -->
      <image xlink:href="{Binding icon, Converter=icon}" clip-path="url(#imageClip)" x="5"
        y="{TemplateBinding height, Converter=calc, Parameter=$v*-0.1}"
        width="{TemplateBinding width, Converter=calc, Parameter=$v-10}"
        height="{TemplateBinding height, Converter=calc, Parameter=$v-10}"/>
      <!-- The half-circle background for the name -->
      <ellipse fill="{Binding businessUnit, Converter=backgroundColor}" clip-path="url(#labelClip)"
        cx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        cy="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"
        rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"/>
      <!-- The name text -->
      <text fill="rgb(37,41,52)" data-content="{Binding name}" text-anchor="middle"
        style="font-family: Tahoma, Verdana, sans-serif"
        font-size="{TemplateBinding width, Converter=fontSize}"
        x="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        y="{TemplateBinding height, Converter=calc, Parameter=$v*0.75}"/>
      <!-- The focus indicator -->
      <ellipse stroke="rgb(255,220,0)" fill="none" stroke-width="10"
        visibility="{TemplateBinding itemFocused, Converter=visibility}"
        cx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5}"
        cy="{TemplateBinding height, Converter=calc, Parameter=$v*0.5}"
        rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.5+5}"
        ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.5+5}"/>
      <!-- The status indicator -->
      <ellipse fill="{Binding status, Converter=statusColor}" class="orgchart-status-indicator"
        cx="{TemplateBinding width, Converter=calc, Parameter=$v*0.90-5}"
        cy="{TemplateBinding height, Converter=calc, Parameter=$v*0.1+5}"
        rx="{TemplateBinding width, Converter=calc, Parameter=$v*0.10}"
        ry="{TemplateBinding height, Converter=calc, Parameter=$v*0.10}"/>
    </g>
  `
