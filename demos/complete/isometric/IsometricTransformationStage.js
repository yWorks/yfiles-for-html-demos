/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-layout-bridge', 'IsometricTransformationSupport.js', 'IsometricStyles.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  IsometricTransformationSupport,
  IsometricStyles
) => {
  const TRANSFORMATION_DATA_DP_KEY = Symbol('TransformationDataDpKey')

  const GROUP_NODE_INSET = 20

  /**
   * A {@link yfiles.layout.ILayoutStage} that transforms the graph to layout space before layout calculation is done
   * and transforms the graph back to the view space afterwards. The layout space is base area of the isometric space.
   * The view space contains the projection of the isometric space.
   */
  class IsometricTransformationLayoutStage extends yfiles.layout.LayoutStageBase {
    /**
     * {@link yfiles.algorithms.IDataProvider} key used to store transformation data to transform sizes and positions
     * of nodes to the layout space and the view space.
     * @type {Symbol}
     */
    static get TRANSFORMATION_DATA_DP_KEY() {
      return TRANSFORMATION_DATA_DP_KEY
    }

    /**
     * Creates a new instance of IsometricTransformationLayoutStage.
     * @param {yfiles.layout.ILayoutAlgorithm} coreLayout
     * @param {boolean} fromSketchMode
     */
    constructor(coreLayout, fromSketchMode) {
      super(coreLayout)
      this.$fromSketchMode = fromSketchMode
    }

    /**
     * Determines whether or not this layout stage transforms the coordinates of the graph elements before calculating
     * layout. This is important for incremental layout.
     * @return {boolean} <code>true</code> if graph elements get transformed before layout, <code>false</code>
     *   otherwise.
     */
    get fromSketchMode() {
      return this.$fromSketchMode
    }

    /**
     * Specifies whether or not this layout stage transforms the coordinates of the graph elements before calculating
     * layout. This is important for incremental layout.
     * @param {boolean} value <code>true</code> if graph elements get transformed before layout, <code>false</code>
     *                       otherwise.
     */
    set fromSketchMode(value) {
      this.$fromSketchMode = value
    }

    /**
     * Transforms the graph to the layout space, lay it out using the core layout and transforms the result back into
     * the view space.
     * @param {yfiles.layout.LayoutGraph} graph the graph to lay out
     */
    applyLayout(graph) {
      // Since our group node configuration does not provide an AutoBoundsFeature instance, the group node insets will
      // not be passed to the layout graph by the Graph2DLayoutExecutor. Therefore, we are set here an appropriate data
      // provider manually.
      const oldGroupNodeInsets = graph.getDataProvider(
        yfiles.layout.GroupingKeys.GROUP_NODE_INSETS_DP_KEY
      )
      const oldMinimumNodeSizes = graph.getDataProvider(
        yfiles.layout.GroupingKeys.MINIMUM_NODE_SIZE_DP_KEY
      )
      const groupNodeInsets = yfiles.algorithms.Maps.createHashedNodeMap()
      const minimumNodeSizes = yfiles.algorithms.Maps.createHashedNodeMap()

      /**
       * To assure that a group node is always wide enough to contain its label and group state icon a minimum node size
       * is calculated for each group node.
       */
      graph.nodes.forEach(node => {
        const labels = graph.getLabelLayout(node)
        if (labels.length > 0) {
          const label = labels[0]
          groupNodeInsets.set(
            node,
            new yfiles.algorithms.Insets(
              GROUP_NODE_INSET,
              GROUP_NODE_INSET,
              GROUP_NODE_INSET + label.boundingBox.height,
              GROUP_NODE_INSET
            )
          )

          minimumNodeSizes.set(
            node,
            new yfiles.algorithms.YDimension(
              label.boundingBox.width +
                IsometricStyles.GroupNodeStyle.ICON_WIDTH +
                IsometricStyles.GroupNodeStyle.ICON_GAP * 2,
              0
            )
          )
        }
      })

      graph.addDataProvider(yfiles.layout.GroupingKeys.GROUP_NODE_INSETS_DP_KEY, groupNodeInsets)
      graph.addDataProvider(yfiles.layout.GroupingKeys.MINIMUM_NODE_SIZE_DP_KEY, minimumNodeSizes)

      // Transform the graph to the layout space.
      this.transformGraph(graph, false, this.fromSketchMode)

      // Calculate the layout.
      this.applyLayoutCore(graph)

      // Transform the graph back to the view space.
      this.transformGraph(graph, true, this.fromSketchMode)

      // Restore the original group node insets and minimum size provider.
      graph.removeDataProvider(yfiles.layout.GroupingKeys.GROUP_NODE_INSETS_DP_KEY)
      if (oldGroupNodeInsets !== null) {
        graph.addDataProvider(
          yfiles.layout.GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
          oldGroupNodeInsets
        )
      }
      graph.removeDataProvider(yfiles.layout.GroupingKeys.MINIMUM_NODE_SIZE_DP_KEY)
      if (oldMinimumNodeSizes !== null) {
        graph.addDataProvider(
          yfiles.layout.GroupingKeys.MINIMUM_NODE_SIZE_DP_KEY,
          oldMinimumNodeSizes
        )
      }
    }

    /**
     * Transforms the all edge points, node positions and sizes to the view or layout space.
     * @param {yfiles.layout.LayoutGraph} graph  the graph to transform
     * @param {boolean} toView <code>true</code> to transform the given point to the view space, <code>false</code> to
     *   the layout space
     * @param {boolean} fromSketchMode <code>true</code> when the initial layout is taken into account,
     *   <code>false</code> otherwise
     */
    transformGraph(graph, toView, fromSketchMode) {
      // The transformation changes the size of the nodes. To avoid that this changes the position of the source and
      // target points of the edges, they are stored before the transformation and restored afterwards.
      const sourcePoints = yfiles.algorithms.Maps.createHashedEdgeMap()
      const targetPoints = yfiles.algorithms.Maps.createHashedEdgeMap()
      graph.edges.forEach(edge => {
        sourcePoints.set(edge, graph.getSourcePointAbs(edge))
        targetPoints.set(edge, graph.getTargetPointAbs(edge))
      })

      // Transform the node sizes and locations.
      const transformationData = graph.getDataProvider(
        IsometricTransformationLayoutStage.TRANSFORMATION_DATA_DP_KEY
      )
      graph.nodes.forEach(node => {
        const nodeLayout = graph.getLayout(node)
        const data = transformationData.get(node)

        if (toView) {
          const oldWidth = nodeLayout.width
          const oldHeight = nodeLayout.height
          const oldCenterX = nodeLayout.x + oldWidth * 0.5
          const oldCenterY = nodeLayout.y + oldHeight * 0.5
          // Store the width and height calculated by the core layout. This is necessary for group nodes!
          data.width = oldWidth
          data.depth = oldHeight

          const bounds = IsometricTransformationSupport.calculateViewBounds(data)
          const newWidth = bounds.width
          const newHeight = bounds.height
          const newCenterX = IsometricTransformationSupport.toViewX(oldCenterX, oldCenterY)
          const newCenterY =
            IsometricTransformationSupport.toViewY(oldCenterX, oldCenterY) - data.height * 0.5
          nodeLayout.setSize(newWidth, newHeight)
          nodeLayout.setLocation(newCenterX - newWidth * 0.5, newCenterY - newHeight * 0.5)
        } else {
          const oldCenterX = nodeLayout.x + nodeLayout.width * 0.5
          const oldCenterY = nodeLayout.y + nodeLayout.height * 0.5 + data.height * 0.5
          const newCenterX = IsometricTransformationSupport.toLayoutX(oldCenterX, oldCenterY)
          const newCenterY = IsometricTransformationSupport.toLayoutY(oldCenterX, oldCenterY)
          const newWidth = data.width
          const newHeight = data.depth
          nodeLayout.setSize(newWidth, newHeight)
          if (fromSketchMode) {
            nodeLayout.setLocation(newCenterX - newWidth * 0.5, newCenterY - newHeight * 0.5)
          }
        }
      })

      // Transform bends and end points for all edges in the graph.
      graph.edges.forEach(edge => {
        const edgeLayout = graph.getLayout(edge)
        for (let i = 0; i < edgeLayout.pointCount(); i++) {
          const point = edgeLayout.getPoint(i)
          const transformedPoint = this.transformPoint(point, toView, fromSketchMode)
          edgeLayout.setPoint(i, transformedPoint.x, transformedPoint.y)
        }

        // Restore the position of the source and target points of the edges.
        graph.setSourcePointAbs(
          edge,
          this.transformPoint(sourcePoints.get(edge), toView, fromSketchMode)
        )
        graph.setTargetPointAbs(
          edge,
          this.transformPoint(targetPoints.get(edge), toView, fromSketchMode)
        )
      })

      if (toView) {
        graph.edges.forEach(edge => {
          const edgeLabelMap = graph.getDataProvider(
            yfiles.layout.LabelLayoutKeys.EDGE_LABEL_LAYOUT_DP_KEY
          )
          const labels = graph.getLabelLayout(edge)
          const labelLayoutData = edgeLabelMap.get(edge)
          const edgeLayout = graph.getLayout(edge)
          const sourceLayout = graph.getLayout(edge.source)
          if (labelLayoutData) {
            const targetLayout = graph.getLayout(edge.target)
            for (let i = 0; i < labels.length; i++) {
              const label = labels[i]
              const labelData = labelLayoutData[i]
              const oldWidth = labelData.width
              const oldHeight = labelData.height
              const oldCenterX = labelData.x + oldWidth * 0.5
              const oldCenterY = labelData.y + oldHeight * 0.5
              // Store the width and height calculated by the core layout. This is necessary for group nodes!
              const data = transformationData.get(label)
              const labelBounds = labelData.bounds
              data.horizontal = labelBounds.upY === -1 || labelBounds.upY === 1
              data.width = oldWidth
              data.depth = oldHeight

              const bounds = IsometricTransformationSupport.calculateViewBounds(data)
              const newWidth = bounds.width
              const newHeight = bounds.height
              const newCenterX = IsometricTransformationSupport.toViewX(oldCenterX, oldCenterY)
              const newCenterY =
                IsometricTransformationSupport.toViewY(oldCenterX, oldCenterY) - data.height * 0.5

              const newBounds = new yfiles.algorithms.YOrientedRectangle(
                newCenterX - newWidth * 0.5,
                newCenterY + newHeight * 0.5,
                newWidth,
                newHeight
              )
              const parameter = label.labelModel.createModelParameter(
                newBounds,
                edgeLayout,
                sourceLayout,
                targetLayout
              )
              const labelPlacement = label.labelModel.getLabelPlacement(
                newBounds.size,
                edgeLayout,
                sourceLayout,
                targetLayout,
                parameter
              )
              label.modelParameter = parameter
              label.orientedBox.adoptValues(labelPlacement)
            }
          }
        })
        graph.removeDataProvider(yfiles.layout.LabelLayoutKeys.EDGE_LABEL_LAYOUT_DP_KEY)
      } else {
        const edgeLabelMap = yfiles.algorithms.Maps.createHashedEdgeMap()
        graph.edges.forEach(edge => {
          const labels = graph.getLabelLayout(edge)
          const labelLayoutData = new Array(labels.length)
          for (let i = 0; i < labels.length; i++) {
            const label = labels[i]
            const data = transformationData.get(label)
            if (data.horizontal) {
              labelLayoutData[i] = new yfiles.layout.LabelLayoutData(data.width, data.depth)
            } else {
              labelLayoutData[i] = new yfiles.layout.LabelLayoutData(data.depth, data.width)
            }
            labelLayoutData[i].preferredPlacementDescriptor = label.preferredPlacementDescriptor
          }
          edgeLabelMap.set(edge, labelLayoutData)
        })
        graph.addDataProvider(yfiles.layout.LabelLayoutKeys.EDGE_LABEL_LAYOUT_DP_KEY, edgeLabelMap)
      }
    }

    /**
     * Transforms the given point to the view or layout space.
     * @param {yfiles.algorithms.YPoint} point  the point to transform
     * @param {boolean} toView <code>true</code> to transform the given point to the view space, <code>false</code> to
     *   the layout space
     * @param {boolean} fromSketchMode <code>true</code> when the initial layout is taken into account,
     *   <code>false</code> otherwise
     * @return {yfiles.algorithms.YPoint}
     */
    transformPoint(point, toView, fromSketchMode) {
      const x = point.x
      const y = point.y

      if (toView) {
        return new yfiles.algorithms.YPoint(
          IsometricTransformationSupport.toViewX(x, y),
          IsometricTransformationSupport.toViewY(x, y)
        )
      } else if (fromSketchMode) {
        return new yfiles.algorithms.YPoint(
          IsometricTransformationSupport.toLayoutX(x, y),
          IsometricTransformationSupport.toLayoutY(x, y)
        )
      }
      return point
    }
  }

  return IsometricTransformationLayoutStage
})
