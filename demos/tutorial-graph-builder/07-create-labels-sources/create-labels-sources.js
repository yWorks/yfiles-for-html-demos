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
import { InteriorLabelModel } from 'yfiles'

/**
 * @param {!GraphBuilder} graphBuilder
 */
export function createNodeLabelsWithBinding(graphBuilder) {
  const nodeData = [
    { id: '0', name: 'Investment Capital' },
    { id: '1', name: 'Melissa Barner' }
  ]
  const nodesSource = graphBuilder.createNodesSource(nodeData, 'id')

  // create the label binding to the name property
  nodesSource.nodeCreator.createLabelBinding(data => data.name)
}
/**
 * @param {!GraphBuilder} graphBuilder
 */
export function createNodeLabelsWithProvider(graphBuilder) {
  const nodeData = [{ id: '2', name: 'Monster Inc' }]
  const nodesSource = graphBuilder.createNodesSource(nodeData, 'id')

  // create the text provider that will return the name of each node
  const labelCreator = nodesSource.nodeCreator.createLabelBinding()
  labelCreator.textProvider = data => data.name.toUpperCase()
}
/**
 * @param {!GraphBuilder} graphBuilder
 */
export function createNodeLabelsWithSources(graphBuilder) {
  const nodeData = [
    { id: '3', owners: ['Local Group', 'Germany'] },
    { id: '4', owners: ['International Group'] }
  ]
  const nodesSource = graphBuilder.createNodesSource(nodeData, 'id')

  // create the label sources based on the `owners` property
  const labelsSource = nodesSource.nodeCreator.createLabelsSource(data => data.owners)
  labelsSource.labelCreator.layoutParameterProvider = data =>
    data.endsWith('Group') ? InteriorLabelModel.CENTER : InteriorLabelModel.SOUTH
}
/**
 * @param {!GraphBuilder} graphBuilder
 */
export function createEdgeLabelsWithProvider(graphBuilder) {
  const edgeData = [
    {
      id: '0',
      sourceId: '1',
      targetId: '0',
      ownership: 30
    },
    {
      id: '1',
      sourceId: '0',
      targetId: '2',
      ownership: 60
    },
    { id: '2', sourceId: '4', targetId: '0', ownership: 5 },
    { id: '3', sourceId: '3', targetId: '0', ownership: 5 }
  ]
  const edgesSource = graphBuilder.createEdgesSource(edgeData, 'sourceId', 'targetId', 'id')

  // bind the label text data and add some more text information
  edgesSource.edgeCreator.createLabelBinding(data => `Owns ${data.ownership}%`)
}
