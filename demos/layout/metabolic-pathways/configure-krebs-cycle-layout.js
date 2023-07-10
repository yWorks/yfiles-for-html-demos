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
import {
  BaseClass,
  GenericLabeling,
  GenericLayoutData,
  ILabelLayoutDpKey,
  ILayoutAlgorithm,
  Insets,
  LabelingData,
  LayoutKeys,
  NodeHalo,
  OrganicLayout,
  OrganicLayoutConstraintOrientation,
  OrganicLayoutScope,
  OrganicLayoutStarSubstructureStyle,
  Rect,
  YBoolean,
  YPoint
} from 'yfiles'
import { getMetabolicData, getType, NodeTypes } from './data-types.js'

/**
 * Creates a layout algorithm that uses the organic layout and adds additional constraints
 * to handle the nodes that have to be vertically aligned and the nodes that form a circle.
 * Also, it registers the necessary data providers to pass the information about the
 * vertical alignment and circle nodes and their types.
 * @returns {!object}
 */
export function configureKrebsCycleLayout() {
  // creates the layout for the Krebs cycle
  const krebsCycleLayout = new KrebsCycleLayout()
  // creates the layout data to pass the information about the types of the nodes and their placement
  const layoutData = new GenericLayoutData()
  // passes the information about the types of the nodes
  layoutData.addNodeItemMapping(KrebsCycleLayout.NODE_TYPES, node => getType(node))
  // passes the information about the nodes that have to be vertically aligned
  layoutData.addNodeItemMapping(
    KrebsCycleLayout.ALIGNED_NODES_DP_KEY,
    node => getMetabolicData(node).vAlign
  )
  // passes the information about the nodes that belong on the cycle
  layoutData.addNodeItemMapping(
    KrebsCycleLayout.CIRCLE_NODES_DP_KEY,
    node => getMetabolicData(node).circle
  )

  // applies a generic labeling for the labels of co-reactants, co-enzymes or nodes of type 'Other'
  const affectedLabelsDpKey = new ILabelLayoutDpKey(YBoolean.$class, null, 'AffectedLabels')
  const genericLabeling = new GenericLabeling({
    coreLayout: krebsCycleLayout,
    placeNodeLabels: true,
    placeEdgeLabels: false,
    reduceAmbiguity: true,
    affectedLabelsDpKey: affectedLabelsDpKey
  })

  // marks the labels that have to be arranged
  const labelingData = new LabelingData()
  labelingData.affectedLabels = label =>
    getType(label.owner) === NodeTypes.CO_REACTANT || getType(label.owner) === NodeTypes.OTHER
  labelingData.affectedLabels.dpKey = affectedLabelsDpKey

  return { layout: genericLabeling, layoutData: layoutData.combineWith(labelingData) }
}

/**
 * A layout algorithm that uses the organic layout and adds additional constraints
 * to handle the nodes that have to be vertically aligned and the nodes that form a cycle.
 */
export default class KrebsCycleLayout extends BaseClass(ILayoutAlgorithm) {
  /** 
   *
     * A data-provider to provide the information about the nodes that have to be aligned and their order
     
  * @type {string}
   */
  static get ALIGNED_NODES_DP_KEY() {
    if (typeof KrebsCycleLayout.$ALIGNED_NODES_DP_KEY === 'undefined') {
      KrebsCycleLayout.$ALIGNED_NODES_DP_KEY = 'KrebsCycleLayout.ALIGNED_NODES_DP_KEY'
    }

    return KrebsCycleLayout.$ALIGNED_NODES_DP_KEY
  }

  /** 
   *
     * A data-provider to provide the information about the nodes that form a cycle
     
  * @type {string}
   */
  static get CIRCLE_NODES_DP_KEY() {
    if (typeof KrebsCycleLayout.$CIRCLE_NODES_DP_KEY === 'undefined') {
      KrebsCycleLayout.$CIRCLE_NODES_DP_KEY = 'KrebsCycleLayout.CIRCLE_NODES_DP_KEY'
    }

    return KrebsCycleLayout.$CIRCLE_NODES_DP_KEY
  }

