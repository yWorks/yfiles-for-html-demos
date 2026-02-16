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
import { GraphBuilder, Point } from '@yfiles/yfiles'
import { getDefaultWriterOptions, toJSON } from '@yfiles/demo-utils/json-writer'
import { deserializeLabelModelParameter } from '@yfiles/demo-utils/label-model-serialization'

/**
 * This file provides functions to read and write a graph to a JSON string.
 * The JSON is expected to conform to the structure outlined by {@link JSONGraph}.
 * {@link readJSON Reading} is done by a properly configured {@link GraphBuilder},
 * {@link writeJSON writing} is backed by the {@link toJSON} function.
 */

/**
 * Reads a graph from the given JSON {@link text} and sets it to the given {@link graphComponent}.
 * The JSON is expected to conform to the structure outlined by {@link JSONGraph}.
 *
 * @yjs:keep = nodeList,edgeList,id,source,target,sourcePort,targetPort,bends,labels
 */
export function readJSON(graphComponent, text) {
  try {
    const data = JSON.parse(text)

    graphComponent.graph.clear()
    const graphBuilder = new GraphBuilder(graphComponent.graph)
    const nodesSource = graphBuilder.createNodesSource({
      data: data.nodeList.filter((item) => item.isGroup !== true),
      id: (item) => item.id,
      parentId: (item) => item.parentId,
      layout: (item) => item.layout
    })
    const nodeLabelSource = nodesSource.nodeCreator.createLabelsSource({
      data: (data) => data.labels || [],
      text: (data) => data.text
    })
    nodeLabelSource.labelCreator.layoutParameterProvider = (labelObject) =>
      labelObject.layoutParameter != null
        ? deserializeLabelModelParameter(labelObject.layoutParameter)
        : undefined

    const groupNodesSource = graphBuilder.createGroupNodesSource({
      data: data.nodeList.filter((item) => item.isGroup === true),
      id: (item) => item.id,
      parentId: (item) => item.parentId,
      layout: (item) => item.layout
    })
    const groupNodeLabelSource = groupNodesSource.nodeCreator.createLabelsSource({
      data: (data) => data.labels || [],
      text: (data) => data.text
    })
    groupNodeLabelSource.labelCreator.layoutParameterProvider = (labelObject) =>
      labelObject.layoutParameter != null
        ? deserializeLabelModelParameter(labelObject.layoutParameter)
        : undefined

    const { edgeCreator } = graphBuilder.createEdgesSource(
      data.edgeList,
      (item) => item.source,
      (item) => item.target
    )
    const edgeLabelSource = edgeCreator.createLabelsSource({
      data: (data) => data.labels || [],
      text: (data) => data.text
    })
    edgeLabelSource.labelCreator.layoutParameterProvider = (labelObject) =>
      labelObject.layoutParameter != null
        ? deserializeLabelModelParameter(labelObject.layoutParameter)
        : undefined
    edgeCreator.bendsProvider = (item) => item.bends

    edgeCreator.addEventListener('edge-created', (evt) => {
      const dataItem = evt.dataItem
      if (dataItem.sourcePort) {
        evt.graph.setPortLocation(evt.item.sourcePort, Point.from(dataItem.sourcePort))
      }
      if (dataItem.targetPort) {
        evt.graph.setPortLocation(evt.item.targetPort, Point.from(dataItem.targetPort))
      }
    })

    graphBuilder.buildGraph()
    void graphComponent.fitGraphBounds()
  } catch (err) {
    alert(`Error parsing JSON. Cause: ${err.message}`)
  }
}

/**
 * Writes the graph of the given {@link graphComponent} to text.
 */
export function writeJSON(graphComponent) {
  try {
    const writerOptions = getDefaultWriterOptions()
    return JSON.stringify(toJSON(graphComponent.graph, writerOptions), null, 2)
  } catch (err) {
    alert(`Error writing JSON. Cause: ${err.message}`)
  }
  return ''
}
