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
export const detailNodeStyleTemplate = `
  <defs>
    <linearGradient x1="0.5" y1="0" x2="0.5" y2="1" spreadMethod="pad" id="background_gradient">
      <stop stop-color="#CCFFFF" stop-opacity="1" offset="0"/>
      <stop stop-color="#249AE7" stop-opacity="1" offset="1"/>
    </linearGradient>

    <linearGradient
      x1="0.5"
      y1="0"
      x2="0.5"
      y2="1"
      spreadMethod="pad"
      id="background_gradient_focused"
    >
      <stop stop-color="#FFFFFF" stop-opacity="1" offset="0"/>
      <stop stop-color="#FFA500" stop-opacity="1" offset="1"/>
    </linearGradient>

    <linearGradient
      x1="0.5"
      y1="0"
      x2="0.5"
      y2="1"
      spreadMethod="pad"
      id="background_gradient_hover"
    >
      <stop stop-color="#FFFFFF" stop-opacity="0.6" offset="0"/>
      <stop stop-color="#FFFFFF" stop-opacity="0.6" offset="1"/>
    </linearGradient>
  </defs>

  <rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)" />
  <rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100" />

  <use xlink:href="{Binding status" />

  <g>
    <rect width="3" height="100"/>
    <rect width="3" height="100" transform="translate(282 0)"/>
    <rect width="285" height="3"></rect>
    <rect width="285" height="3" transform="translate(0 97)"/>
  </g>
  <g style="font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444">
    <text
      transform="translate(10 25)"
      data-content="{Binding name}"
      style="font-size:16px; fill:#336699"
    />
    <text
      transform="translate(10 45)"
      data-content="{Binding position}"
      style="text-transform: uppercase; font-weight: 400"
    />
    <text transform="translate(10 72)" data-content="{Binding email}"/>
    <text transform="translate(10 88)" data-content="{Binding phone}"/>
    <text transform="translate(70 88)" data-content="{Binding fax}"/>
  </g>
`

//language=HTML
export const intermediateNodeStyleTemplate = `
  <rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)" />
  <rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100" />
  <use xlink:href="{Binding status}" />
  <g>
    <rect width="3" height="100"/>
    <rect width="3" height="100" transform="translate(282 0)"/>
    <rect width="285" height="3"/>
    <rect width="285" height="3" transform="translate(0 97)"/>
  </g>

  <text
    transform="translate(10 40)"
    data-content="{Binding name}"
    style="font-size:26px; font-family:Roboto,sans-serif; fill:#336699;"
  />
  <text
    transform="translate(10 70)"
    data-content="{Binding position}"
    style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400"
  />
`

//language=HTML
export const overviewNodeStyleTemplate = `
  <rect fill="#AAA" width="288" height="103" transform="translate(-1 -1)" />
  <rect fill="#FFFFFF" width="285" height="100" />
  <use xlink:href="{Binding status}" />
  <g>
    <rect width="3" height="100"/>
    <rect width="3" height="100" transform="translate(282 0)"/>
    <rect width="285" height="3"/>
    <rect width="285" height="3" transform="translate(0 97)"/>
  </g>
  <text
    transform="translate(10 50)"
    data-content="{Binding name}"
    style="font-size:40px; font-family:Roboto,sans-serif; fill:#336699; dominant-baseline: central;"
  />
`
