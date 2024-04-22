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
import { GraphComponent, License } from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'
import {
  enableGraphEditing,
  fitGraphBounds,
  initializeLabelModel,
  initializeTutorialDefaults
} from '../common'
import { CustomLabelStyle } from './CustomLabelStyle'

import { finishLoading } from 'demo-resources/demo-page'

License.value = await fetchLicense()

const graphComponent = new GraphComponent('#graphComponent')

initializeTutorialDefaults(graphComponent)
initializeLabelModel(graphComponent)

graphComponent.graph.nodeDefaults.labels.style = new CustomLabelStyle()
graphComponent.graph.edgeDefaults.labels.style = new CustomLabelStyle()

const d = 120
graphComponent.graph.createNode({
  layout: [0, 0, 30, 30],
  labels: [{ text: 'Top Left', style: new CustomLabelStyle('start', 'top') }]
})
graphComponent.graph.createNode({
  layout: [d, 0, 30, 30],
  labels: [{ text: 'Top Center', style: new CustomLabelStyle('middle', 'top') }]
})
graphComponent.graph.createNode({
  layout: [2 * d, 0, 30, 30],
  labels: [{ text: 'Top Right', style: new CustomLabelStyle('end', 'top') }]
})
graphComponent.graph.createNode({
  layout: [0, d, 30, 30],
  labels: [
    { text: 'Center Left', style: new CustomLabelStyle('start', 'center') }
  ]
})
graphComponent.graph.createNode({
  layout: [d, d, 30, 30],
  labels: [
    { text: 'Centered', style: new CustomLabelStyle('middle', 'center') }
  ]
})
graphComponent.graph.createNode({
  layout: [2 * d, d, 30, 30],
  labels: [
    { text: 'Center Right', style: new CustomLabelStyle('end', 'center') }
  ]
})
graphComponent.graph.createNode({
  layout: [0, 2 * d, 30, 30],
  labels: [
    { text: 'Bottom Left', style: new CustomLabelStyle('start', 'bottom') }
  ]
})
graphComponent.graph.createNode({
  layout: [d, 2 * d, 30, 30],
  labels: [
    { text: 'Bottom Center', style: new CustomLabelStyle('middle', 'bottom') }
  ]
})
graphComponent.graph.createNode({
  layout: [2 * d, 2 * d, 30, 30],
  labels: [
    { text: 'Bottom Right', style: new CustomLabelStyle('end', 'bottom') }
  ]
})

enableGraphEditing(graphComponent)

fitGraphBounds(graphComponent)

finishLoading()
