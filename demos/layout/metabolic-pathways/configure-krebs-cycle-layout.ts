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
  BaseClass,
  ConstraintOrientation,
  GenericLabeling,
  GenericLabelingData,
  GenericLayoutData,
  HashMap,
  type IEnumerable,
  ILayoutAlgorithm,
  type INode,
  Insets,
  type LayoutData,
  type LayoutEdge,
  type LayoutGraph,
  type LayoutNode,
  type OrganicConstraintData,
  OrganicLayout,
  OrganicLayoutStarSubstructureStyle,
  Point,
  Rect
} from '@yfiles/yfiles'
import { getAlignment, getType, isOnCircle, NodeTypes } from './data-types'

/**
 * Creates a layout algorithm that uses the organic layout and adds additional constraints
 * to handle the nodes that have to be vertically aligned and the nodes that form a circle.
 * Also, it registers the necessary data maps to pass the information about the
 * vertical alignment and circle nodes and their types.
 */
export function configureKrebsCycleLayout(): { layout: ILayoutAlgorithm; layoutData: LayoutData } {
  // creates the layout for the Krebs cycle
  const krebsCycleLayout = new KrebsCycleLayout()
  // creates the layout data to pass the information about the types of the nodes and their placement
  const layoutData: GenericLayoutData = new GenericLayoutData()

  // applies a generic labeling for the labels of co-reactants, co-enzymes or nodes of type 'Other'
  const labeling = new GenericLabeling({ coreLayout: krebsCycleLayout, scope: 'node-labels' })

  // marks the labels that have to be arranged
  const labelingData = new GenericLabelingData({
    scope: {
      nodeLabels: (label) => isCoReactant(label.owner as INode) || isOther(label.owner as INode)
    }
  })
  return { layout: labeling, layoutData: layoutData.combineWith(labelingData) }
}

/**
 * A layout algorithm that uses the organic layout and adds additional constraints
 * to handle the nodes that have to be vertically aligned and the nodes that form a cycle.
 */
class KrebsCycleLayout extends BaseClass(ILayoutAlgorithm) {
  /**
   * Creates and cnd configures the organic layout.
   * It runs in two phases. In the first phase, all nodes are arranged using constraints so that
   * the nodes on the top are vertically aligned and a circle is formed.
   * The second phase runs only for the nodes that represent enzymes, co-reactants and co-enzymes.
   * It defines additional constraints so that enzymes are placed in the circle and
   * constraints for the vertical/horizontal alignment and ordering of the co-reactants and co-enzymes.
   */
  applyLayout(graph: LayoutGraph): void {
    // get the nodes that have to be vertically aligned
    const vAlignedNodes = this.getVerticallyAlignedNodes(graph)
    // get the nodes that belong on the circle
    const circleNodes = this.getCircleNodes(graph)

    // align vertically the nodes on top and place the nodes on the circle
    this.applyFirstPhase(graph, vAlignedNodes, circleNodes)
    // arrange the enzymes and the co-reactants
    this.applySecondPhase(graph, vAlignedNodes!, circleNodes)
  }

  /**
   * Returns the nodes that have to be vertically aligned.
   */
  private getVerticallyAlignedNodes(graph: LayoutGraph): LayoutNode[] | null {
    const compareAlignment = (a: string | number, b: string | number): number => {
      if (a === 'start' && b !== 'start') {
        return -1
      } else if (a === 'end' && b !== 'end') {
        return 1
      } else if (a !== 'start' && b === 'start') {
        return 1
      } else if (a !== 'end' && b === 'end') {
        return -1
      } else if (a === b) {
        return 0
      } else {
        return Math.sign((a as number) - (b as number))
      }
    }

    // get the nodes to be aligned from the data-map and sort them based on their order
    const alignedNodes = graph.nodes
      .filter((node) => typeof getAlignment(node) !== 'undefined')
      .toSorted((a, b) => compareAlignment(getAlignment(a)!, getAlignment(b)!))
    return alignedNodes.toArray()
  }

