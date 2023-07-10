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
const themeDarkIcon = new URL('../../resources/icons/theme-dark.svg', import.meta.url)
const themeLightIcon = new URL('../../resources/icons/theme-light.svg', import.meta.url)

const template = document.createElement('template')
template.innerHTML = `
<style>
.theme-button {
    width: 100%;
    height: 100%;
    cursor: pointer;
    border: none;
    outline: none;
  }
.theme-button:hover, .theme-button:active {
  box-shadow: 0 0 100px 100px rgba(255, 255, 255, 0.15) inset;
}
.theme-button.theme-button--light {
    background: url("${themeDarkIcon}") no-repeat 50% 50%;
    background-size: 20px;
}
.theme-button.theme-button--dark {
    background: url("${themeLightIcon}") no-repeat 50% 50%;
    background-size: 22px;
}
</style>
<button
  class='theme-button'
  title='Switch theme'
></button>
`

class ThemeButtonComponent extends HTMLElement {
  private readonly themeButton: Element | null = null
  private readonly themeHandler: EventListener | undefined

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true))

      this.themeButton = this.shadowRoot.querySelector('.theme-button')
      this.themeHandler = () => this.switchTheme()

      this.themeButton?.classList.add(
        document.body.classList.contains('theme-dark')
          ? 'theme-button--dark'
          : 'theme-button--light'
      )
    }
  }

  connectedCallback() {
    this.themeButton?.addEventListener('click', this.themeHandler!)
  }

  disconnectedCallback() {
    this.themeButton?.removeEventListener('click', this.themeHandler!)
  }

  private switchTheme(): void {
    this.setTheme(document.body.classList.contains('theme-light'))
  }

  private setTheme(light: boolean): void {
    if (light) {
      localStorage.setItem('yfiles-readme-theme', 'theme-dark')
      document.body.classList.remove('theme-light')
      document.body.classList.add('theme-dark')
      this.themeButton?.classList.remove('theme-button--light')
      this.themeButton?.classList.add('theme-button--dark')
    } else {
      localStorage.setItem('yfiles-readme-theme', 'theme-light')
      document.body.classList.remove('theme-dark')
      document.body.classList.add('theme-light')
      this.themeButton?.classList.remove('theme-button--dark')
      this.themeButton?.classList.add('theme-button--light')
    }
  }
}

customElements.define('theme-button', ThemeButtonComponent)

// Empty export to force TypeScript to threat this as a module
export {}
