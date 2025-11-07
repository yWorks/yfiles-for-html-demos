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
import { GraphComponent, License, Size, TextWrapping } from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import {
  enableGraphEditing,
  fitGraphBounds,
  initializeLabelModel,
  initializeTutorialDefaults
} from '../common'
import { CustomLabelStyle } from './CustomLabelStyle'

import { finishLoading } from '@yfiles/demo-app/demo-page'

License.value = licenseData

const graphComponent = new GraphComponent('#graphComponent')

initializeTutorialDefaults(graphComponent)
initializeLabelModel(graphComponent)

const graph = graphComponent.graph
graph.nodeDefaults.labels.style = new CustomLabelStyle()
graph.edgeDefaults.labels.style = new CustomLabelStyle()

graph.createNode({
  layout: [60, -125, 30, 30],
  labels: [
    {
      text: 'This label has no line wrapping and will grow as large as necessary',
      style: new CustomLabelStyle()
    }
  ]
})
graph.createNode({
  layout: [0, 0, 30, 30],
  labels: [
    {
      text: 'This label wraps at characters',
      style: new CustomLabelStyle(TextWrapping.WRAP_CHARACTER, new Size(80, 60))
    }
  ]
})
graph.createNode({
  layout: [120, 0, 30, 30],
  labels: [
    {
      text: 'This label wraps at words',
      style: new CustomLabelStyle(TextWrapping.WRAP_WORD, new Size(80, 60))
    }
  ]
})
graph.createNode({
  layout: [0, 150, 30, 30],
  labels: [
    {
      text: 'Character wrapping with ellipsis. More text is cropped at some point.',
      style: new CustomLabelStyle(TextWrapping.WRAP_CHARACTER_ELLIPSIS, new Size(100, 60))
    }
  ]
})
graph.createNode({
  layout: [120, 150, 30, 30],
  labels: [
    {
      text: 'Word wrapping with ellipsis. More text is cropped at some point.',
      style: new CustomLabelStyle(TextWrapping.WRAP_WORD_ELLIPSIS, new Size(100, 60))
    }
  ]
})

enableGraphEditing(graphComponent)

await fitGraphBounds(graphComponent)

finishLoading()
