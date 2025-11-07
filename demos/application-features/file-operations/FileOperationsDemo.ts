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
import {
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  License
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { downloadFile, getFileExtension, openFile } from '@yfiles/demo-utils/file-support'
import { openInWindow } from '@yfiles/demo-utils/open-in-window'
import { openStorageItem, saveStorageItem } from './storage-support'
import { readGraphML, writeGraphML } from '@yfiles/demo-utils/graphml-support'
import { readJSON, writeJSON } from './json-support'
import sampleData from './file-operations-sample.json?raw'

const storageKey = 'graph-file-operations-demo.graphml'

async function run(): Promise<void> {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')
  /// Enable folding since users might load GraphML files with folder nodes
  const foldingManager = new FoldingManager()
  graphComponent.graph = foldingManager.createFoldingView().graph

  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  graphComponent.inputMode = new GraphEditorInputMode()

  createSampleGraph(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graphComponent: GraphComponent): void {
  readJSON(graphComponent, sampleData)

  void graphComponent.fitGraphBounds()
}

/**
 * Adds event listeners to the demo's input elements.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document
    .querySelector<HTMLButtonElement>('#open-file-button')!
    .addEventListener('click', async () => {
      try {
        const { content, filename } = await openFile('.graphml,.json')
        const fileExtension = getFileExtension(filename)
        switch (fileExtension?.toLowerCase()) {
          case 'graphml':
            await readGraphML(graphComponent, content)
            return
          case 'json':
            readJSON(graphComponent, content)
            return
          default:
            alert(`This demo cannot open files of type ${fileExtension}.`)
        }
      } catch (err) {
        if (err !== 'canceled') {
          alert(err)
        }
      }
    })

  const getSaveFormat = (): string =>
    document.querySelector<HTMLSelectElement>('#file-format-select')!.selectedOptions.item(0)
      ?.value ?? 'json'

  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    const saveFormat = getSaveFormat()
    const text: string =
      saveFormat === 'graphml' ? await writeGraphML(graphComponent) : writeJSON(graphComponent)
    try {
      downloadFile(text, `file-operations-graph.${saveFormat}`)
    } catch (err) {
      alert(err)
    }
  })

  document
    .querySelector<HTMLInputElement>('#show-in-window-button')!
    .addEventListener('click', async () => {
      const saveFormat = getSaveFormat()
      const text: string =
        saveFormat === 'graphml' ? await writeGraphML(graphComponent) : writeJSON(graphComponent)
      openInWindow(`<pre>${text.replaceAll('<', '&lt;')}</pre>`, `File content (${saveFormat})`)
    })

  document
    .querySelector<HTMLInputElement>('#open-storage-button')!
    .addEventListener('click', async () => {
      try {
        const graphMLText = openStorageItem(storageKey)
        await readGraphML(graphComponent, graphMLText)
      } catch (err) {
        alert(err)
      }
    })

  document
    .querySelector<HTMLInputElement>('#save-storage-button')!
    .addEventListener('click', async () => {
      try {
        const result = await new GraphMLIOHandler().write(graphComponent.graph)
        await saveStorageItem(storageKey, result)
        document.querySelector<HTMLInputElement>('#open-storage-button')!.disabled = false
      } catch (err) {
        alert(err)
      }
    })
}

void run().then(finishLoading)
