/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  GraphComponent,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutNodeLayoutDescriptor,
  INode,
  LayoutExecutor,
  MinimumNodeSizeStage
} from 'yfiles'

/**
 * Calculates and animates a hierarchic layout.
 */
export async function runLayout(graphComponent: GraphComponent): Promise<void> {
  Class.ensure(LayoutExecutor)

  const hierarchicLayout = new HierarchicLayout()

  // Configure the layout data using the information from the node labels
  const hierarchicLayoutData = new HierarchicLayoutData({
    nodeLayoutDescriptors: (
      node: INode
    ): HierarchicLayoutNodeLayoutDescriptor =>
      new HierarchicLayoutNodeLayoutDescriptor({
        // Set the alignment of the node based on the label
        layerAlignment: getAlignment(node)
      })
  })

  await graphComponent.morphLayout({
    layout: new MinimumNodeSizeStage(hierarchicLayout),
    layoutData: hierarchicLayoutData,
    morphDuration: '1s',
    easedAnimation: true
  })
}

/**
 * Returns the alignment value based on the data stored in the given node's label.
 */
function getAlignment(node: INode): number {
  const text = node.labels.at(0)?.text?.toLowerCase() ?? 'center'
  switch (text) {
    default:
    case 'center':
      return 0.5
    case 'top':
      return 0.0
    case 'bottom':
      return 1.0
  }
}
