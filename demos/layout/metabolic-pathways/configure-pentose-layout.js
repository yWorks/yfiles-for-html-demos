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
import {
  Bfs,
  ConstraintOrientation,
  Insets,
  OrganicLayout,
  OrganicLayoutData,
  ShortestPath,
  TraversalDirection
} from '@yfiles/yfiles'
import { getMetabolicData, getType, NodeTypes } from './data-types'
/**
 * Configures the organic layout and adds the needed constraints to handle the nodes that have to
 * be aligned horizontally or vertically.
 */
export function configurePentosePhosphateLayout(graphComponent) {
  // some basic configuration for the organic layout
  const organicLayout = new OrganicLayout({
    deterministic: true,
    defaultPreferredEdgeLength: 60,
    defaultMinimumNodeDistance: 10,
    avoidNodeEdgeOverlap: true
  })
  // create the layout data to assign different edge lengths for edges attached to enzymes
  // and to add node halos to reaction nodes
  const organicLayoutData = new OrganicLayoutData({
    preferredEdgeLengths: (edge) =>
      getType(edge.sourceNode) === NodeTypes.ENZYME || getType(edge.targetNode) === NodeTypes.ENZYME
        ? 5
        : 80,
    nodeMargins: (node) =>
      getType(node) === NodeTypes.REACTION ? new Insets(60, 60, 15, 15) : Insets.EMPTY
  })
  const graph = graphComponent.graph
  // determine and align vertically the main pathway which is defined by a node with in-degree zero
  // and a node which is marked with vAlign = end in its tag
  const reactionPath = alignReactionPath(graph, organicLayoutData)
  // determine the nodes that represent the reactions
  const reactions = graph.nodes.filter((node) => getType(node) === NodeTypes.REACTION).toArray()
  // place the nodes in layers
  const layers = placeNodesOnLayers(graph, reactions, organicLayoutData)
  // sort the reaction nodes based on their layer
  reactions.sort((n1, n2) => layers.get(n1) - layers.get(n2))
  // add the constraints for the co-reactant nodes to vertically align them and place them before
  // their associated reaction node
  addCoReactantConstraints(graph, organicLayoutData)
  // add the constraints for the enzymes to align them after their associated reaction
  addEnzymeConstraints(graph, organicLayoutData)
  // add the constraints for the reaction nodes to align them vertically on the main path
  addReactionConstraints(reactions, graph, reactionPath, organicLayoutData)
  // add the constraints to reaction nodes that contain more than two reactants
  addMultiProductReactionConstraints(reactions, graph, organicLayoutData)
  return { layout: organicLayout, layoutData: organicLayoutData }
}
/**
 * Defines the main reaction path and creates the constraints to vertically align the nodes on this path.
 * From the main path, reaction nodes that contain more than two reactants are excluded.
 */
function alignReactionPath(graph, organicLayoutData) {
  // calculate the shortest path
  const pathNodes = calculateMainReactionPath(graph)
  // exclude the reaction nodes that contain more than two reactants - these do not need to
  // be vertically aligned since they are attached to four nodes
  const excludeMultiProductReactions = pathNodes.filter(
    (node) => getType(node) !== NodeTypes.REACTION || !isMultipleProductReaction(graph, node)
  )
  // align the main path vertically and order its nodes based on their order in the path
  organicLayoutData.constraints.addAlignmentConstraint(ConstraintOrientation.VERTICAL, 0).source =
    excludeMultiProductReactions
  excludeMultiProductReactions.forEach((node, index) => {
    organicLayoutData.constraints
      .addOrderConstraint(ConstraintOrientation.VERTICAL)
      .mapper.set(node, index)
  })
  return pathNodes
}
/**
 * Places the nodes in layers using bfs and creates the constraints so that:
 * (i) nodes in the same layer are horizontally aligned,
 * (ii) nodes in consecutive layers are ordered based on their layer.
 */