  /** 
   *
     * A data-provider to provide the information about the types of the nodes
     
  * @type {string}
   */
  static get NODE_TYPES() {
    if (typeof KrebsCycleLayout.$NODE_TYPES === 'undefined') {
      KrebsCycleLayout.$NODE_TYPES = 'KrebsCycleLayout.NODE_TYPES_DP_KEY'
    }

    return KrebsCycleLayout.$NODE_TYPES
  }

  /**
   * Creates and cnd configures the organic layout.
   * It runs in two phases. In the first phase, all nodes are arranged using constraints so that
   * the nodes on the top are vertically aligned and a circle is formed.
   * The second phase runs only for the nodes that represent enzymes, co-reactants and co-enzymes.
   * It defines additional constraints so that enzymes are placed in the circle and
   * constraints for the vertical/horizontal alignment and ordering of the co-reactants and co-enzymes.
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    // get the nodes that have to be vertically aligned
    const vAlignedNodes = this.getVerticallyAlignedNodes(graph)
    // get the nodes that belong on the circle
    const circleNodes = this.getCircleNodes(graph)

    // align vertically the nodes on top and place the nodes on the circle
    this.applyFirstPhase(graph, vAlignedNodes, circleNodes)
    // arrange the enzymes and the co-reactants
    this.applySecondPhase(graph, vAlignedNodes, circleNodes)
  }

  /**
   * Returns the nodes that have to be vertically aligned.
   * @param {!LayoutGraph} graph
   * @returns {?Array.<YNode>}
   */
  getVerticallyAlignedNodes(graph) {
    const alignedNodesDp = graph.getDataProvider(KrebsCycleLayout.ALIGNED_NODES_DP_KEY)
    // get the nodes to be aligned from the data-provider and sort them based on their order
    const alignedNodes = graph.nodes.filter(node => alignedNodesDp.getNumber(node) > 0).toArray()
    alignedNodes.sort((n1, n2) => alignedNodesDp.getNumber(n1) - alignedNodesDp.getNumber(n2))
    return alignedNodes
  }

  /**
   * Returns the nodes that belong on the circle.
   * It includes the nodes that are marked in the data-set and their associated reactions.
   * @param {!LayoutGraph} graph
   * @returns {!Array.<YNode>}
   */
  getCircleNodes(graph) {
    const circleNodesDp = graph.getDataProvider(KrebsCycleLayout.CIRCLE_NODES_DP_KEY)
    const nodeTypesDp = graph.getDataProvider(KrebsCycleLayout.NODE_TYPES)

    const circleNodes = []
    graph.nodes.forEach(node => {
      if (circleNodesDp.getBoolean(node)) {
        circleNodes.push(node)
        // get the reaction nodes that are connected with these reactant nodes
        node.neighbors.forEach(node => {
          if (isReaction(nodeTypesDp, node) && !circleNodes.includes(node)) {
            circleNodes.push(node)
          }
        })
      }
    })
    return circleNodes
  }

