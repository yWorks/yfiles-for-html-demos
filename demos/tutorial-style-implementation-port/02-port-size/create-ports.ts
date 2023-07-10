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
import { FreeNodePortLocationModel, type IGraph, type INode } from 'yfiles'
import { CustomPortStyle } from './CustomPortStyle'

export function createNodesAndPorts(graph: IGraph): void {
  const node1 = graph.createNode()
  const node2 = graph.createNodeAt([100, 150])
  createPorts(node1, graph)
  createPorts(node2, graph)
  graph.createEdge(node1.ports.get(2), node2.ports.get(3))
  graph.createEdge(node2.ports.get(1), node1.ports.get(4))
}

function createPorts(owner: INode, graph: IGraph): void {
  const defaultPortStyle = new CustomPortStyle()
  const largePortStyle = new CustomPortStyle(10)
  const smallPortStyle = new CustomPortStyle(4)

  graph.addPort({
    owner: owner,
    locationParameter: FreeNodePortLocationModel.NODE_CENTER_ANCHORED,
    style: smallPortStyle
  })
  graph.addPort({
    owner: owner,
    locationParameter: FreeNodePortLocationModel.NODE_TOP_ANCHORED,
    style: largePortStyle
  })
  graph.addPort({
    owner: owner,
    locationParameter: FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
    style: largePortStyle
  })
  graph.addPort({
    owner: owner,
    locationParameter: FreeNodePortLocationModel.NODE_LEFT_ANCHORED,
    style: defaultPortStyle
  })
  graph.addPort({
    owner: owner,
    locationParameter: FreeNodePortLocationModel.NODE_RIGHT_ANCHORED,
    style: defaultPortStyle
  })
}
