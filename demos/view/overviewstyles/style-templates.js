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
//language=HTML
export const detailNodeStyleTemplate = `
  <rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)" />
  <rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100" />
  <use xlink:href="{Binding icon, Converter=orgChartConverters.addHashConverter}"
    transform="scale(0.85) translate(15 10)" />
  <use xlink:href="{Binding status, Converter=orgChartConverters.addHashConverter}" />
  <use xlink:href="{Binding status, Converter=orgChartConverters.addHashConverter, Parameter=_icon}"
    transform="translate(26 84)" />
  <g style="font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444">
    <text transform="translate(100 25)" data-content="{Binding name}"
      style="font-size:16px; fill:#336699"/>
    <text transform="translate(100 45)"
      data-content="{Binding position, Converter=orgChartConverters.lineBreakConverter, Parameter=true}"
      style="text-transform: uppercase; font-weight: 400"/>
    <text transform="translate(100 57)"
      data-content="{Binding position, Converter=orgChartConverters.lineBreakConverter, Parameter=false}"
      style="text-transform: uppercase; font-weight: 400"/>
    <text transform="translate(100 72)" data-content="{Binding email}"/>
    <text transform="translate(100 88)" data-content="{Binding phone}"/>
    <text transform="translate(170 88)" data-content="{Binding fax}"/>
  </g>`

export const overviewNodeStyle = `
  <rect fill="{Binding status, Converter=orgChartConverters.colorConverter}" width="30" height="{TemplateBinding height}"/>
  <rect fill="white" transform="translate(30 0)" width="{TemplateBinding width}" height="{TemplateBinding height}" rx="10" ry="10"/>
  <text transform="translate(50 50)" data-content="{Binding name, Converter=orgChartConverters.overviewConverter}"
  style="font-size:50px; font-family:Roboto,sans-serif; fill:#336699; dominant-baseline: central;"/>`
