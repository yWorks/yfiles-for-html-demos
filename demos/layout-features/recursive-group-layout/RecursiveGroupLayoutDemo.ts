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
  HierarchicalLayout,
  OrganicLayout,
  RadialLayout,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Initialize the recursive group layout algorithm
const recursiveGroupLayout = new RecursiveGroupLayout({
  // Use a core layout algorithm to arrange the top-level hierarchy
  coreLayout: new HierarchicalLayout()
})

// Use layout data object to specify item-individual settings
const recursiveGroupLayoutData = new RecursiveGroupLayoutData({
  groupNodeLayouts: (groupNode) => {
    // Assign a layout algorithm to each group node
    switch (groupNode.tag) {
      case 'Group 1':
        return new HierarchicalLayout()
      case 'Group 2':
        return new OrganicLayout({ defaultMinimumNodeDistance: 75 })
      case 'Group 3':
        return new RadialLayout()
      case 'Group 4':
        // Do not lay out the children of group 4 since they have predefined layout values
        return RecursiveGroupLayout.FIX_CONTENT_LAYOUT
      default:
        // Layout with the core layout algorithm
        return RecursiveGroupLayout.NON_RECURSIVE_LAYOUT
    }
  }
})

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured recursive group layout
void graphComponent.applyLayoutAnimated(recursiveGroupLayout, 0, recursiveGroupLayoutData)
