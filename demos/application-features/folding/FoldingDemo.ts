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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  FoldingManager,
  GraphEditorInputMode,
  GroupNodeStyle,
  HierarchicalLayout,
  NodeAlignmentPolicy
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

// Set up the default style for group nodes
graphComponent.graph.groupNodeDefaults.style = new GroupNodeStyle({
  groupIcon: 'chevron-down',
  folderIcon: 'chevron-up',
  iconBackgroundShape: 'circle',
  cssClass: `group-node`
})

// Build demo graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Enable folding with the original graph as "masterGraph"
const foldingManager = new FoldingManager(graphComponent.graph)
graphComponent.graph = foldingManager.createFoldingView().graph

// Do an initial layout
await graphComponent.applyLayoutAnimated(new HierarchicalLayout({ minimumLayerDistance: 35 }), 0)

// Enable graph editing
const graphEditorInputMode = new GraphEditorInputMode()
graphComponent.inputMode = graphEditorInputMode

// Toggle whether to fix the group node location when collapsing/expanding groups
demoApp.toolbar.addToggleButton('Automatic Group Node Alignment', (pressed) => {
  graphEditorInputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = pressed
    ? NodeAlignmentPolicy.TOP_RIGHT // Fix the top right location of a group node when toggling collapse/expand
    : NodeAlignmentPolicy.NONE // Do not fix any specific point
})

// Enable undo only after the initial graph was created and laid out
// since we don't want to allow undoing that
foldingManager.masterGraph.undoEngineEnabled = true
