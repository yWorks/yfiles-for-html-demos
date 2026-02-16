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
import {
  GraphBuilder,
  GraphComponent,
  License,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { getData, runLayout } from '../common'
import {
  configureEdgeStylesWithProvider,
  configureStylesWithBinding,
  configureStylesWithDefaults,
  configureStylesWithProvider,
  type Data
} from './configure-styles'

License.value = licenseData

const graphComponent = new GraphComponent('#graphComponent')
const graph = graphComponent.graph
graph.nodeDefaults.style = new ShapeNodeStyle({ shape: 'triangle' })

const data = await getData<Data>()

const graphBuilder = new GraphBuilder(graph)

const nodesSource = graphBuilder.createNodesSource(data.nodesSource, 'id')
nodesSource.nodeCreator.createLabelBinding('name')

configureStylesWithDefaults(nodesSource)
configureStylesWithBinding(nodesSource)
configureStylesWithProvider(nodesSource)

const edgesSource = graphBuilder.createEdgesSource(
  data.edgesSource,
  'sourceId',
  'targetId',
  'id'
)
configureEdgeStylesWithProvider(edgesSource)

graphBuilder.buildGraph()

void runLayout(graphComponent)

finishLoading()
