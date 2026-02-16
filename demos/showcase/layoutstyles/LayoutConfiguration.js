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
  Class,
  EdgeLabelPreferredPlacement,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GenericLayoutData,
  IEdge,
  INode,
  LabelAlongEdgePlacements,
  LabelAngleReferences,
  LabelEdgeSides,
  LayoutExecutor,
  SubgraphLayoutStageData
} from '@yfiles/yfiles'

/**
 * Abstract base class for configurations that can be displayed in an {@link OptionEditor}.
 */
export const LayoutConfiguration = Class('LayoutConfiguration', {
  $abstract: true,

  /**
   * A guard to prevent running multiple layout calculations at the same time.
   * @type {boolean}
   */
  $layoutRunning: false,

  /**
   * Applies this configuration to the given {@link GraphComponent}.
   *
   * This is the main method of this class. Typically, it calls
   * {@link LayoutConfiguration.createConfiguredLayout} to create and configure a layout.
   * Then, it calculates a layout and applies it to
   * the given `graphComponent`. Finally, this method invokes
   * {@link LayoutConfiguration.postProcess} after the calculation.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @param doneHandler An optional function that is invoked after the layout finished
   */
  apply: async function (graphComponent, doneHandler) {
    if (this.$layoutRunning) {
      setTimeout(doneHandler, 10)
      return
    }

    const layout = this.createConfiguredLayout(graphComponent)
    if (layout === null) {
      setTimeout(doneHandler, 10)
      return
    }
    const layoutData = this.createConfiguredLayoutData(graphComponent, layout)

    // configure the LayoutExecutor
    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      layout,
      // set the cancel duration for the layout computation to 20s
      cancelDuration: '20s',
      animationDuration: '0.75s',
      animateViewport: true,
      easedAnimation: true
    })

    // set the layout data to the LayoutExecutor
    if (layoutData) {
      layoutExecutor.layoutData = layoutData
    }
    // start the LayoutExecutor with finish and error handling code
    try {
      await layoutExecutor.start()
    } catch (err) {
      if (err instanceof Error && err.name === 'AlgorithmAbortedError') {
        alert(
          'The layout computation was canceled because the maximum configured runtime of 20 seconds was exceeded.'
        )
      } else {
        reportError(err)
      }
    } finally {
      this.$layoutRunning = false
      this.postProcess(graphComponent)
    }
    doneHandler()
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    return null
  },

  /**
   * Called by {@link LayoutConfiguration.runLayout} after the layout animation is done. This method is
   * typically overridden to remove mappers from the mapper registry of the graph.
   */
  postProcess: function (graphComponent) {},

  /**
   * Called by {@link LayoutConfiguration.apply} to create the layout data of the configuration. This
   * method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    return null
  },

  /**
   * The title of the layout algorithm that is managed by this configuration.
   */
  title: 'Layout Algorithm',

  collapsedInitialization: false,

  /**
   * Adds a mapper with a {@link EdgeLabelPreferredPlacement} that matches the given settings
   * to the mapper registry of the given graph. In addition, sets the label model of all node and edge
   * labels to free since that model can realizes any label placement calculated by a layout algorithm.
   */
  createLabelingLayoutData: function (
    graph,
    placeAlongEdge,
    sideOfEdge,
    orientation,
    distanceToEdge
  ) {
    const descriptor = this.createPreferredPlacementDescriptor(
      placeAlongEdge,
      sideOfEdge,
      orientation,
      distanceToEdge
    )

    //change to a free edge label model to support integrated edge labeling
    const freeEdgeLabelModel = new FreeEdgeLabelModel()
    graph.edgeLabels.forEach((label) => {
      if (!(label.layoutParameter.model instanceof FreeEdgeLabelModel)) {
        graph.setLabelLayoutParameter(
          label,
          freeEdgeLabelModel.findBestParameter(label, label.layout)
        )
      }
    })

    //change to a free node label model to support generic node labeling
    const freeNodeLabelModel = new FreeNodeLabelModel()
    graph.nodeLabels.forEach((label) => {
      if (!(label.layoutParameter.model instanceof FreeNodeLabelModel)) {
        graph.setLabelLayoutParameter(
          label,
          freeNodeLabelModel.findBestParameter(label, label.layout)
        )
      }
    })

    const layoutData = new GenericLayoutData()
    layoutData.addItemMapping(
      EdgeLabelPreferredPlacement.EDGE_LABEL_PREFERRED_PLACEMENT_DATA_KEY
    ).constant = descriptor
    return layoutData
  },

  /**
   * Creates a layout data for {@link SubgraphLayoutStage} that is based on the selection model of
   * the given graph component.
   * If a node, edge or label is selected in the given graph component model, then it will be
   * part of the subgraph items in the respective property of
   * {@link SubgraphLayoutStageData{TNode,TEdge,TNodeLabel,TEdgeLabel}.
   * @param graphComponent tThe graphComponent to create the data for
   * @returns A layout data instance for {@link SubgraphLayoutStage} were items that are actually
   * selected in the given graph control are part of the subgraph
   */
  createSubgraphLayoutData(graphComponent) {
    return new SubgraphLayoutStageData({
      subgraphNodes: graphComponent.selection.nodes,
      subgraphEdges: graphComponent.selection.edges,
      subgraphNodeLabels: graphComponent.selection.labels.filter((l) => l.owner instanceof INode),
      subgraphEdgeLabels: graphComponent.selection.labels.filter((l) => l.owner instanceof IEdge)
    })
  },

  /**
   * Creates a new {@link EdgeLabelPreferredPlacement} that matches the given settings.
   */
  createPreferredPlacementDescriptor: function (
    placeAlongEdge,
    sideOfEdge,
    orientation,
    distanceToEdge
  ) {
    const descriptor = new EdgeLabelPreferredPlacement()

    switch (sideOfEdge) {
      case 'anywhere':
        descriptor.edgeSide = LabelEdgeSides.ANYWHERE
        break
      case 'on-edge':
        descriptor.edgeSide = LabelEdgeSides.ON_EDGE
        break
      case 'left':
        descriptor.edgeSide = LabelEdgeSides.LEFT_OF_EDGE
        break
      case 'right':
        descriptor.edgeSide = LabelEdgeSides.RIGHT_OF_EDGE
        break
      case 'left-or-right':
        descriptor.edgeSide = LabelEdgeSides.LEFT_OF_EDGE | LabelEdgeSides.RIGHT_OF_EDGE
        break
      default:
        descriptor.edgeSide = LabelEdgeSides.ANYWHERE
        break
    }

    switch (placeAlongEdge) {
      case 'anywhere':
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.ANYWHERE
        break
      case 'at-source':
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.AT_SOURCE
        break
      case 'at-source-port':
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.AT_SOURCE_PORT
        break
      case 'at-target':
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.AT_TARGET
        break
      case 'at-target-port':
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.AT_TARGET_PORT
        break
      case 'centered':
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.AT_CENTER
        break
      default:
        descriptor.placementAlongEdge = LabelAlongEdgePlacements.ANYWHERE
        break
    }

    switch (orientation) {
      case 'parallel':
        descriptor.angle = 0.0
        descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
        break
      case 'orthogonal':
        descriptor.angle = Math.PI / 2
        descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
        break
      case 'horizontal':
        descriptor.angle = 0.0
        descriptor.angleReference = LabelAngleReferences.ABSOLUTE
        break
      case 'vertical':
        descriptor.angle = Math.PI / 2
        descriptor.angleReference = LabelAngleReferences.ABSOLUTE
        break
      default:
        descriptor.angle = 0.0
        descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
        break
    }

    descriptor.distanceToEdge = distanceToEdge
    return descriptor
  }
})

