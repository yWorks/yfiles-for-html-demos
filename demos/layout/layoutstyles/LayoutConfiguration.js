/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Enum,
  FreeEdgeLabelModel,
  GraphComponent,
  IEdgeLabelLayout,
  ILabel,
  LabelAngleReferences,
  LabelPlacements,
  LayoutExecutor,
  LayoutGraphAdapter,
  MinimumNodeSizeStage,
  PreferredPlacementDescriptor
} from 'yfiles'

/**
 * Abstract base class for configurations that can be displayed in an {@link OptionEditor}.
 */
const LayoutConfiguration = Class('LayoutConfiguration', {
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
   * {@link LayoutConfiguration#createConfiguredLayout} to create and configure a layout and the graph's
   * {@link IGraph#mapperRegistry} if necessary. Then, it  calculate a layout and applies it to
   * the given <code>graphComponent</code>. Finally, this method invokes
   * {@link LayoutConfiguration#postProcess} after the calculation.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @param {function()} doneHandler An optional function that is invoked after the layout finished
   */
  apply: async function(graphComponent, doneHandler) {
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
      layout: new MinimumNodeSizeStage(layout),
      duration: '1s',
      animateViewport: true
    })
    // set the cancel duration for the layout computation to 20s
    if (layoutData && layoutData.abortHandler) {
      layoutData.abortHandler.cancelDuration = '20s'
    } else {
      layoutExecutor.abortHandler.cancelDuration = '20s'
    }

    // set the layout data to the LayoutExecutor
    if (layoutData) {
      layoutExecutor.layoutData = layoutData
    }
    // start the LayoutExecutor with finish and error handling code
    try {
      await layoutExecutor.start()
    } catch (error) {
      if (error.name === 'AlgorithmAbortedError') {
        alert(
          'The layout computation was canceled because the maximum configured runtime of 20 seconds was exceeded.'
        )
      } else if (typeof window.reportError === 'function') {
        window.reportError(error)
      }
    } finally {
      this.$layoutRunning = false
      this.postProcess(graphComponent)
    }
    doneHandler()
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function(graphComponent) {
    return null
  },

  /**
   * Called by {@link LayoutConfiguration#runLayout} after the layout animation is done. This method is
   * typically overridden to remove mappers from the mapper registry of the graph.
   */
  postProcess: function(graphComponent) {},

  /**
   * Called by {@link LayoutConfiguration#apply} to create the layout data of the configuration. This
   * method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function(graphComponent, layout) {
    return null
  },

  $static: {
    /**
     * Adds a mapper with a {@link PreferredPlacementDescriptor} that matches the given settings
     * to the mapper registry of the given graph. In addition, sets the label model of all edge labels to free
     * since that model can realizes any label placement calculated by a layout algorithm.
     */
    addPreferredPlacementDescriptor: function(
      graph,
      placeAlongEdge,
      sideOfEdge,
      orientation,
      distanceToEdge
    ) {
      const descriptor = LayoutConfiguration.createPreferredPlacementDescriptor(
        placeAlongEdge,
        sideOfEdge,
        orientation,
        distanceToEdge
      )

      graph.mapperRegistry.createConstantMapper(
        ILabel.$class,
        IEdgeLabelLayout.$class,
        LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
        descriptor
      )

      // change to a free edge label model to support integrated edge labeling
      const model = new FreeEdgeLabelModel()
      graph.edgeLabels.forEach(label => {
        if (!(label.layoutParameter.model instanceof FreeEdgeLabelModel)) {
          graph.setLabelLayoutParameter(label, model.findBestParameter(label, model, label.layout))
        }
      })
    },

    /**
     * Creates a new {@link PreferredPlacementDescriptor} that matches the given settings.
     * @return {PreferredPlacementDescriptor}
     */
    createPreferredPlacementDescriptor: function(
      placeAlongEdge,
      sideOfEdge,
      orientation,
      distanceToEdge
    ) {
      const descriptor = new PreferredPlacementDescriptor()

      switch (sideOfEdge) {
        case LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE:
          descriptor.sideOfEdge = LabelPlacements.ANYWHERE
          break
        case LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE:
          descriptor.sideOfEdge = LabelPlacements.ON_EDGE
          break
        case LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT:
          descriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
          break
        case LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT:
          descriptor.sideOfEdge = LabelPlacements.RIGHT_OF_EDGE
          break
        case LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT:
          descriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE | LabelPlacements.RIGHT_OF_EDGE
          break
        default:
          descriptor.sideOfEdge = LabelPlacements.ANYWHERE
          break
      }

      switch (placeAlongEdge) {
        case LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE:
          descriptor.placeAlongEdge = LabelPlacements.ANYWHERE
          break
        case LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE:
          descriptor.placeAlongEdge = LabelPlacements.AT_SOURCE
          break
        case LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE_PORT:
          descriptor.placeAlongEdge = LabelPlacements.AT_SOURCE_PORT
          break
        case LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET:
          descriptor.placeAlongEdge = LabelPlacements.AT_TARGET
          break
        case LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET_PORT:
          descriptor.placeAlongEdge = LabelPlacements.AT_TARGET_PORT
          break
        case LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED:
          descriptor.placeAlongEdge = LabelPlacements.AT_CENTER
          break
        default:
          descriptor.placeAlongEdge = LabelPlacements.ANYWHERE
          break
      }

      switch (orientation) {
        case LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL:
          descriptor.angle = 0.0
          descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
          break
        case LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL:
          descriptor.angle = Math.PI / 2
          descriptor.angleReference = LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
          break
        case LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL:
          descriptor.angle = 0.0
          descriptor.angleReference = LabelAngleReferences.ABSOLUTE
          break
        case LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL:
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
    },

    /**
     * Specifies constants for the preferred placement along an edge used by layout configurations.
     */
    EnumLabelPlacementAlongEdge: Enum('EnumLabelPlacementAlongEdge', {
      ANYWHERE: 0,
      AT_SOURCE: 1,
      AT_TARGET: 2,
      CENTERED: 3,
      AT_SOURCE_PORT: 4,
      AT_TARGET_PORT: 5
    }),

    /**
     * Specifies constants for the preferred placement at a side of an edge used by layout configurations.
     */
    EnumLabelPlacementSideOfEdge: Enum('EnumLabelPlacementSideOfEdge', {
      ANYWHERE: 0,
      ON_EDGE: 1,
      LEFT: 2,
      RIGHT: 3,
      LEFT_OR_RIGHT: 4
    }),

    /**
     * Specifies constants for the orientation of an edge label used by layout configurations.
     */
    EnumLabelPlacementOrientation: Enum('EnumLabelPlacementOrientation', {
      PARALLEL: 0,
      ORTHOGONAL: 1,
      HORIZONTAL: 2,
      VERTICAL: 3
    })
  }
})
export default LayoutConfiguration
