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
import { createCodemirrorEditor, EditorView } from '@yfiles/demo-resources/codemirror-editor'

let container
let sourceDataView

/**
 * Initializes a data view in the element with the given selector.
 * The data view displays JSON data in a CodeMirror editor.
 */
function initDataView(selector) {
  container = document.querySelector(selector)
  const header = document.createElement('div')
  const dataContainer = document.createElement('div')

  container.appendChild(header)
  container.appendChild(dataContainer)

  container.setAttribute('class', 'demo-overlay')
  dataContainer.setAttribute('class', 'data-container')
  header.setAttribute('class', 'demo-overlay__header')

  header.textContent = 'Source Data'

  header.addEventListener('click', () => {
    container.classList.toggle('collapsed')
  })
  sourceDataView = createCodemirrorEditor('js', container, [EditorView.editable.of(false)])
}

/**
 * Updates the data view with the given data.
 * @param nodesSource An object or JSON string that contains the nodes data.
 * @param groupsSource An object or JSON string that contains the groups data.
 * @param edgesSource An object or JSON string that contains the edges data.
 */
function updateDataView(nodesSource, groupsSource, edgesSource) {
  if (sourceDataView) {
    const nodesData = stringifyData(nodesSource)
    const groupsData = stringifyData(groupsSource)
    const edgesData = stringifyData(edgesSource)

    let editorData = `// nodes source:\n${nodesData}`
    if (groupsData) {
      editorData += `\n\n// groups source:\n${groupsData}`
    }
    if (edgesData) {
      editorData += `\n\n// edges source:\n${edgesData}`
    }

    sourceDataView.dispatch({
      changes: { from: 0, to: sourceDataView.state.doc.length, insert: editorData }
    })
  }
}

function stringifyData(data) {
  const t = typeof data
  return t === 'undefined' ? '' : t === 'string' ? data : JSON.stringify(data, null, 2)
}

export { initDataView, updateDataView }
