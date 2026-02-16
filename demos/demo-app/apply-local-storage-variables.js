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
function applyLocalStorageVariables() {
  // Get theme
  const browserDefaultTheme =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'theme-dark'
      : 'theme-light'
  const theme = localStorage.getItem('yfiles-readme-theme') || browserDefaultTheme
  document.body.classList.remove('theme-dark', 'theme-light')
  document.body.classList.add(theme)

  // Restore description size if draggable
  const description = document.querySelector('.demo-page__description')
  if (description && description.classList.contains('demo-description--draggable')) {
    // disable grid-area transition
    document.body.style.transition = 'none'
    restoreDescriptionSize(true)
    restoreDescriptionSize(false)
  }
}

function restoreDescriptionSize(vertical) {
  const key = vertical ? 'demo-description-width' : 'demo-description-height'
  const size = getNumberItemFromLocalStorage(key)
  if (size == null) {
    return
  }
  const property = vertical ? '--description-width' : '--description-drag-height'
  document.body.style.setProperty(property, `${size}px`)
}
function getNumberItemFromLocalStorage(key) {
  const storageItem = localStorage.getItem(key)

  if (!storageItem) {
    return null
  }
  const size = parseFloat(storageItem)

  return Number.isFinite(size) ? size : null
}

applyLocalStorageVariables()