  /**
   * The first phase of the layout algorithm arranges all the nodes of the graph and puts the constraints
   * for the vertically aligned nodes and the circle.
   * @param {!LayoutGraph} graph
   * @param {?Array.<YNode>} vAlignedNodes
   * @param {?Array.<YNode>} circleNodes
   */
  applyFirstPhase(graph, vAlignedNodes, circleNodes) {
    // create a basic organic layout configuration - use some large preferred edge length to
    // make sure that the nodes can be placed on the circle
    const organicLayout = new OrganicLayout({
      deterministic: true,
      preferredEdgeLength: 210,
      minimumNodeDistance: 50,
      nodeEdgeOverlapAvoided: true
    })

    // get the node ids for the nodes - must be used for the constraints!
    const nodeIds = graph.getDataProvider(LayoutKeys.NODE_ID_DP_KEY)

    const constraintFactory = organicLayout.createConstraintFactory(graph)

    if (circleNodes) {
      // find the circle nodes and store their ids
      const circleNodeIds = circleNodes.map(node => nodeIds.get(node))
      // create the ellipse constraint so that the nodes are placed on the boundary of a circle
      constraintFactory.addEllipse(circleNodeIds, true, 1)
    }

    const preferredEdgeLength = graph.createEdgeMap()
    if (vAlignedNodes) {
      const vAlignedNodeIds = vAlignedNodes.map(node => nodeIds.get(node))
      // order the nodes based on the vAlign stored in the data
      constraintFactory.addOrderConstraint(
        vAlignedNodeIds,
        OrganicLayoutConstraintOrientation.VERTICAL
      )
      // align the nodes vertically
      constraintFactory.addAlignmentConstraint(
        vAlignedNodeIds,
        OrganicLayoutConstraintOrientation.VERTICAL,
        0
      )

      // make the vertical edges of the aligned nodes a bit shorter
      graph.edges.forEach(edge => {
        if (vAlignedNodes.includes(edge.source) && vAlignedNodes.includes(edge.target)) {
          preferredEdgeLength.set(edge, 100)
        }
      })
      graph.addDataProvider(OrganicLayout.PREFERRED_EDGE_LENGTH_DP_KEY, preferredEdgeLength)
    }

    // apply the layout
    organicLayout.applyLayout(graph)

    // clean-up
    if (graph.getDataProvider(OrganicLayout.PREFERRED_EDGE_LENGTH_DP_KEY)) {
      graph.removeDataProvider(OrganicLayout.PREFERRED_EDGE_LENGTH_DP_KEY)
    }
    graph.disposeEdgeMap(preferredEdgeLength)
    constraintFactory.dispose()
  }

  /**
   * The second phase runs only for the nodes that represent enzymes, co-reactants and co-enzymes.
   * It defines additional constraints so that enzymes are placed in the circle and
   * constraints for the vertical/horizontal alignment and ordering of the co-reactants and co-enzymes.
   * @param {!LayoutGraph} graph
   * @param {!Array.<YNode>} vAlignedNodes
   * @param {!Array.<YNode>} circleNodes
   */
  applySecondPhase(graph, vAlignedNodes, circleNodes) {
    // get the node ids for the nodes - must be used for the constraints!
    const nodeIds = graph.getDataProvider(LayoutKeys.NODE_ID_DP_KEY)

    // get the data-provider with the node type information from the data-set
    const nodeTypesDp = graph.getDataProvider(KrebsCycleLayout.NODE_TYPES)

    // configure the layout algorithm with scope 'subset' so that only the nodes of type
    // enzyme, co-reactant or co-enzyme are arranged
    const organicLayout = new OrganicLayout({
      scope: OrganicLayoutScope.SUBSET,
      // handle specially the stars
      starSubstructureStyle: OrganicLayoutStarSubstructureStyle.RADIAL,
      deterministic: true,
      preferredEdgeLength: 210,
      minimumNodeDistance: 30,
      nodeEdgeOverlapAvoided: true
    })

    const constraintFactory = organicLayout.createConstraintFactory(graph)

    // used to mark the nodes that connected to the vertically aligned nodes and have already constraints
    const handledNodes = new Set()
    const circleNodesSet = new Set(circleNodes)
    // calculate the bounds of the circle and create a constraint so that enzymes are placed
    // inside the circle
    const bounds = calculateCircleBounds(graph, circleNodes)
    const enzymes = this.getEnzymesOnCircle(graph, circleNodesSet, nodeIds, nodeTypesDp)
    constraintFactory.addPinnedBoundingBox(enzymes, bounds.x, bounds.y, bounds.width, bounds.height)

    // add constraints to the nodes connected to the vertically aligned path on the top, and
    // mark them as already handled
    this.addConstraintsToVerticallyAlignedPath(
      vAlignedNodes,
      circleNodesSet,
      handledNodes,
      nodeIds,
      nodeTypesDp,
      constraintFactory
    )

    // add constraints to all co-reactants, enzymes and co-enzymes connected to reaction nodes on circle
    this.addConstraintsToCircle(
      graph,
      circleNodes,
      handledNodes,
      nodeIds,
      nodeTypesDp,
      constraintFactory
    )

    // mark the nodes that have to be arranged, namely all co-reactants, enzymes and co-enzymes
    // that are connected to reaction nodes on circle
    const affectedNodesMap = graph.createNodeMap()
    // and, also add some node halos to these nodes
    const halos = graph.createNodeMap()
    graph.nodes
      .filter(
        node =>
          nodeTypesDp.get(node) === NodeTypes.ENZYME ||
          nodeTypesDp.get(node) === NodeTypes.OTHER ||
          nodeTypesDp.get(node) === NodeTypes.CO_REACTANT
      )
      .forEach(node => {
        affectedNodesMap.setBoolean(node, true)
        halos.set(node, NodeHalo.create(20))
      })
    graph.addDataProvider(OrganicLayout.AFFECTED_NODES_DP_KEY, affectedNodesMap)
    graph.addDataProvider(NodeHalo.NODE_HALO_DP_KEY, halos)

    // assign some preferred edge lengths for the edges
    const preferredEdgeLength = graph.createEdgeMap()
    graph.edges.forEach(edge => {
      const sType = nodeTypesDp.getNumber(edge.source)
      const tType = nodeTypesDp.getNumber(edge.target)

      if (handledNodes.has(edge.source) || handledNodes.has(edge.target)) {
        preferredEdgeLength.set(edge, 30)
      } else if (sType === NodeTypes.ENZYME || tType === NodeTypes.ENZYME) {
        preferredEdgeLength.set(edge, 10)
      } else {
        preferredEdgeLength.set(edge, 82)
      }
    })
    graph.addDataProvider(OrganicLayout.PREFERRED_EDGE_LENGTH_DP_KEY, preferredEdgeLength)

    // apply the layout
    organicLayout.applyLayout(graph)

    // clean-up
    graph.disposeNodeMap(affectedNodesMap)
    graph.disposeNodeMap(halos)
    graph.disposeEdgeMap(preferredEdgeLength)
    constraintFactory.dispose()
    graph.removeDataProvider(OrganicLayout.PREFERRED_EDGE_LENGTH_DP_KEY)
    graph.removeDataProvider(OrganicLayout.AFFECTED_NODES_DP_KEY)
    graph.removeDataProvider(NodeHalo.NODE_HALO_DP_KEY)
  }

