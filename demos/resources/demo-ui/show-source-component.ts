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
const template = document.createElement('template')
template.innerHTML = `
<style>
.show-source-button {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: none;
  outline: none;
  background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDBWMHoiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTExIDdoMnYyaC0yem0wIDRoMnY2aC0yem0xLTlDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==) no-repeat 50% 50%;
}
.show-source-button:hover, .show-source-button:active {
  box-shadow: 0 0 100px 100px rgba(255, 255, 255, 0.15) inset;
}
.show-source-content {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 400px;
  background-color: #fff;
  color: #343f4a;
  font-size: 16px;
  line-height: initial;
  padding: 20px;
  box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
    0 24px 38px 3px rgba(0, 0, 0, 0.14),
    0 9px 46px 8px rgba(0, 0, 0, 0.12);
  text-align: center;
  z-index: 1000;
}
.show-source-content.hidden {
  display: none;
}
.show-source-content__source-path {
  font-weight: bold;
  margin-top: 10px;
  font-size: 1.2em;
}
</style>
<div class='show-source-button'>
  <div class='show-source-content hidden'>
    The source code for this demo is available in your yFiles&nbsp;for&nbsp;HTML package in the following folder:<br>
    <div class="show-source-content__source-path">
      ${location.pathname.toString().replace(/[\w_-]+\.html/i, '')}
    </div>
  </div>
</div>
`

class ShowSourceButtonComponent extends HTMLElement {
  private readonly showSourceButton: Element | null = null
  private readonly showSourceContent: Element | null = null
  private readonly showSourceHandler: EventListener | undefined

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true))

      this.showSourceButton = this.shadowRoot.querySelector('.show-source-button')
      this.showSourceContent = this.shadowRoot.querySelector('.show-source-content')
      this.showSourceHandler = () => this.showSourceContent?.classList.toggle('hidden')
    }
  }

  connectedCallback() {
    this.showSourceButton?.addEventListener('click', this.showSourceHandler!)
  }

  disconnectedCallback() {
    this.showSourceButton?.removeEventListener('click', this.showSourceHandler!)
  }
}

customElements.define('show-source-button', ShowSourceButtonComponent)

// Empty export to force TypeScript to threat this as a module
export {}