  /**
   * Returns the nodes that belong on the circle.
   * It includes the nodes that are marked in the data-set and their associated reactions.
   */
  private getCircleNodes(graph: LayoutGraph): LayoutNode[] {
    const circleNodes: LayoutNode[] = []
    graph.nodes.forEach((node) => {
      if (isOnCircle(node)) {
        circleNodes.push(node)
        // get the reaction nodes that are connected with these reactant nodes
        this.getNeighbors(node).forEach((node) => {
          if (isReaction(node) && !circleNodes.includes(node)) {
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
   */
  applyFirstPhase(
    graph: LayoutGraph,
    vAlignedNodes: LayoutNode[] | null,
    circleNodes: LayoutNode[] | null
  ): void {
    // create a basic organic layout configuration - use some large preferred edge length to
    // make sure that the nodes can be placed on the circle
    const organicLayout = new OrganicLayout({
      deterministic: true,
      defaultPreferredEdgeLength: 290,
      defaultMinimumNodeDistance: 5
    })

    const organicLayoutData = organicLayout.createLayoutData(graph)
    const organicConstraintData = organicLayoutData.constraints

    if (circleNodes) {
      // create the ellipse constraint so that the nodes are placed on the boundary of a circle
      organicConstraintData.addEllipse(true, 1).items = circleNodes
    }

    if (vAlignedNodes) {
      const sortedNodesMap = new HashMap<LayoutNode, number>()
      vAlignedNodes.forEach((node, index) => sortedNodesMap.set(node, index))
      // order the nodes based on the vAlign stored in the data
      organicConstraintData.addOrderConstraint(ConstraintOrientation.VERTICAL).mapper =
        sortedNodesMap

      // align the nodes vertically
      organicConstraintData.addAlignmentConstraint(ConstraintOrientation.VERTICAL).source =
        vAlignedNodes

      // make the vertical edges of the aligned nodes a bit shorter
      organicLayoutData.preferredEdgeLengths = (edge): number | null => {
        if (sortedNodesMap.has(edge.source) && sortedNodesMap.has(edge.target)) {
          return 200
        }
        return null // Use default edge length value
      }
    }

    // apply the layout
    graph.applyLayout(organicLayout, organicLayoutData)
  }

  /**
   * The second phase runs only for the nodes that represent enzymes, co-reactants and co-enzymes.
   * It defines additional constraints so that enzymes are placed in the circle and
   * constraints for the vertical/horizontal alignment and ordering of the co-reactants and co-enzymes.
   */
  applySecondPhase(
    graph: LayoutGraph,
    vAlignedNodes: LayoutNode[],
    circleNodes: LayoutNode[]
  ): void {
    // configure the layout algorithm with scope 'subset' so that only the nodes of type
    // enzyme, co-reactant or co-enzyme are arranged
    const organicLayout = new OrganicLayout({
      // specially handle the stars
      starSubstructureStyle: OrganicLayoutStarSubstructureStyle.RADIAL,
      deterministic: true,
      defaultPreferredEdgeLength: 200,
      defaultMinimumNodeDistance: 12
    })

    const organicLayoutData = organicLayout.createLayoutData(graph)
    const organicConstraintData = organicLayoutData.constraints

    // used to mark the nodes that connected to the vertically aligned nodes and have already constraints
    const handledNodes = new Set<LayoutNode>()
    const circleNodesSet = new Set(circleNodes)

    // calculate the bounds of the circle and create a constraint so that enzymes are placed
    // inside the circle
    const bounds = calculateCircleBounds(circleNodes)
    organicConstraintData.addPinnedBounds(
      new Rect(bounds.x, bounds.y, bounds.width, bounds.height)
    ).source = this.getEnzymesOnCircle(graph, circleNodesSet)

    // add constraints to the nodes connected to the vertically aligned path on the top, and
    // mark them as already handled
    this.addConstraintsToVerticallyAlignedPath(
      vAlignedNodes,
      circleNodesSet,
      handledNodes,
      organicConstraintData
    )

    // add constraints to all co-reactants, enzymes and co-enzymes connected to reaction nodes on circle
    this.addConstraintsToCircle(graph, circleNodes, handledNodes, organicConstraintData)

    // mark the nodes that have to be arranged, namely all co-reactants, enzymes and co-enzymes
    // that are connected to reaction nodes on circle
    const affectedNodesMap = new Map<LayoutNode, boolean>()
    // and, also add some node margins to these nodes
    const margins = new Map<LayoutNode, Insets>()
    graph.nodes
      .filter((node) => isEnzyme(node) || isOther(node) || isCoReactant(node))
      .forEach((node) => {
        affectedNodesMap.set(node, true)
        margins.set(node, new Insets(10))
      })

    organicLayoutData.scope.nodes = affectedNodesMap
    organicLayoutData.nodeMargins = margins

    // assign some preferred edge lengths for the edges
    const preferredEdgeLength = new Map<LayoutEdge, number>()
    graph.edges.forEach((edge) => {
      if (handledNodes.has(edge.source) || handledNodes.has(edge.target)) {
        preferredEdgeLength.set(edge, 30)
      } else if (isEnzyme(edge.source) || isEnzyme(edge.target)) {
        preferredEdgeLength.set(edge, 10)
      } else {
        preferredEdgeLength.set(edge, 80)
      }
    })

    organicLayoutData.preferredEdgeLengths = preferredEdgeLength

    // apply the layout
    graph.applyLayout(organicLayout, organicLayoutData)
  }

  /**
   * Add constraints to all co-reactants, enzymes and co-enzymes connected to reaction nodes on circle.
   */
  private addConstraintsToCircle(
    graph: LayoutGraph,
    circleNodes: LayoutNode[],
    handledNodes: Set<LayoutNode>,
    organicConstraintData: OrganicConstraintData<LayoutNode>
  ): void {
    // calculate the center of the circle
    const circleCenter = calculateCircleCenter(circleNodes)
    const visited = new Set<LayoutNode>()
    graph.nodes
      // get all co-reactants that are not already handled
      .filter((node) => isCoReactant(node) && !handledNodes.has(node))
      .forEach((coReactant) => {
        if (!visited.has(coReactant)) {
          // get the reaction node to which this coReactant is connected and find the other otherReactant
          const reaction = coReactant.edges.at(0)!.opposite(coReactant)
          const otherReactant = this.getNeighbors(reaction).find(
            (neighbor) => neighbor !== coReactant && isCoReactant(neighbor)
          )!

          // align and order the co-reactants either horizontally or vertically based on the reaction's position on the circle
          const orientation = getOrientation(
            reaction.layout.center.x,
            reaction.layout.center.y,
            circleCenter
          )

          // order the coReactant pair based on whether they have incoming/outgoing edges
          const orderConstraint = organicConstraintData.addOrderConstraint(orientation)
          orderConstraint.mapper.set(otherReactant, coReactant.inDegree > 0 ? 1 : 2)
          orderConstraint.mapper.set(coReactant, coReactant.inDegree > 0 ? 2 : 1)

          organicConstraintData.addAlignmentConstraint(orientation, 0).source =
            coReactant.inDegree > 0 ? [otherReactant, coReactant] : [coReactant, otherReactant]
          visited.add(otherReactant)
        }
      })

    // create some constraints between the reactions and the nodes of type 'other' to make sure
    // that they are separated and placed with some distance
    graph.nodes
      .filter((node) => isOther(node))
      .forEach((node) => {
        const reaction = this.getNeighbors(node).at(0)!
        // create a constraint to force the reaction and the 'other' node to have a minimum distance
        const organicLayoutSeparationConstraint = organicConstraintData.addSeparationConstraint(
          getOrientation(reaction.layout.centerX, reaction.layout.centerY, circleCenter),
          0
        )
        organicLayoutSeparationConstraint.firstSet.source = [node]
        organicLayoutSeparationConstraint.secondSet.source = [reaction]
      })
  }

  /**
   * Returns the enzymes that are connected to the circle.
   */
  private getEnzymesOnCircle(graph: LayoutGraph, circleNodes: Set<LayoutNode>): LayoutNode[] {
    return graph.nodes
      .filter((node) => isEnzyme(node) && connectsToCircle(node, circleNodes))
      .toArray()
  }

  /**
   * Returns all the neighbor nodes of the given node.
   */
  private getNeighbors(node: LayoutNode): IEnumerable<LayoutNode> {
    return node.inEdges.map((edge) => edge.source).concat(node.outEdges.map((edge) => edge.target))
  }

  /**
   * Creates the constraints to the nodes on the top that are connected to vertically aligned nodes.
   */
  private addConstraintsToVerticallyAlignedPath(
    alignedNodes: LayoutNode[],
    circleNodes: Set<LayoutNode>,
    handledNodes: Set<LayoutNode>,
    organicConstraintData: OrganicConstraintData<LayoutNode>
  ): void {
    alignedNodes
      .filter((node) => isReaction(node) && !circleNodes.has(node))
      .forEach((reaction) => {
        const coReactants: LayoutNode[] = []

        // sort the co-reactants based on whether they have incoming/outgoing edges
        this.getNeighbors(reaction)
          .toArray()
          .sort((n1, n2) => {
            if (isCoReactant(n1) && n1.inDegree > 1 && n2.inDegree === 0) {
              return 1
            } else if (isCoReactant(n1) && n1.outDegree > 1 && n2.outDegree === 0) {
              return -1
            }
            return 0
          })
          .forEach((neighbor) => {
            if (isEnzyme(neighbor)) {
              // create a constraint to place the enzymes before their associated reaction
              const enzymeOrderConstraint = organicConstraintData.addOrderConstraint(
                ConstraintOrientation.HORIZONTAL
              )
              enzymeOrderConstraint.mapper.set(neighbor, 1)
              enzymeOrderConstraint.mapper.set(reaction, 2)

              // create a constraint to align the enzymes horizontally with their associated reaction
              organicConstraintData.addAlignmentConstraint(
                ConstraintOrientation.HORIZONTAL,
                0
              ).source = [neighbor, reaction]

              handledNodes.add(neighbor)
            } else if (isCoReactant(neighbor) && !coReactants.includes(neighbor)) {
              coReactants.push(neighbor)

              // create a constraint to place the co-reactants after their associated reaction
              const coReactantOrderConstraint = organicConstraintData.addOrderConstraint(
                ConstraintOrientation.HORIZONTAL
              )
              coReactantOrderConstraint.mapper.set(reaction, 1)
              coReactantOrderConstraint.mapper.set(neighbor, 2)

              handledNodes.add(neighbor)
            }
          })

        // create a constraint to vertically align the co-reactants
        organicConstraintData.addAlignmentConstraint(ConstraintOrientation.VERTICAL).source =
          coReactants

        // create a constraint to order the co-reactants based on whether they have
        // incoming/outgoing edges
        const orderConstraint = organicConstraintData.addOrderConstraint(
          ConstraintOrientation.VERTICAL
        )
        orderConstraint.mapper.set(coReactants[0], 1)
        orderConstraint.mapper.set(coReactants[1], 2)
        handledNodes.add(reaction)
      })
  }
}

/**
 * Calculates the bounds of the cycle based on the nodes' layout and reduces it with some insets
 * to make sure that the enzymes are placed inside the circle.
 */
function calculateCircleBounds(circleNodes: LayoutNode[]): Rect {
  return circleNodes
    .reduce((bounds, node) => Rect.add(bounds, node.layout.bounds), Rect.EMPTY)
    .getReduced(200)
}

/**
 * Checks whether the given node is connected to a node on the circle.
 */
function connectsToCircle(node: LayoutNode, circleNodes: Set<LayoutNode>): boolean {
  return (
    node.edges.find((edge) => circleNodes.has(edge.source) || circleNodes.has(edge.target)) !== null
  )
}

/**
 * Returns the angle of the given node that defines its position on the circle.
 */
function getAngle(x: number, y: number, cx: number, cy: number): number {
  let angle = Math.atan2(y - cy, x - cx)
  if (angle < 0) {
    angle += 2 * Math.PI
  }
  return (angle * 180) / Math.PI
}

/**
 * Returns the orientation for the alignment based on the position of the node on the circle.
 */
function getOrientation(x: number, y: number, circleCenter: Point): ConstraintOrientation {
  const angle = getAngle(x, y, circleCenter.x, circleCenter.y)
  return (angle > 40 && angle < 120) || (angle > 240 && angle < 250)
    ? ConstraintOrientation.HORIZONTAL
    : ConstraintOrientation.VERTICAL
}

/**
 * Calculates the circle's center based on the given three points.
 */
function calculateCircleCenter(circleNodes: LayoutNode[]): Point {
  const { x: p1x, y: p1y } = circleNodes[0].layout.center
  const { x: p2x, y: p2y } = circleNodes[1].layout.center
  const { x: p3x, y: p3y } = circleNodes[2].layout.center
  const det = 2 * (p1x * p2y - p2x * p1y - p1x * p3y + p3x * p1y + p2x * p3y - p3x * p2y)
  const a = p1x * p1x + p1y * p1y
  const b = p2x * p2x + p2y * p2y
  const c = p3x * p3x + p3y * p3y
  const centerX = (a * (p2y - p3y) + b * (p3y - p1y) + c * (p1y - p2y)) / det
  const centerY = (a * (p3x - p2x) + b * (p1x - p3x) + c * (p2x - p1x)) / det
  return new Point(centerX, centerY)
}

/**
 * Returns whether the given node represents a reaction.
 */
function isReaction(node: LayoutNode | INode): boolean {
  return getType(node) === NodeTypes.REACTION
}

/**
 * Returns whether the given node represents an enzyme.
 */
function isEnzyme(node: LayoutNode | INode): boolean {
  return getType(node) === NodeTypes.ENZYME
}

/**
 * Returns whether the given node represents a co-reactant.
 */
function isCoReactant(node: LayoutNode | INode): boolean {
  return getType(node) === NodeTypes.CO_REACTANT
}

/**
 * Returns whether the given node has type 'OTHER'.
 */
function isOther(node: LayoutNode | INode): boolean {
  return getType(node) === NodeTypes.OTHER
}