function placeNodesOnLayers(graph, reactions, organicLayoutData) {
  // we apply a bfs to calculate the layers of the nodes
  const firstBfs = calculateLayers(graph)
  // Since we want the products/reactants to be placed below their corresponding reaction,
  // we check whether there exist reactions that contain multiple reactants, and if yes,
  // for this reaction we consider only the edges that connect to the product with the maximum layer
  const excludeEdges = []
  reactions
    .filter((reaction) => isMultipleProductReaction(graph, reaction))
    .forEach((reaction) => {
      // get the edges attached to product/reactant nodes
      const productEdges = graph
        .inEdgesAt(reaction)
        .filter((edge) => isProductOrReactant(edge.sourceNode))
      const reactionLayer = firstBfs.nodeLayerIds.get(reaction)
      // get the maximum layer of these edges
      const maxLayer = productEdges.reduce(
        (acc, edge) => Math.max(acc, firstBfs.nodeLayerIds.get(edge.sourceNode)),
        reactionLayer
      )
      if (maxLayer !== reactionLayer) {
        // use the first edge that does not belong to the maximum layer of these edges
        const edgesToUse = productEdges
          .filter((edge) => firstBfs.nodeLayerIds.get(edge.sourceNode) !== maxLayer)
          .at(0)
        if (edgesToUse != null) {
          excludeEdges.push(edgesToUse)
        }
      }
    })
  let bfs = firstBfs
  // if there exist edges to exclude, we do a second bfs excluding the edges calculated above to
  // re-calculate the layers
  if (excludeEdges.length > 0) {
    bfs = calculateLayers(graph, excludeEdges)
  }
  // create the constraints for each layer
  bfs.layers.forEach((bfsLayer) => {
    // nodes that belong in the same layer have to be horizontally aligned
    organicLayoutData.constraints.addAlignmentConstraint(
      ConstraintOrientation.HORIZONTAL,
      0
    ).items = bfsLayer.nodes
    if (bfsLayer.index > 0) {
      // nodes that belong to consecutive layers have to be ordered based on their bfs layering
      const previousLayerNodes = bfs.layers.at(bfsLayer.index - 1).nodes.toArray()
      const orderConstraints = organicLayoutData.constraints.addOrderConstraint(
        ConstraintOrientation.VERTICAL
      )
      previousLayerNodes.concat(bfsLayer.nodes.toArray()).forEach((node, index) => {
        orderConstraints.mapper.set(node, index)
      })
    }
  })
  return bfs.nodeLayerIds
}
/**
 * Creates the constraints for the nodes representing the co-reactants. Namely, co-reactants
 * (i) have to be vertically aligned,
 * (ii) placed on the left of their associated reaction,
 * (iii) one placed on the layer above the one of the associated reaction and one below.
 */
function addCoReactantConstraints(graph, organicLayoutData) {
  // find the nodes representing the co-reactants
  const coReactants = graph.nodes.filter((node) => getType(node) === NodeTypes.CO_REACTANT)
  // align vertically the co-reactants
  organicLayoutData.constraints.addAlignmentConstraint(ConstraintOrientation.VERTICAL).items =
    coReactants
  coReactants.forEach((coReactant) => {
    if (graph.outDegree(coReactant) > 0) {
      const reaction = graph.outEdgesAt(coReactant).at(0).targetNode
      // for each co-reactant, find the associated reaction and place:
      // (i) the reaction after the co-reactant in the horizontal axis
      // (ii) the reaction below the co-reactant
      const horizontalOrdering = organicLayoutData.constraints.addOrderConstraint(
        ConstraintOrientation.HORIZONTAL
      )
      horizontalOrdering.mapper.set(coReactant, 1)
      horizontalOrdering.mapper.set(reaction, 2)
      const verticalOrdering = organicLayoutData.constraints.addOrderConstraint(
        ConstraintOrientation.VERTICAL
      )
      verticalOrdering.mapper.set(coReactant, 1)
      verticalOrdering.mapper.set(reaction, 2)
    } else if (graph.inDegree(coReactant) > 0) {
      const reaction = graph.inEdgesAt(coReactant).at(0).sourceNode
      // for each co-reactant, find the associated reaction and place,
      // (i) the reaction after the co-reactant in the horizontal axis
      // (ii) the reaction above the co-reactant
      const horizontalOrdering = organicLayoutData.constraints.addOrderConstraint(
        ConstraintOrientation.HORIZONTAL
      )
      horizontalOrdering.mapper.set(coReactant, 1)
      horizontalOrdering.mapper.set(reaction, 2)
      const verticalOrdering = organicLayoutData.constraints.addOrderConstraint(
        ConstraintOrientation.VERTICAL
      )
      verticalOrdering.mapper.set(reaction, 1)
      verticalOrdering.mapper.set(coReactant, 2)
    }
  })
}
/**
 * Creates the constraints for the nodes representing the enzymes.
 * These should be horizontally aligned with their associated reaction and placed after it.
 */
function addEnzymeConstraints(graph, organicLayoutData) {
  const enzymes = graph.nodes.filter((node) => getType(node) === NodeTypes.ENZYME)
  enzymes.forEach((enzyme) => {
    const reaction = graph.neighbors(enzyme).at(0)
    // align horizontally the reaction and the enzyme
    organicLayoutData.constraints.addAlignmentConstraint(ConstraintOrientation.HORIZONTAL).items = [
      reaction,
      enzyme
    ]
    // place the reaction before the enzyme
    const orderConstraint = organicLayoutData.constraints.addOrderConstraint(
      ConstraintOrientation.HORIZONTAL
    )
    orderConstraint.mapper.set(reaction, 1)
    orderConstraint.mapper.set(enzyme, 2)
    organicLayoutData.constraints.addMaximumDistance(
      reaction,
      enzyme,
      0,
      ConstraintOrientation.HORIZONTAL
    )
  })
}
/**
 * Creates the constraints for the nodes representing reactions that contain two reactants.
 * These should be vertically aligned on the main path.
 */