  /**
   * Add constraints to all co-reactants, enzymes and co-enzymes connected to reaction nodes on circle.
   * @param {!LayoutGraph} graph
   * @param {!Array.<YNode>} circleNodes
   * @param {!Set.<YNode>} handledNodes
   * @param {!IDataProvider} nodeIds
   * @param {!IDataProvider} nodeTypesDp
   * @param {!OrganicLayoutConstraintFactory} constraintFactory
   */
  addConstraintsToCircle(
    graph,
    circleNodes,
    handledNodes,
    nodeIds,
    nodeTypesDp,
    constraintFactory
  ) {
    // calculate the center of the circle
    const circleCenter = calculateCircleCenter(graph, circleNodes)
    const visited = new Set()
    graph.nodes
      // get all co-reactants that are not already handled
      .filter(node => isCoReactant(nodeTypesDp, node) && !handledNodes.has(node))
      .forEach(coReactant => {
        if (!visited.has(coReactant)) {
          // get the reaction node to which this coReactant is connected and find the other otherReactant
          const reaction = coReactant.edges.at(0).opposite(coReactant)
          const otherReactant = reaction.neighbors.find(
            neighbor => neighbor !== coReactant && isCoReactant(nodeTypesDp, neighbor)
          )

          // order the coReactant pair based on whether they have incoming/outgoing edges
          const orderedNodes =
            coReactant.inDegree > 0
              ? [nodeIds.get(otherReactant), nodeIds.get(coReactant)]
              : [nodeIds.get(coReactant), nodeIds.get(otherReactant)]

          // align and order the co-reactants either horizontally or vertically based on the reaction's position on the circle
          const orientation = getOrientation(
            graph.getCenterX(reaction),
            graph.getCenterY(reaction),
            circleCenter
          )
          constraintFactory.addOrderConstraint(orderedNodes, orientation)
          constraintFactory.addAlignmentConstraint(orderedNodes, orientation, 0)
          visited.add(otherReactant)
        }
      })

    // create some constraints between the reactions and the nodes of type 'other' to make sure
    // that they are separated and placed with some distance
    graph.nodes
      .filter(node => nodeTypesDp.get(node) === NodeTypes.OTHER)
      .forEach(node => {
        const reaction = node.neighbors.at(0)
        // create a constraint to force the reaction and the 'other' node to have a minimum distance
        constraintFactory.addSeparationConstraint(
          [nodeIds.get(node)],
          [nodeIds.get(reaction)],
          getOrientation(graph.getCenterX(reaction), graph.getCenterY(reaction), circleCenter),
          0
        )
      })
  }