/**
 * Specifies constants for the preferred placement along an edge used by layout configurations.
 */
export const LabelPlacementAlongEdge = {
  ANYWHERE: 0,
  AT_SOURCE: 1,
  AT_TARGET: 2,
  CENTERED: 3,
  AT_SOURCE_PORT: 4,
  AT_TARGET_PORT: 5
}

/**
 * Specifies constants for the preferred placement at a side of an edge used by layout configurations.
 */
export const LabelPlacementSideOfEdge = {
  ANYWHERE: 0,
  ON_EDGE: 1,
  LEFT: 2,
  RIGHT: 3,
  LEFT_OR_RIGHT: 4
}

/**
 * Specifies constants for the orientation of an edge label used by layout configurations.
 */
export const LabelPlacementOrientation = { PARALLEL: 0, ORTHOGONAL: 1, HORIZONTAL: 2, VERTICAL: 3 }

export const Scope = {
  ROUTE_ALL_EDGES: 0,
  ROUTE_AFFECTED_EDGES: 1,
  ROUTE_EDGES_AT_AFFECTED_NODES: 2
}

export const OperationType = {
  MIRROR_X_AXIS: 0,
  MIRROR_Y_AXIS: 1,
  ROTATE: 2,
  SCALE: 3,
  TRANSLATE: 4
}