function addReactionConstraints(reactions, graph, reactionPath, organicLayoutData) {
  reactions.forEach((reaction) => {
    graph.edgesAt(reaction).forEach((edge) => {
      const opposite = edge.opposite(reaction)
      if (
        isProductOrReactant(opposite) &&
        !isMultipleProductReaction(graph, reaction) &&
        !reactionPath.includes(opposite)
      ) {
        // align vertically the reactions with the reactants on the path
        organicLayoutData.constraints.addAlignmentConstraint(ConstraintOrientation.VERTICAL).items =
          [reaction, opposite]
      }
    })
  })
}
/**
 * Creates the constraints for the nodes representing reactions that contain more than two reactants.
 * In this case, the four products involved in the reaction should be pairwise aligned vertically.
 */
function addMultiProductReactionConstraints(reactions, graph, organicLayoutData) {
  reactions
    .filter((reaction) => isMultipleProductReaction(graph, reaction))
    .forEach((reaction) => {
      const in1 = graph.inEdgesAt(reaction).at(0).sourceNode
      const in2 = graph.inEdgesAt(reaction).at(1).sourceNode
      const out1 = graph.outEdgesAt(reaction).at(0).targetNode
      const out2 = graph.outEdgesAt(reaction).at(1).targetNode
      // align vertically pairwise the reactants
      organicLayoutData.constraints.addAlignmentConstraint(
        ConstraintOrientation.VERTICAL,
        0
      ).items = [in2, out1]
      // align vertically pairwise the reactants
      organicLayoutData.constraints.addAlignmentConstraint(
        ConstraintOrientation.VERTICAL,
        0
      ).items = [in1, out2]
      organicLayoutData.constraints.addMaximumDistance(
        in1,
        reaction,
        8,
        ConstraintOrientation.HORIZONTAL
      )
      organicLayoutData.constraints.addMaximumDistance(
        in2,
        reaction,
        8,
        ConstraintOrientation.HORIZONTAL
      )
      organicLayoutData.constraints.addMaximumDistance(
        out1,
        reaction,
        8,
        ConstraintOrientation.HORIZONTAL
      )
      organicLayoutData.constraints.addMaximumDistance(
        out2,
        reaction,
        8,
        ConstraintOrientation.HORIZONTAL
      )
    })
}
/**
 * Applies the shortest path algorithm starting from a node with no incoming edges and ending to a node
 * which is marked with vAlign = 'end' in its tag.
 */
function calculateMainReactionPath(graph) {
  const startNodes = graph.nodes.filter((node) => graph.inEdgesAt(node).size === 0).at(0)
  const endNodes = graph.nodes.filter((node) => getMetabolicData(node).vAlign === 'end').at(0)
  const shortestPath = new ShortestPath({
    source: startNodes,
    sink: endNodes,
    subgraphNodes: {
      excludes: (node) =>
        getType(node) === NodeTypes.ENZYME || getType(node) === NodeTypes.CO_REACTANT
    }
  })
  return shortestPath.run(graph).nodes
}
/**
 * Calculates the layer of each node that represents a product or a reactant starting from a node with
 * no incoming edges.
 * For the BFS, nodes representing enzymes and co-reactants are excluded.
 * Also, since products/reactants have to be placed below their corresponding reaction, for reactions with more than
 * two products, we consider only the edges that connect to node on the maximum layer and exclude all other edges.
 */
function calculateLayers(graph, excludedEdges) {
  const startNodes = graph.nodes
    .filter((node) => graph.inEdgesAt(node).size === 0 && isProductOrReactant(node))
    .first()
  const bfsTraversal = new Bfs({
    coreNodes: startNodes,
    traversalDirection: TraversalDirection.SUCCESSOR,
    subgraphNodes: {
      excludes: (node) =>
        getType(node) === NodeTypes.ENZYME || getType(node) === NodeTypes.CO_REACTANT
    },
    subgraphEdges: {
      excludes: (edge) => (excludedEdges !== undefined ? excludedEdges.includes(edge) : false)
    }
  })
  return bfsTraversal.run(graph)
}
/**
 * Returns whether the given node is a product or a reactant.
 */
function isProductOrReactant(node) {
  return getType(node) === NodeTypes.PRODUCT || getType(node) === NodeTypes.REACTANT
}
/**
 * Returns whether the reaction node contains more than 2 reactants.
 */
function isMultipleProductReaction(graph, node) {
  const neighbors = graph.neighbors(node).filter((neighbor) => isProductOrReactant(neighbor))
  return new Set(neighbors).size > 2
}
