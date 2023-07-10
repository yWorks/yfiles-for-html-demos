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
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { EdgesSource, GraphBuilder, NodesSource } from 'yfiles'

type NodeLayoutData = {
  id: string
  layout: {
    x: number
    y: number
    width: number
    height: number
  }
}
type EdgeLayoutData = {
  sourceId: string
  targetId: string
  bends: [{ x: number; y: number }, { x: number; y: number }]
}

export function configureNodeLayoutWithProvider(
  graphBuilder: GraphBuilder
): NodesSource<NodeLayoutData> {
  const nodeData: NodeLayoutData[] = [
    {
      id: '00',
      layout: { x: 110, y: 20, width: 30, height: 30 }
    },
    {
      id: '01',
      layout: { x: 145, y: 95, width: 30, height: 30 }
    },
    {
      id: '02',
      layout: { x: 75, y: 95, width: 30, height: 30 }
    }
  ]

  // create the node using the id property
  const nodeSource = graphBuilder.createNodesSource(nodeData, 'id')
  // configure the layout provider that returns the layout information
  nodeSource.nodeCreator.layoutProvider = data => data.layout

  return nodeSource
}

export function configureBends(
  graphBuilder: GraphBuilder
): EdgesSource<EdgeLayoutData> {
  const edgeData: EdgeLayoutData[] = [
    {
      sourceId: '00',
      targetId: '01',
      bends: [
        { x: 125, y: 68 },
        { x: 160, y: 68 }
      ]
    },
    {
      sourceId: '00',
      targetId: '02',
      bends: [
        { x: 125, y: 68 },
        { x: 90, y: 68 }
      ]
    }
  ]

  // create the edges using the sourceId/targetId
  const edgeSources = graphBuilder.createEdgesSource(
    edgeData,
    'sourceId',
    'targetId',
    'id'
  )
  // configure the bend provider to return the location of each bend point
  edgeSources.edgeCreator.bendsProvider = data => data.bends
  return edgeSources
}

export function configureNodeLayoutWithBinding(
  graphBuilder: GraphBuilder
): NodesSource<{ id: string; locationY: number }> {
  const nodeData: { id: string; locationY: number }[] = [
    { id: '03', locationY: 20 },
    { id: '04', locationY: 95 }
  ]
  // create the node using the id property
  const nodeSources = graphBuilder.createNodesSource(nodeData, 'id')

  // create some binding for the x, y, width and height properties of the layout
  nodeSources.nodeCreator.layoutBindings.addBinding('x', () => 250)
  nodeSources.nodeCreator.layoutBindings.addBinding('y', data => data.locationY)
  nodeSources.nodeCreator.layoutBindings.addBinding('width', () => 50)
  nodeSources.nodeCreator.layoutBindings.addBinding('height', () => 30)

  return nodeSources
}
