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
import { GraphComponent, License } from '@yfiles/yfiles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import {
  BoundsVisual,
  createSampleGraphGetBounds,
  enableGraphEditing,
  fitGraphBounds,
  initializeInlineGraphComponent,
  initializeLabelModelHitTest,
  initializeTutorialDefaults
} from '../common'
import { CustomLabelStyle } from './CustomLabelStyle'
import { CustomLabelStyle as OldCustomLabelStyle } from '../09-hit-testing/CustomLabelStyle'

import { finishLoading } from '@yfiles/demo-resources/demo-page'

License.value = await fetchLicense()

const graphComponent = new GraphComponent('#graphComponent')

initializeTutorialDefaults(graphComponent)
initializeLabelModelHitTest(graphComponent)
graphComponent.renderTree.createElement(
  graphComponent.renderTree.inputModeGroup,
  new BoundsVisual()
)

const graph = graphComponent.graph
graph.nodeDefaults.labels.style = new CustomLabelStyle()
graph.edgeDefaults.labels.style = new CustomLabelStyle()

createSampleGraphGetBounds(graphComponent.graph)

enableGraphEditing(graphComponent)

// Inline old state
const oldState = initializeInlineGraphComponent('#old-state')
initializeLabelModelHitTest(oldState)
oldState.graph.nodeDefaults.labels.style = new OldCustomLabelStyle()
oldState.graph.edgeDefaults.labels.style = new OldCustomLabelStyle()
oldState.renderTree.createElement(
  oldState.renderTree.inputModeGroup,
  new BoundsVisual()
)

createSampleGraphGetBounds(oldState.graph)

await fitGraphBounds(graphComponent)
await fitGraphBounds(oldState)

finishLoading()
