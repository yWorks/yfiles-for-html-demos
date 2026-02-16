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
const template = document.createElement('template')
template.innerHTML = `
<style>
.fullscreen-button {
    width: 100%;
    height: 100%;
    cursor: pointer;
    border: none;
    outline: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' fill='white'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
    background-size: 25px;
  }
.fullscreen-button:hover, .fullscreen-button:active {
  box-shadow: 0 0 100px 100px rgba(255, 255, 255, 0.15) inset;
}
</style>
<button
  class='fullscreen-button'
  title='Toggle fullscreen mode'
></button>
`

class FullscreenButtonComponent extends HTMLElement {
  private readonly fullscreenButton: Element | null = null
  private readonly fullscreenHandler: EventListener | undefined

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true))

      this.fullscreenButton = this.shadowRoot.querySelector('.fullscreen-button')
      this.fullscreenHandler = () => this.toggleFullscreen()
    }
  }

  connectedCallback() {
    this.fullscreenButton?.addEventListener('click', this.fullscreenHandler!)
  }

  disconnectedCallback() {
    this.fullscreenButton?.removeEventListener('click', this.fullscreenHandler!)
  }

  private toggleFullscreen(): void {
    // Before Safari 16.4 (2023-03-27), only the Fullscreen API is prefixed with webkit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        alert(`Error attempting to exit full-screen mode. Perhaps it was blocked by your browser.`)
      })
    } else if ((document as any).webkitFullscreenElement) {
      // The method with vendor prefix might not return a Promise, don't add the error handler here
      ;(document as any).webkitExitFullscreen()
    } else {
      const documentElement = document.documentElement as HTMLElement & {
        webkitRequestFullscreen: any
      }
      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen().catch(() => {
          alert(
            `Error attempting to enable full-screen mode. Perhaps it was blocked by your browser.`
          )
        })
      } else if (documentElement.webkitRequestFullscreen) {
        // The method with vendor prefix might not return a Promise, don't add the error handler here
        documentElement.webkitRequestFullscreen((Element as any).ALLOW_KEYBOARD_INPUT)
      }
    }
  }
}

customElements.define('fullscreen-button', FullscreenButtonComponent)

// Empty export to force TypeScript to threat this as a module
export {}
