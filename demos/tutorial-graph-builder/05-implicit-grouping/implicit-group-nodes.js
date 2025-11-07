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
import { GroupNodeStyle, InteriorNodeLabelModel, Size } from '@yfiles/yfiles'
import { edgeData, nodeData } from './group-data'

export function createGroupNodes(graphBuilder) {
  // Create the initial set of nodes that correspond to the top level entries in the NodeData array
  const idProvider = (item) => item.id
  const nodesSource = graphBuilder.createNodesSource({ data: nodeData, id: idProvider })
  nodesSource.nodeCreator.defaults.labels.layoutParameter = InteriorNodeLabelModel.TOP
  nodesSource.nodeCreator.defaults.size = new Size(60, 40)

  // Describe how to create the first level of groups from the items in the NodeData
  const parentsSource = nodesSource.createParentNodesSource((item) => item.path)
  parentsSource.nodeCreator.createLabelBinding((data) => data)

  // Describe how to navigate higher up in the hierarchy
  const parentDataProvider = (path) => {
    const separator = path.lastIndexOf('/')
    return separator === 0 ? null : path.substring(0, separator)
  }
  const ancestorSource = parentsSource.createParentNodesSource(parentDataProvider)
  // Enable recursive processing higher up in the container hierarchy
  ancestorSource.addParentNodesSource(parentDataProvider, ancestorSource)
  ancestorSource.nodeCreator.createLabelBinding((data) => data)

  // Enable processing of the contents of the nodes in the NodeData
  const childDataProvider = (item) => item.children ?? []
  const childNodesSource = nodesSource.createChildNodesSource(childDataProvider, idProvider)
  // Enable processing of the contents of the child nodes
  const descendantsSource = childNodesSource.createChildNodesSource(childDataProvider, idProvider)
  // Enable recursive processing of the contents
  descendantsSource.addChildNodesSource(childDataProvider, descendantsSource)

  // Declare edges between all different kinds of entities
  graphBuilder.createEdgesSource({
    data: edgeData,
    sourceId: (item) => item.from,
    targetId: (item) => item.to
  })

  // Styling for the group nodes
  const graph = graphBuilder.graph

  // We style the different levels differently
  // the "path" containers are pale blue
  parentsSource.nodeCreator.defaults.style = new GroupNodeStyle({
    tabFill: '#9dc6d0',
    contentAreaPadding: 10
  })

  // whereas the entities in the NodeData and all other group nodes have their respective
  // default styles
  childNodesSource.nodeCreator.styleProvider =
    descendantsSource.nodeCreator.styleProvider =
    nodesSource.nodeCreator.styleProvider =
      // Since the NodeData and all the ChildNodes can possibly be either group nodes
      // or normal nodes, styling should be done via a style provider
      (item) =>
        item.children && item.children.length > 0
          ? graph.groupNodeDefaults.style
          : graph.nodeDefaults.style
}
