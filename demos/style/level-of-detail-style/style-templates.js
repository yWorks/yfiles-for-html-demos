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
export const detailNodeStyleTemplateSource = `({layout, tag, selected, zoom}) => svg\`
<rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)" />
<rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100" />

<g>
  <rect width="3" height="100" />
  <rect width="3" height="100" transform="translate(282 0)" />
  <rect width="285" height="3"></rect>
  <rect width="285" height="3" transform="translate(0 97)" />
</g>
<g style="font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444">
  <text
    transform="translate(10 25)"
    style="font-size:16px; fill:#336699">$\{tag.name}
  </text>
  <text
    transform="translate(10 45)"
    style="text-transform: uppercase; font-weight: 400">$\{tag.position}
  </text>
  <text transform="translate(10 72)">$\{tag.email}</text>
  <text transform="translate(10 88)">$\{tag.phone}</text>
  <text transform="translate(70 88)">$\{tag.fax}</text>
</g>
\``
//language=HTML
export const intermediateNodeStyleTemplateSource = `({layout, tag, selected, zoom}) => svg\`
<rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)" />
<rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100" />
<g>
  <rect width="3" height="100" />
  <rect width="3" height="100" transform="translate(282 0)" />
  <rect width="285" height="3" />
  <rect width="285" height="3" transform="translate(0 97)" />
</g>

<text
  transform="translate(10 40)"
  style="font-size:26px; font-family:Roboto,sans-serif; fill:#336699;">$\{tag.name}
</text>
<text
  transform="translate(10 70)"
  style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400">$\{tag.position}</text>
\``
//language=HTML
export const overviewNodeStyleTemplateSource = `({layout, tag, selected, zoom}) => svg\`
<rect fill="#AAA" width="288" height="103" transform="translate(-1 -1)" />
<rect fill="#FFFFFF" width="285" height="100" />
<g>
  <rect width="3" height="100" />
  <rect width="3" height="100" transform="translate(282 0)" />
  <rect width="285" height="3" />
  <rect width="285" height="3" transform="translate(0 97)" />
</g>
<text
  transform="translate(10 50)"
  style="font-size:40px; font-family:Roboto,sans-serif; fill:#336699; dominant-baseline: central;">$\{tag.name}</text>
\``
