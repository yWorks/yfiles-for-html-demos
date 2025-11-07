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
import {} from '@yfiles/yfiles'
import { runAutoLayout, triggerGridDisplay } from '../utils/customTriggers'

export function initializeToolbar(graphComponent, grid) {
  const gridButton = document.querySelector('#grid-button')
  gridButton.addEventListener('click', () => triggerGridDisplay(graphComponent, grid))
  const undoEngine = graphComponent.graph.undoEngine

  const undoButton = document.querySelector("button[data-command='UNDO']")
  undoButton.addEventListener('click', () => {
    if (undoEngine.canUndo()) {
      undoEngine.undo()
    }
  })

  const redoButton = document.querySelector("button[data-command='REDO']")
  redoButton.addEventListener('click', () => {
    if (undoEngine.canRedo()) {
      undoEngine.redo()
    }
  })

  // add a listener to the undoEngine to enable/disable the buttons
  undoEngine.addEventListener('property-changed', () => {
    undoButton.disabled = !undoEngine.canUndo()
    undoButton.disabled = !undoEngine.canRedo()
  })

  const layoutButton = document.querySelector('#layoutButton')
  layoutButton.addEventListener('click', async () => runAutoLayout(graphComponent))
}