  /**
   * Returns the enzymes that are connected to the circle.
   * @param {!LayoutGraph} graph
   * @param {!Set.<YNode>} circleNodes
   * @param {!IDataProvider} nodeIds
   * @param {!IDataProvider} nodeTypesDp
   * @returns {!Array.<YNode>}
   */
  getEnzymesOnCircle(graph, circleNodes, nodeIds, nodeTypesDp) {
    return graph.nodes
      .filter(node => isEnzyme(nodeTypesDp, node) && connectsToCircle(node, circleNodes))
      .map(node => nodeIds.get(node))
      .toArray()
  }

  /**
   * Creates the constraints to the nodes on the top that are connected to vertically aligned nodes.
   * @param {!Array.<YNode>} alignedNodes
   * @param {!Set.<YNode>} circleNodes
   * @param {!Set.<YNode>} handledNodes
   * @param {!IDataProvider} nodeIds
   * @param {!IDataProvider} nodeTypesDp
   * @param {!OrganicLayoutConstraintFactory} constraintFactory
   */
  addConstraintsToVerticallyAlignedPath(
    alignedNodes,
    circleNodes,
    handledNodes,
    nodeIds,
    nodeTypesDp,
    constraintFactory
  ) {
    alignedNodes
      .filter(node => isReaction(nodeTypesDp, node) && !circleNodes.has(node))
      .forEach(reaction => {
        const coReactantIds = []
        // get the id of the reaction node
        const reactionId = nodeIds.get(reaction)

        // sort the co-reactants based on whether they have incoming/outgoing edges
        reaction.neighbors
          .toArray()
          .sort((n1, n2) => {
            const t1 = nodeTypesDp.get(n1)
            if (t1 === NodeTypes.CO_REACTANT && n1.inDegree > 1 && n2.inDegree === 0) {
              return 1
            } else if (t1 === NodeTypes.CO_REACTANT && n1.outDegree > 1 && n2.outDegree === 0) {
              return -1
            }
            return 0
          })
          .forEach(neighbor => {
            const type = nodeTypesDp.get(neighbor)
            const neighborId = nodeIds.get(neighbor)
            if (type === NodeTypes.ENZYME) {
              // create a constraint to place the enzymes before their associated reaction
              constraintFactory.addOrderConstraint(
                [neighborId, reactionId],
                OrganicLayoutConstraintOrientation.HORIZONTAL
              )

              // create a constraint to align horizontally the enzymes with their associated reaction
              constraintFactory.addAlignmentConstraint(
                [neighborId, reactionId],
                OrganicLayoutConstraintOrientation.HORIZONTAL,
                0
              )
              handledNodes.add(neighbor)
            } else if (type === NodeTypes.CO_REACTANT && !coReactantIds.includes(neighborId)) {
              coReactantIds.push(neighborId)

              // create a constraint to place the co-reactants after their associated reaction
              constraintFactory.addOrderConstraint(
                [reactionId, neighborId],
                OrganicLayoutConstraintOrientation.HORIZONTAL
              )
              handledNodes.add(neighbor)
            }
          })

        // create a constraint to vertically align the co-reactants
        constraintFactory.addAlignmentConstraint(
          coReactantIds,
          OrganicLayoutConstraintOrientation.VERTICAL
        )
        // create a constraint to order the co-reactants based on whether they have
        // incoming/outgoing edges
        constraintFactory.addOrderConstraint(
          [coReactantIds[0], coReactantIds[1]],
          OrganicLayoutConstraintOrientation.VERTICAL
        )

        handledNodes.add(reaction)
      })
  }
}

