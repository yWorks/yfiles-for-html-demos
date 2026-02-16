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
import { graphComponent } from '@yfiles/demo-app/init'
import { ArcEdgeStyle, EdgePathLabelModel, GraphEditorInputMode } from '@yfiles/yfiles'
import { OffsetWrapperLabelModel } from './OffsetWrapperLabelModel'

// Create the example graph
const graph = graphComponent.graph
const node1 = graph.createNode([0, 0, 100, 100])
const node2 = graph.createNode([500, 0, 100, 100])
const edge = graph.createEdge(node1, node2, new ArcEdgeStyle({ height: 50 }))
await graphComponent.fitGraphBounds()

// Add reference labels with default parameter
const innerParameter = new EdgePathLabelModel({
  autoRotation: true,
  angle: 0
}).createRatioParameter(0.5)
graph.addLabel({ owner: edge, text: 'Reference', layoutParameter: innerParameter })

// Add offset labels with different offsets
graph.addLabel({
  owner: edge,
  text: 'Offset: 25',
  layoutParameter: new OffsetWrapperLabelModel(25).createParameter(innerParameter)
})
graph.addLabel({
  owner: edge,
  text: 'Offset:-25',
  layoutParameter: new OffsetWrapperLabelModel(-25).createParameter(innerParameter)
})

// Enable graph editing
graphComponent.inputMode = new GraphEditorInputMode()
