/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Class, GraphComponent, HierarchicLayout, LayoutExecutor, OrganicLayout } from 'yfiles'

/**
 * Calculates and applies a hierarchic layout.
 * @param {!GraphComponent} graphComponent
 */
export function applyLayout(graphComponent) {
  const graph = graphComponent.graph
  const layout = new HierarchicLayout()
  graph.applyLayout(layout)

  // Fit the graph bounds since they changed for the new layout
  graphComponent.fitGraphBounds()
}

/**
 * Calculates and animates an organic layout.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
export async function runLayout(graphComponent) {
  // Here, we reference and thus load the LayoutExecutor class from the 'view-layout-bridge' module
  // explicitly to prevent tree-shaking tools from removing the dependency.
  // This is needed for 'morphLayout' to work.
  Class.ensure(LayoutExecutor) // doing this somewhere in your code should suffice

  await graphComponent.morphLayout({
    layout: new OrganicLayout({ considerNodeSizes: true }),
    morphDuration: '1s',
    easedAnimation: true
  })
}
