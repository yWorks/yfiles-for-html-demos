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
import { createCodemirrorEditor, type EditorView } from '@yfiles/demo-app/codemirror-editor'

let editor: EditorView

/**
 * Initializes a data view in the element with the given selector.
 * The data view displays a CSS Stylesheet in a CodeMirror editor.
 */
export async function createStylesheetView(selector: string): Promise<void> {
  const container = document.querySelector(selector)!
  const dataContainer = document.createElement('div')

  container.appendChild(dataContainer)

  dataContainer.setAttribute('class', 'data-container')

  editor = createCodemirrorEditor('css', dataContainer)
  let stylesheet = await fetchStylesheet()

  // remove the @license doc comment from the css file
  stylesheet = stylesheet.replace(/\/\*{2,}.*@license.*\*{2,}\/(\n|\r\n)/s, '')

  editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: stylesheet } })
}

/**
 * Fetches the raw stylesheet data to display it in the demo.
 */
async function fetchStylesheet(): Promise<string> {
  const stylesheetUrl = './graph-item-styles.css'
  try {
    const response = await fetch(stylesheetUrl, { headers: { Accept: 'text/css' } })
    if (response.ok) {
      return response.text()
    } else {
      return Promise.resolve(`Could not fetch ${stylesheetUrl}`)
    }
  } catch (e) {
    return Promise.resolve(`Could not fetch ${stylesheetUrl}.\n${e}`)
  }
}

/**
 * Replaces the stylesheet for the item styles with the current content of the editor.
 */
export function replaceStylesheet(): void {
  removeStylesheet()
  addStylesheet()
}

/**
 * Removes the user stylesheet from the document.
 */
export function removeStylesheet(): void {
  const head = document.head
  const currentStylesheets = head.querySelectorAll('[data-item-styles]')
  for (const el of currentStylesheets) {
    head.removeChild(el)
  }
}

/**
 * Adds the contents of the CSS editor as a stylesheet in the document.
 */
export function addStylesheet(): void {
  const head = document.head
  const newStylesheet = document.createElement('style')
  newStylesheet.setAttribute('data-item-styles', '')
  newStylesheet.textContent = editor.state.doc.toString()
  head.appendChild(newStylesheet)
}
