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
import { GraphComponent, GraphEditorInputMode, License } from '@yfiles/yfiles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import {
  addButtonListener,
  configureInteraction,
  createSampleGraph,
  fitGraphBounds,
  initializeTutorialDefaults,
  setDefaultLabelLayoutParameters
} from '../common'
import { clearUndoQueue, enableUndo, redo, undo } from './undo-clipboard-support'
License.value = await fetchLicense()
const graphComponent = new GraphComponent('#graphComponent')
initializeTutorialDefaults(graphComponent)
setDefaultLabelLayoutParameters(graphComponent.graph)
createSampleGraph(graphComponent.graph)
configureInteraction(graphComponent)
enableUndo(graphComponent.graph)
fitGraphBounds(graphComponent)
finishLoading()
addButtonListener('#undoButton', () => undo(graphComponent.graph))
addButtonListener('#redoButton', () => redo(graphComponent.graph))
addButtonListener('#clearUndoQueueButton', () => clearUndoQueue(graphComponent.graph))
const inputMode = graphComponent.inputMode
addButtonListener('#cutButton', () => inputMode.cut())
addButtonListener('#copyButton', () => inputMode.copy())
addButtonListener('#pasteButton', () => inputMode.paste())
addButtonListener('#duplicateButton', () => inputMode.duplicateSelection())
