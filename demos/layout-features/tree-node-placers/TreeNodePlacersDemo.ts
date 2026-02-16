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
  DoubleLayerSubtreePlacer,
  LeftRightSubtreePlacer,
  LevelAlignedSubtreePlacer,
  TreeLayout,
  TreeLayoutData
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Use layout data object to specify item-individual settings
const treeLayoutData = new TreeLayoutData({
  // Assign a subtree placer depending on the number stored in the node's tag
  subtreePlacers: (node) => {
    switch (node.tag) {
      case 1:
        // Place child nodes with the same depth in the tree in the same horizontal layer
        return new LevelAlignedSubtreePlacer()
      case 2:
        // Place child nodes left and right of a single vertical bus
        return new LeftRightSubtreePlacer()
      case 6:
        // Places child nodes in two horizontal lines
        return new DoubleLayerSubtreePlacer()
      default:
        return null
    }
  }
})

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured tree layout
void graphComponent.applyLayoutAnimated(new TreeLayout(), 0, treeLayoutData)