/**
 * Calculates the bounds of the cycle based on the nodes' layout and reduces it with some insets
 * to make sure that the enzymes are placed inside the circle.
 * @param {!LayoutGraph} graph
 * @param {!Array.<YNode>} circleNodes
 * @returns {!Rect}
 */
function calculateCircleBounds(graph, circleNodes) {
  return circleNodes
    .reduce((bounds, node) => Rect.add(bounds, graph.getBoundingBox(node).toRect()), Rect.EMPTY)
    .getReduced(new Insets(250))
}

/**
 * Checks whether the given node is connected to a node on the circle.
 * @param {!YNode} node
 * @param {!Set.<YNode>} circleNodes
 * @returns {boolean}
 */
function connectsToCircle(node, circleNodes) {
  return (
    node.edges.find(edge => circleNodes.has(edge.source) || circleNodes.has(edge.target)) !== null
  )
}

/**
 * Returns the angle of the given node that defines its position on the circle.
 * @param {number} x
 * @param {number} y
 * @param {number} cx
 * @param {number} cy
 * @returns {number}
 */
function getAngle(x, y, cx, cy) {
  let angle = Math.atan2(y - cy, x - cx)
  if (angle < 0) {
    angle += 2 * Math.PI
  }
  return (angle * 180) / Math.PI
}

/**
 * Returns the orientation for the alignment based on the position of the node on the circle.
 * @param {number} x
 * @param {number} y
 * @param {!YPoint} circleCenter
 * @returns {!OrganicLayoutConstraintOrientation}
 */
function getOrientation(x, y, circleCenter) {
  const angle = getAngle(x, y, circleCenter.x, circleCenter.y)
  return (angle > 30 && angle < 120) || (angle > 230 && angle < 250)
    ? OrganicLayoutConstraintOrientation.HORIZONTAL
    : OrganicLayoutConstraintOrientation.VERTICAL
}

/**
 * Calculates the circle's center based on the given three points.
 * @param {!LayoutGraph} graph
 * @param {!Array.<YNode>} circleNodes
 * @returns {!YPoint}
 */
function calculateCircleCenter(graph, circleNodes) {
  const { x: p1x, y: p1y } = graph.getCenter(circleNodes[0])
  const { x: p2x, y: p2y } = graph.getCenter(circleNodes[1])
  const { x: p3x, y: p3y } = graph.getCenter(circleNodes[2])
  const det = 2 * (p1x * p2y - p2x * p1y - p1x * p3y + p3x * p1y + p2x * p3y - p3x * p2y)
  const a = p1x * p1x + p1y * p1y
  const b = p2x * p2x + p2y * p2y
  const c = p3x * p3x + p3y * p3y
  const centerX = (a * (p2y - p3y) + b * (p3y - p1y) + c * (p1y - p2y)) / det
  const centerY = (a * (p3x - p2x) + b * (p1x - p3x) + c * (p2x - p1x)) / det
  return new YPoint(centerX, centerY)
}

/**
 * Returns whether the given node represents a reaction.
 * @param {!IDataProvider} dp
 * @param {!YNode} node
 * @returns {boolean}
 */
function isReaction(dp, node) {
  return dp.get(node) === NodeTypes.REACTION
}

/**
 * Returns whether the given node represents an enzyme.
 * @param {!IDataProvider} dp
 * @param {!YNode} node
 * @returns {boolean}
 */
function isEnzyme(dp, node) {
  return dp.get(node) === NodeTypes.ENZYME
}

/**
 * Returns whether the given node represents a co-reactant.
 * @param {!IDataProvider} dp
 * @param {!YNode} node
 * @returns {boolean}
 */
function isCoReactant(dp, node) {
  return dp.get(node) === NodeTypes.CO_REACTANT
}
