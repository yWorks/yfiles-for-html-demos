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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import { GraphEditorInputMode, HierarchicalLayout } from '@yfiles/yfiles'
import { CustomContextMenuIcons } from './CustomContextMenuIcons'
import graphData from './graph-data.json'

// Create a default editor input mode
const inputMode = new GraphEditorInputMode()
graphComponent.inputMode = inputMode

// Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
inputMode.addEventListener('populate-item-context-menu', (evt) => {
  if (evt.handled) {
    return
  }

  // Create the context menu items
  if (graphComponent.selection.nodes.size > 0) {
    evt.contextMenu = [
      { label: 'Cut', action: () => inputMode.cut(), icon: `url("${CustomContextMenuIcons.cut}")` },
      {
        label: 'Copy',
        action: () => inputMode.copy(),
        icon: `url("${CustomContextMenuIcons.copy}")`
      },
      {
        label: 'Delete',
        action: () => inputMode.deleteSelection(),
        icon: `url("${CustomContextMenuIcons.delete}")`
      }
    ]
  } else {
    // No node has been hit
    evt.contextMenu = [
      { label: 'Select all', action: () => inputMode.selectAll() },
      {
        label: 'Paste',
        action: () => inputMode.pasteAtLocation(evt.queryLocation),
        icon: `url("${CustomContextMenuIcons.paste}")`,
        disabled: graphComponent.clipboard.isEmpty
      }
    ]
  }
})

demoApp.buildGraphFromJson(graphData)

await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), '0s')
