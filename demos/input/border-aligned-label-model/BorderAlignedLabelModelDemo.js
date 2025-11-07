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
import { graphComponent } from '@yfiles/demo-app/init'
import { GraphEditorInputMode, Rect } from '@yfiles/yfiles'
import { BorderAlignedLabelModel } from './BorderAlignedLabelModel'

// Create the example graph
const graph = graphComponent.graph
const node1 = graph.createNode(new Rect(90, 90, 100, 100))
const node2 = graph.createNode(new Rect(250, 90, 100, 100))
await graphComponent.fitGraphBounds()

// Left node: add a border-aligned label with offset and without snapping candidates
const borderAlignedLabelModel = new BorderAlignedLabelModel()
borderAlignedLabelModel.candidateCount = 0
borderAlignedLabelModel.offset = 20
graph.addLabel(node1, 'Drag to Move', borderAlignedLabelModel.createParameter(0.88))

// Right node: add a border-aligned label with snapping candidates
graph.addLabel(node2, 'Drag To Snap', new BorderAlignedLabelModel().createParameter(0.25))

// Enable graph editing
graphComponent.inputMode = new GraphEditorInputMode()
