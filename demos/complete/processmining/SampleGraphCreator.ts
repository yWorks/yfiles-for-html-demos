/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import { HeatData } from './HeatData'
import { GraphBuilder, IGraph } from 'yfiles'
import { data } from './ProcessGraphData'

type ProcessStepTag = {
  capacity: number
  heat: HeatData
  duration: number
}
type ProcessTransitionTag = {
  capacity: number
  heat: HeatData
  probability: number
}

function createProcessStepTag(): ProcessStepTag {
  return {
    capacity: Math.random() * 30 + 1,
    heat: new HeatData(128, 0, 30),
    duration: Math.random() * 0.5
  }
}

function createProcessTransitionTag(): ProcessTransitionTag {
  return {
    capacity: Math.random() * 30 + 1,
    heat: new HeatData(128, 0, 30),
    probability: 1
  }
}

export function createSampleGraph(graph: IGraph): void {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id'
  }).nodeCreator.tagProvider = (dataItem): ProcessStepTag => ({
    ...createProcessStepTag(),
    ...dataItem
  })
  builder.createEdgesSource({
    data: data.edges,
    sourceId: 'source',
    targetId: 'target'
  }).edgeCreator.tagProvider = (dataItem): ProcessTransitionTag => ({
    ...createProcessTransitionTag(),
    ...dataItem
  })
  builder.buildGraph()
}
