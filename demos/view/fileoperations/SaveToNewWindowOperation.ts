/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export default class SaveToNewWindowOperation {
  /**
   * Checks if the operation can be executed.
   */
  isAvailable(): boolean {
    return true
  }

  /**
   * @return A Promise that resolves when the save operation is complete.
   */
  save(fileContent: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const newWindow = window.open()
      if (!newWindow) {
        reject(new Error('Could not open a new window. Maybe it was blocked by the browser.'))
        return
      }
      const newDocument = newWindow.document
      newDocument.open()
      if (!newDocument.documentElement) {
        newDocument.write('<html lang="en"></html>')
      }
      const elementsByTagName = newDocument.documentElement.getElementsByTagName('body')
      let body: HTMLElement
      if (elementsByTagName.length === 0) {
        body = newDocument.createElement('body')
        newDocument.documentElement.appendChild(body)
      } else {
        body = elementsByTagName.item(0)!
      }
      newDocument.title = 'GraphML Export'
      const pre = newDocument.createElement('pre')
      body.appendChild(pre)
      pre.textContent = fileContent
      newDocument.close()

      resolve()
    })
  }
}
