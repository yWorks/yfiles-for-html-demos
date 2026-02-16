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
export const demoSvgNodeStyleLitSources = `({layout, tag, selected, zoom}) => svg\`
<g>
<rect fill="#c0c0c0" width=$\{layout.width} height=$\{layout.height} x="2" y="2"></rect>
<rect fill="white" stroke="#C0C0C0" width=$\{layout.width} height=$\{layout.height}></rect>
<rect width=$\{layout.width} height="2" fill=$\{{present:'#55B757', busy:'#E7527C',travel:'#9945E9', unavailable:'#8D8F91'}[tag.status]}></rect>
<rect fill="transparent" stroke=$\{selected ? '#FF6C00' : 'transparent'} stroke-width="3" width=$\{layout.width-3} height=$\{layout.height-3} x="1.5" y="1.5"></rect>
$\{zoom >= 0.5 ? svg\`
  <image href=$\{'./resources/' + tag.icon + '.svg'} x="15" y="10" width="63.75" height="63.75"></image>
  <image href=$\{'./resources/' + tag.status + '_icon.svg'} x="25" y="80" height="15" width="60"></image>
  <g style="font-family: Roboto,sans-serif; fill: #444" width="185">
    <text transform="translate(90 25)" style="font-size: 16px; fill: #336699">$\{tag.name}</text>
    <text transform="translate(90 45)" style="font-size: 9px; text-transform: uppercase">$\{tag.position}</text>
    <text transform="translate(90 72)">$\{tag.email}</text>
    <text transform="translate(90 88)">$\{tag.phone}</text>
    <text transform="translate(170 88)">$\{tag.fax}</text>
  </g>
  \`: svg\`
  <image href=$\{'./resources/' + tag.icon + '.svg'} x="15" y="20" width="56.25" height="56.25"></image>
  <g style="font-size: 15px; font-family: Roboto,sans-serif; fill: #444" width="185">
    $\{LitSvgText({text:tag.name,x: 85, y:35, font: '26px Roboto,sans-serif', fill: '#336699'})}
  </g>
  \`}
</g>
\``

export const demoHtmlNodeStyleLitSources = `({ tag, selected, zoom }) => {
    const borderTopColor = selected
      ? '#FF6C00'
      : { present: '#55b757', busy: '#e7527c', travel: '#9945e9', unavailable: '#8d8f91' }[tag.status];

    return html\`
      <div style="
        width: 100%;
        height: 100%;
        background: white;
        box-shadow: 2px 3px 3px rgba(0,0,0,0.15);
        border: 1px solid #C0C0C0;
      ">
        <div style="
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          padding: 0 0 0 12px;
          border: $\{selected ? '2px solid #FF6C00' : '2px solid transparent'};
          border-top: 2px solid $\{borderTopColor};
        ">
           $\{ zoom >= 0.5 ? html\`
                <div style="display: flex; flex-direction: column;">
                  <img src=$\{'./resources/' + tag.icon + '.svg'} width="63" height="63" alt="icon" />
                  <img
                    src=$\{'./resources/' + tag.status + '_icon.svg'}
                    alt="status"
                    style="margin-top: 6px; margin-left: 10px;"
                  />
                </div>
                <div
                  style="
                padding: 0px 6px;
                font-family: Roboto, sans-serif;
                color: #444;
                line-height: 1.2;
              "
                >
                  <div style="font-size: 16px; color: #336699;">$\{tag.name}</div>
                  <div style="font-size: 8px; text-transform: uppercase; margin: 8px 0;">
                    $\{tag.position}
                  </div>
                  <div>$\{tag.email}</div>
                  <span>$\{tag.phone}</span>
                  <span style="margin-left: 1rem;">$\{tag.fax}</span>
                </div>
              \`
               : html\`
                   <img src=$\{'./resources/' + tag.icon + '.svg'} width="63" height="63" alt="icon" />
                   <div style="font-size: 26px; color: #336699; padding-left: 10px;">$\{tag.name}</div>
                 \`
           }
        </div>
      </div>
    \`
  }`

export const demoSvgLabelStyleLitSources = `({layout, text, tag, selected, zoom}) => svg\`
<g>
<rect
  fill=$\{selected ? '#eee' : '#fff'}
  fill-opacity="0.9"
  stroke=$\{selected ? '#FF6C00' : '#C0C0C0'}
  width=$\{layout.width}
  height=$\{layout.height}
  x="0"
  y="0"
  rx="8"
  ry="8"
  stroke="#444"
  stroke-width=$\{selected ? '2' : '0.5'}
/>
$\{LitSvgText({ text: text, x: layout.width * 0.5, y: 2, font: '10px Roboto,sans-serif', fill: '#222', textAnchor: 'middle' })}
</g>
\``

export const demoHtmlLabelStyleLitSources = `({text, tag, selected, zoom}) => html\`
  <div
    style="
      width: 100%;
      height: 100%;
      padding: 0 5px;
      background-color: $\{selected ? '#eee' : '#fff'};
      border: 1px solid #444;
      border-radius: 100px;
      font-size: 10px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    $\{text}
  </div>
\``
