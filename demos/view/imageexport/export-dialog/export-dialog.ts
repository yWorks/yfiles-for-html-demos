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
import './export-dialog.css'

/**
 * Initializes the export dialog.
 * @param heading The heading of the dialog.
 * @param saveCallback A callback that is called after the save button is pressed.
 */
export function initializeExportDialog(
  heading: string,
  saveCallback: (previewElement: Element) => void
): void {
  const dialog = document.querySelector<HTMLDivElement>('#export-dialog')!
  dialog.innerHTML = `<div class="export-dialog">
  <div class="outer">
    <h2>${heading}</h2>
    <div class="export-preview-container">
      <div id="preview-container"></div>
    </div>
    <button id="save-button">Save</button>
    <button id="close-button">Close</button>
  </div>
</div>`
  dialog.style.display = 'none'

  const saveButton = document.querySelector<HTMLButtonElement>('#save-button')!
  const closeButton = document.querySelector<HTMLButtonElement>('#close-button')!
  const exportButton = document.querySelector<HTMLButtonElement>('#export-button')!
  const previewContainer = document.querySelector<HTMLDivElement>('#preview-container')!

  saveButton.addEventListener('click', () => {
    const previewElement = previewContainer.children.item(0)!
    saveCallback(previewElement)
  })

  closeButton.addEventListener('click', (_) => {
    // Hide the popup
    dialog.style.display = 'none'
    // Remove the exported SVG element from the popup since it is no longer needed
    previewContainer.innerHTML = ''
    // Re-enable the export button
    exportButton.disabled = false
  })
}

/**
 * Shows the export dialog.
 */
export function showExportDialog(previewElement: Element): void {
  const previewContainer = document.querySelector<HTMLDivElement>('#preview-container')!
  previewContainer.appendChild(previewElement)

  const dialog = document.querySelector<HTMLDivElement>('#export-dialog')!
  dialog.style.display = 'block'
}

/**
 * Hides the export dialog.
 */
export function hideExportDialog(): void {
  const dialog = document.querySelector<HTMLDivElement>('#export-dialog')!
  dialog.style.display = 'none'
}
