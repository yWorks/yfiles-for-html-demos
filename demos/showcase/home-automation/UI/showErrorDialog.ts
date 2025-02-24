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
type ErrorDialogOptions = {
  title: string
  message: string
}

type DialogElements = {
  dialog: HTMLElement
  dismissButton: HTMLButtonElement
}

function createErrorDialog({ title, message }: ErrorDialogOptions): DialogElements {
  const htmlString = `
    <div class="demo-dialog-anchor demo-dialog-anchor--error">
      <div class="demo-dialog demo-dialog--error">
        <h2 class="demo-dialog__title">${title}</h2>
        <div class="demo-dialog__content">
          <p>${message}</p>
          <button>Close</button>
        </div>
      </div>
    </div>
  `
  const parser = new DOMParser()
  const dialog = parser.parseFromString(htmlString, 'text/html').body.firstChild

  if (dialog instanceof HTMLElement) {
    const dismissButton = dialog.querySelector('button')
    if (!(dismissButton instanceof HTMLButtonElement)) {
      throw new Error()
    }
    return { dialog, dismissButton }
  } else {
    throw new Error('Could not create error dialog')
  }
}

export function showErrorDialog(options: ErrorDialogOptions) {
  const { dialog, dismissButton } = createErrorDialog(options)
  document.body.appendChild(dialog)
  const handleDismiss = () => {
    document.body.removeChild(dialog)
    dismissButton.removeEventListener('click', handleDismiss)
  }
  dismissButton.addEventListener('click', handleDismiss)
}
