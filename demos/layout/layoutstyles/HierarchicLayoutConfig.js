/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

/*eslint-disable*/
;(function(r) {
  ;(function(f) {
    if ('function' === typeof define && define.amd) {
      define(['yfiles/lang', 'yfiles/view-component', 'LayoutConfiguration.js'], f)
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })((lang, yfiles) => {
    const demo = yfiles.module('demo')
    yfiles.module('demo', exports => {
      /**
       * Configuration options for the layout algorithm of the same name.
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.HierarchicLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.HierarchicLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('HierarchicLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)
            this.groupHorizontalCompactionItem = yfiles.hierarchic.GroupCompactionPolicy.NONE
            this.groupAlignmentItem = yfiles.hierarchic.GroupAlignmentPolicy.TOP
            this.considerNodeLabelsItem = true
            this.maximumSizeItem = 1000.0
            this.scaleItem = 1.0
            this.componentArrangementPolicyItem =
              yfiles.hierarchic.ComponentArrangementPolicy.TOPMOST
            this.nodeCompactionItem = false
            this.rankingPolicyItem = yfiles.hierarchic.LayeringStrategy.HIERARCHICAL_OPTIMAL
            this.minimumSlopeItem = 0.25
            this.edgeDirectednessItem = true
            this.edgeThicknessItem = true
            this.minimumEdgeDistanceItem = 15.0
            this.minimumEdgeLengthItem = 20.0
            this.minimumLastSegmentLengthItem = 15.0
            this.minimumFirstSegmentLengthItem = 10.0
            this.edgeRoutingItem = yfiles.hierarchic.EdgeRoutingStyle.ORTHOGONAL
            this.minimumLayerDistanceItem = 10.0
            this.edgeToEdgeDistanceItem = 15.0
            this.nodeToEdgeDistanceItem = 15.0
            this.nodeToNodeDistanceItem = 30.0
            this.symmetricPlacementItem = true
            this.recursiveEdgeStyleItem = yfiles.hierarchic.RecursiveEdgeStyle.OFF
            this.maximumDurationItem = 5
            this.edgeLabelingItem = demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE
            this.compactEdgeLabelPlacementItem = true
            this.labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
            this.labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
            this.labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
            this.labelPlacementDistanceItem = 10.0
            this.groupLayeringStrategyItem =
              demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS
            this.gridEnabledItem = false
            this.gridSpacingItem = 5
            this.gridPortAssignmentItem = yfiles.hierarchic.PortAssignmentMode.DEFAULT
            this.orientationItem = yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.hierarchic.HierarchicLayout()

            //  mark incremental elements if required
            const fromSketch = this.UseDrawingAsSketchItem
            const incrementalLayout = this.SelectedElementsIncrementallyItem
            const selectedElements =
              graphComponent.selection.selectedEdges.size !== 0 ||
              graphComponent.selection.selectedNodes.size !== 0

            if (incrementalLayout && selectedElements) {
              layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
            } else if (fromSketch) {
              layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
            } else {
              layout.layoutMode = yfiles.hierarchic.LayoutMode.FROM_SCRATCH
            }

            layout.nodePlacer.barycenterMode = this.symmetricPlacementItem

            layout.componentLayoutEnabled = this.LayoutComponentsSeparatelyItem

            layout.minimumLayerDistance = this.minimumLayerDistanceItem
            layout.nodeToEdgeDistance = this.nodeToEdgeDistanceItem
            layout.nodeToNodeDistance = this.nodeToNodeDistanceItem
            layout.edgeToEdgeDistance = this.edgeToEdgeDistanceItem

            const nld = layout.nodeLayoutDescriptor
            const eld = layout.edgeLayoutDescriptor

            layout.automaticEdgeGrouping = this.automaticEdgeGroupingEnabledItem

            eld.routingStyle = new yfiles.hierarchic.RoutingStyle(this.edgeRoutingItem)
            eld.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
            eld.minimumLastSegmentLength = this.minimumLastSegmentLengthItem

            eld.minimumDistance = this.minimumEdgeDistanceItem
            eld.minimumLength = this.minimumEdgeLengthItem

            eld.minimumSlope = this.minimumSlopeItem

            eld.sourcePortOptimization = this.pcOptimizationEnabledItem
            eld.targetPortOptimization = this.pcOptimizationEnabledItem

            eld.recursiveEdgeStyle = this.recursiveEdgeStyleItem

            nld.minimumDistance = Math.min(layout.nodeToNodeDistance, layout.nodeToEdgeDistance)
            nld.minimumLayerHeight = 0
            nld.layerAlignment = this.layerAlignmentItem

            layout.orientationLayout.orientation = this.orientationItem

            if (this.considerNodeLabelsItem) {
              layout.considerNodeLabels = true
              layout.nodeLayoutDescriptor.nodeLabelMode =
                yfiles.hierarchic.NodeLabelMode.CONSIDER_FOR_DRAWING
            } else {
              layout.considerNodeLabels = false
            }

            if (this.edgeLabelingItem !== demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE) {
              if (this.edgeLabelingItem === demo.HierarchicLayoutConfig.EnumEdgeLabeling.GENERIC) {
                layout.integratedEdgeLabeling = false

                const labeling = new yfiles.labeling.GenericLabeling()
                labeling.placeEdgeLabels = true
                labeling.placeNodeLabels = false
                labeling.autoFlipping = true
                labeling.reduceAmbiguity = this.reduceAmbiguityItem
                labeling.profitModel = new yfiles.layout.SimpleProfitModel()
                layout.labelingEnabled = true
                layout.labeling = labeling
              } else if (
                this.edgeLabelingItem === demo.HierarchicLayoutConfig.EnumEdgeLabeling.INTEGRATED
              ) {
                layout.integratedEdgeLabeling = true
                layout.nodePlacer.labelCompaction = this.compactEdgeLabelPlacementItem
              }
            } else {
              layout.integratedEdgeLabeling = false
            }

            layout.fromScratchLayeringStrategy = this.rankingPolicyItem
            layout.componentArrangementPolicy = this.componentArrangementPolicyItem
            layout.nodePlacer.nodeCompaction = this.nodeCompactionItem
            layout.nodePlacer.straightenEdges = this.straightenEdgesItem

            // configure AsIsLayerer
            const layerer =
              layout.layoutMode === yfiles.hierarchic.LayoutMode.FROM_SCRATCH
                ? layout.fromScratchLayerer
                : layout.fixedElementsLayerer
            if (layerer instanceof yfiles.hierarchic.AsIsLayerer) {
              layerer.nodeHalo = this.haloItem
              layerer.nodeScalingFactor = this.scaleItem
              layerer.minimumNodeSize = this.minimumSizeItem
              layerer.maximumNodeSize = this.maximumSizeItem
            }

            // configure grouping
            layout.nodePlacer.groupCompactionStrategy = this.groupHorizontalCompactionItem

            if (
              !fromSketch &&
              this.groupLayeringStrategyItem ===
                demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS
            ) {
              layout.groupAlignmentPolicy = this.groupAlignmentItem
              layout.compactGroups = this.groupEnableCompactionItem
              layout.recursiveGroupLayering = true
            } else {
              layout.recursiveGroupLayering = false
            }

            if (this.treatRootGroupAsSwimlanesItem) {
              const stage = new yfiles.hierarchic.TopLevelGroupToSwimlaneStage()
              stage.orderSwimlanesFromSketch = this.useOrderFromSketchItem
              stage.spacing = this.swimlineSpacingItem
              layout.appendStage(stage)
            }

            layout.backLoopRouting = this.backloopRoutingItem
            layout.backLoopRoutingForSelfLoops = this.backloopRoutingForSelfLoopsItem
            layout.maximumDuration = this.maximumDurationItem * 1000

            demo.LayoutConfiguration.addPreferredPlacementDescriptor(
              graphComponent.graph,
              this.labelPlacementAlongEdgeItem,
              this.labelPlacementSideOfEdgeItem,
              this.labelPlacementOrientationItem,
              this.labelPlacementDistanceItem
            )

            if (this.gridEnabledItem) {
              layout.gridSpacing = this.gridSpacingItem
            }

            return layout
          },

          /**
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const layoutData = new yfiles.hierarchic.HierarchicLayoutData()

            const incrementalLayout = this.SelectedElementsIncrementallyItem
            const selectedElements =
              graphComponent.selection.selectedEdges.size !== 0 ||
              graphComponent.selection.selectedNodes.size !== 0

            if (incrementalLayout && selectedElements) {
              // configure the mode
              const ihf = layout.createIncrementalHintsFactory()
              layoutData.incrementalHints.delegate = item => {
                // Return the correct hint type for each model item that appears in one of these sets
                if (
                  yfiles.graph.INode.isInstance(item) &&
                  graphComponent.selection.isSelected(item)
                ) {
                  return ihf.createLayerIncrementallyHint(item)
                }
                if (
                  yfiles.graph.IEdge.isInstance(item) &&
                  graphComponent.selection.isSelected(item)
                ) {
                  return ihf.createSequenceIncrementallyHint(item)
                }
                return null
              }
            }

            if (this.rankingPolicyItem === yfiles.hierarchic.LayeringStrategy.BFS) {
              layoutData.bfsLayererCoreNodes.delegate = node =>
                graphComponent.selection.isSelected(node)
            }

            if (this.gridEnabledItem) {
              const nld = layout.nodeLayoutDescriptor
              layoutData.nodeLayoutDescriptors.delegate = node => {
                const descriptor = new yfiles.hierarchic.NodeLayoutDescriptor()
                descriptor.layerAlignment = nld.layerAlignment
                descriptor.minimumDistance = nld.minimumDistance
                descriptor.minimumLayerHeight = nld.minimumLayerHeight
                descriptor.nodeLabelMode = nld.nodeLabelMode
                // anchor nodes on grid according to their alignment within the layer
                descriptor.gridReference = new yfiles.algorithms.YPoint(
                  0.0,
                  (nld.layerAlignment - 0.5) * node.layout.height
                )
                descriptor.portAssignment = this.gridPortAssignmentItem
                return descriptor
              }
            }

            if (this.edgeDirectednessItem) {
              layoutData.edgeDirectedness.delegate = edge => {
                if (
                  edge.style.showTargetArrows ||
                  (edge.style.targetArrow && edge.style.targetArrow !== yfiles.styles.IArrow.NONE)
                ) {
                  return 1
                }
                return 0
              }
            }

            if (this.edgeThicknessItem) {
              layoutData.edgeThickness.delegate = edge => {
                const style = edge.style
                if (style instanceof yfiles.styles.PolylineEdgeStyle) {
                  return style.stroke.thickness
                }
                return 0
              }
            }

            if (this.subComponentsItem) {
              const treeLayout = new yfiles.tree.TreeLayout()
              treeLayout.defaultNodePlacer = new yfiles.tree.LeftRightNodePlacer()
              layoutData.subComponents.add(treeLayout).delegate = node =>
                node.labels.size > 0 && node.labels.first().text === 'TL'
              const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
              hierarchicLayout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
              layoutData.subComponents.add(hierarchicLayout).delegate = node =>
                node.labels.size > 0 && node.labels.first().text === 'HL'
              const organicLayout = new yfiles.organic.OrganicLayout()
              organicLayout.preferredEdgeLength = 100
              organicLayout.deterministic = true
              layoutData.subComponents.add(organicLayout).delegate = node =>
                node.labels.size > 0 && node.labels.first().text === 'OL'
            }

            return layoutData
          },

          /**
           * Enables different layout styles for possible detected subcomponents.
           */
          enableSubstructures: function() {
            this.subComponentsItem = true
          },

          /** @type {demo.options.OptionGroup} */
          DescriptionGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Description'),
                demo.options.OptionGroupAttribute('RootGroup', 5),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          GeneralGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('General'),
                demo.options.OptionGroupAttribute('RootGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          InteractionGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Interactive Settings'),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          DistanceGroup: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GeneralGroup', 60),
                demo.options.LabelAttribute('Minimum Distances'),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          EdgeSettingsGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edges'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          RankGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Layers'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          LabelingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Labeling'),
                demo.options.OptionGroupAttribute('RootGroup', 40),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          NodePropertiesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Node Settings'),
                demo.options.OptionGroupAttribute('LabelingGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          EdgePropertiesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edge Settings'),
                demo.options.OptionGroupAttribute('LabelingGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          PreferredPlacementGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Preferred Edge Label Placement'),
                demo.options.OptionGroupAttribute('LabelingGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          GroupingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Grouping'),
                demo.options.OptionGroupAttribute('RootGroup', 50),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          SwimlanesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Swimlanes'),
                demo.options.OptionGroupAttribute('RootGroup', 60),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          GridGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Grid'),
                demo.options.OptionGroupAttribute('RootGroup', 70),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {string} */
          descriptionText: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('DescriptionGroup', 10),
                demo.options.ComponentAttribute(demo.options.Components.HTML_BLOCK),
                demo.options.TypeAttribute(yfiles.lang.String.$class)
              ]
            },
            get: function() {
              return "<p style='margin-top:0'>The hierarchical layout style highlights the main direction or flow of a directed graph. It places the nodes of a graph in hierarchically arranged layers such that the (majority of) its edges follows the overall orientation, for example, top-to-bottom.</p><p>This style is tailored for application domains in which it is crucial to clearly visualize the dependency relations between entities. In particular, if such relations form a chain of dependencies between entities, this layout style nicely exhibits them. Generally, whenever the direction of information flow matters, the hierarchical layout style is an invaluable tool.</p><p>Suitable application domains of this layout style include, for example:</p><ul><li>Workflow visualization</li><li>Software engineering like call graph visualization or activity diagrams</li><li>Process modeling</li><li>Database modeling and Entity-Relationship diagrams</li><li>Bioinformatics, for example biochemical pathways</li><li>Network management</li><li>Decision diagrams</li></ul>"
            }
          },

          /** @type {boolean} */
          SelectedElementsIncrementallyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Selected Elements Incrementally',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-layoutMode'
                ),
                demo.options.OptionGroupAttribute('InteractionGroup', 10),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            value: false
          },

          /** @type {boolean} */
          UseDrawingAsSketchItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Drawing as Sketch',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-layoutMode'
                ),
                demo.options.OptionGroupAttribute('InteractionGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            value: false
          },

          /** @type {yfiles.layout.LayoutOrientation} */
          orientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.hierarchic.HierarchicLayout#MultiStageLayout-property-layoutOrientation'
                ),
                yfiles.graphml
                  .GraphMLAttribute()
                  .init({ defaultValue: yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM }),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top to Bottom', yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM],
                    ['Left to Right', yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT],
                    ['Bottom to Top', yfiles.layout.LayoutOrientation.BOTTOM_TO_TOP],
                    ['Right to Left', yfiles.layout.LayoutOrientation.RIGHT_TO_LEFT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.LayoutOrientation.$class)
              ]
            },
            value: null
          },

          /** @type {boolean} */
          LayoutComponentsSeparatelyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Components Separately',
                  '#/api/yfiles.hierarchic.HierarchicLayout#MultiStageLayout-property-componentLayoutEnabled'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            value: false
          },

          /** @type {boolean} */
          symmetricPlacementItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Symmetric Placement',
                  '#/api/yfiles.hierarchic.SimplexNodePlacer#SimplexNodePlacer-property-barycenterMode'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            value: false
          },

          /** @type {boolean} */
          subComponentsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Sub-components Separately',
                  '#/api/yfiles.hierarchic.HierarchicLayoutData#HierarchicLayoutData-property-subComponents'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 45),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            value: false
          },

          /** @type {number} */
          maximumDurationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Maximum Duration',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-maximumDuration'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 150
                }),
                demo.options.OptionGroupAttribute('GeneralGroup', 50),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            value: 0
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $nodeToNodeDistanceItem: 0,

          /** @type {number} */
          nodeToNodeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node to Node Distance',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-nodeToNodeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('DistanceGroup', 10),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$nodeToNodeDistanceItem
            },
            set: function(value) {
              this.$nodeToNodeDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $nodeToEdgeDistanceItem: 0,

          /** @type {number} */
          nodeToEdgeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node to Edge Distance',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-nodeToEdgeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('DistanceGroup', 20),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$nodeToEdgeDistanceItem
            },
            set: function(value) {
              this.$nodeToEdgeDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $edgeToEdgeDistanceItem: 0,

          /** @type {number} */
          edgeToEdgeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge to Edge Distance',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-edgeToEdgeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('DistanceGroup', 30),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$edgeToEdgeDistanceItem
            },
            set: function(value) {
              this.$edgeToEdgeDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumLayerDistanceItem: 0,

          /** @type {number} */
          minimumLayerDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layer to Layer Distance',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-minimumLayerDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('DistanceGroup', 40),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumLayerDistanceItem
            },
            set: function(value) {
              this.$minimumLayerDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.incremental.EdgeRoutingStyle}
           */
          $edgeRoutingItem: null,

          /** @type {yfiles.hierarchic.incremental.EdgeRoutingStyle} */
          edgeRoutingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Routing Style',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-routingStyle'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Octilinear', yfiles.hierarchic.EdgeRoutingStyle.OCTILINEAR],
                    ['Orthogonal', yfiles.hierarchic.EdgeRoutingStyle.ORTHOGONAL],
                    ['Polyline', yfiles.hierarchic.EdgeRoutingStyle.POLYLINE]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.EdgeRoutingStyle.$class)
              ]
            },
            get: function() {
              return this.$edgeRoutingItem
            },
            set: function(value) {
              this.$edgeRoutingItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $backloopRoutingItem: false,

          /** @type {boolean} */
          backloopRoutingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Backloop Routing',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-backLoopRouting'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$backloopRoutingItem
            },
            set: function(value) {
              this.$backloopRoutingItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $backloopRoutingForSelfLoopsItem: false,

          /** @type {boolean} */
          backloopRoutingForSelfLoopsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Backloop Routing For Self-loops',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-backLoopRoutingForSelfLoops'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$backloopRoutingForSelfLoopsItem
            },
            set: function(value) {
              this.$backloopRoutingForSelfLoopsItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableBackloopRoutingForSelfLoopsItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return !this.backloopRoutingItem
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $automaticEdgeGroupingEnabledItem: false,

          /** @type {boolean} */
          automaticEdgeGroupingEnabledItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Automatic Edge Grouping',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-automaticEdgeGrouping'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$automaticEdgeGroupingEnabledItem
            },
            set: function(value) {
              this.$automaticEdgeGroupingEnabledItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumFirstSegmentLengthItem: 0,

          /** @type {number} */
          minimumFirstSegmentLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum First Segment Length',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumFirstSegmentLengthItem
            },
            set: function(value) {
              this.$minimumFirstSegmentLengthItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumLastSegmentLengthItem: 0,

          /** @type {number} */
          minimumLastSegmentLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Last Segment Length',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 60),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumLastSegmentLengthItem
            },
            set: function(value) {
              this.$minimumLastSegmentLengthItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumEdgeLengthItem: 0,

          /** @type {number} */
          minimumEdgeLengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Edge Length',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLength'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumEdgeLengthItem
            },
            set: function(value) {
              this.$minimumEdgeLengthItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumEdgeDistanceItem: 0,

          /** @type {number} */
          minimumEdgeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Edge Distance',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumDistance'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 80),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumEdgeDistanceItem
            },
            set: function(value) {
              this.$minimumEdgeDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumSlopeItem: 0,

          /** @type {number} */
          minimumSlopeItem: {
            $meta: function() {
              return [
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 5.0,
                  step: 0.01
                }),
                demo.options.LabelAttribute(
                  'Minimum Slope',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumSlope'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 90),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumSlopeItem
            },
            set: function(value) {
              this.$minimumSlopeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableMinimumSlopeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeRoutingItem !== yfiles.hierarchic.EdgeRoutingStyle.POLYLINE
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $edgeDirectednessItem: false,

          /** @type {boolean} */
          edgeDirectednessItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 100),
                demo.options.LabelAttribute(
                  'Arrows Define Edge Direction',
                  '#/api/yfiles.hierarchic.HierarchicLayoutData#HierarchicLayoutData-property-edgeDirectedness'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$edgeDirectednessItem
            },
            set: function(value) {
              this.$edgeDirectednessItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $edgeThicknessItem: false,

          /** @type {boolean} */
          edgeThicknessItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 110),
                demo.options.LabelAttribute(
                  'Consider Edge Thickness',
                  '#/api/yfiles.hierarchic.HierarchicLayoutData#HierarchicLayoutData-property-edgeThickness'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$edgeThicknessItem
            },
            set: function(value) {
              this.$edgeThicknessItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $pcOptimizationEnabledItem: false,

          /** @type {boolean} */
          pcOptimizationEnabledItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Port Constraint Optimization',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-sourcePortOptimization'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 120),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$pcOptimizationEnabledItem
            },
            set: function(value) {
              this.$pcOptimizationEnabledItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $straightenEdgesItem: false,

          /** @type {boolean} */
          straightenEdgesItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Straighten Edges',
                  '#/api/yfiles.hierarchic.SimplexNodePlacer#SimplexNodePlacer-property-straightenEdges'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 130),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$straightenEdgesItem
            },
            set: function(value) {
              this.$straightenEdgesItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableStraightenEdgesItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.symmetricPlacementItem
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.ComponentArrangementPolicy}
           */
          $recursiveEdgeStyleItem: null,

          /** @type {yfiles.hierarchic.ComponentArrangementPolicy} */
          recursiveEdgeStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Recursive Edge Routing Style',
                  '#/api/yfiles.hierarchic.EdgeLayoutDescriptor#EdgeLayoutDescriptor-property-recursiveEdgeStyle'
                ),
                demo.options.OptionGroupAttribute('EdgeSettingsGroup', 140),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Off', yfiles.hierarchic.RecursiveEdgeStyle.OFF],
                    ['Directed', yfiles.hierarchic.RecursiveEdgeStyle.DIRECTED],
                    ['Undirected', yfiles.hierarchic.RecursiveEdgeStyle.UNDIRECTED]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.ComponentArrangementPolicy.$class)
              ]
            },
            get: function() {
              return this.$recursiveEdgeStyleItem
            },
            set: function(value) {
              this.$recursiveEdgeStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.LayeringStrategy}
           */
          $rankingPolicyItem: null,

          /** @type {yfiles.hierarchic.LayeringStrategy} */
          rankingPolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layer Assignment Policy',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-fromScratchLayeringStrategy'
                ),
                demo.options.OptionGroupAttribute('RankGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    [
                      'Hierarchical - Optimal',
                      yfiles.hierarchic.LayeringStrategy.HIERARCHICAL_OPTIMAL
                    ],
                    [
                      'Hierarchical - Tight Tree Heuristic',
                      yfiles.hierarchic.LayeringStrategy.HIERARCHICAL_TIGHT_TREE
                    ],
                    ['BFS Layering', yfiles.hierarchic.LayeringStrategy.BFS],
                    ['From Sketch', yfiles.hierarchic.LayeringStrategy.FROM_SKETCH],
                    [
                      'Hierarchical - Topmost',
                      yfiles.hierarchic.LayeringStrategy.HIERARCHICAL_TOPMOST
                    ]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.LayeringStrategy.$class)
              ]
            },
            get: function() {
              return this.$rankingPolicyItem
            },
            set: function(value) {
              this.$rankingPolicyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $layerAlignmentItem: 0,

          /** @type {number} */
          layerAlignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Alignment within Layer',
                  '#/api/yfiles.hierarchic.NodeLayoutDescriptor#NodeLayoutDescriptor-property-layerAlignment'
                ),
                demo.options.OptionGroupAttribute('RankGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top Border of Nodes', 0],
                    ['Center of Nodes', 0.5],
                    ['Bottom Border of Nodes', 1]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$layerAlignmentItem
            },
            set: function(value) {
              this.$layerAlignmentItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.ComponentArrangementPolicy}
           */
          $componentArrangementPolicyItem: null,

          /** @type {yfiles.hierarchic.ComponentArrangementPolicy} */
          componentArrangementPolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Component Arrangement',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-componentArrangementPolicy'
                ),
                demo.options.OptionGroupAttribute('RankGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Topmost', yfiles.hierarchic.ComponentArrangementPolicy.TOPMOST],
                    ['Compact', yfiles.hierarchic.ComponentArrangementPolicy.COMPACT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.ComponentArrangementPolicy.$class)
              ]
            },
            get: function() {
              return this.$componentArrangementPolicyItem
            },
            set: function(value) {
              this.$componentArrangementPolicyItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $nodeCompactionItem: false,

          /** @type {boolean} */
          nodeCompactionItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('RankGroup', 40),
                demo.options.LabelAttribute(
                  'Stacked Placement',
                  '#/api/yfiles.hierarchic.SimplexNodePlacer#SimplexNodePlacer-property-nodeCompaction'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$nodeCompactionItem
            },
            set: function(value) {
              this.$nodeCompactionItem = value
            }
          },

          /** @type {demo.options.OptionGroup} */
          SketchGroup: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('RankGroup', 50),
                demo.options.LabelAttribute('From Sketch Layer Assignment'),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $scaleItem: 0,

          /** @type {number} */
          scaleItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SketchGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 5.0,
                  step: 0.01
                }),
                demo.options.LabelAttribute(
                  'Scale',
                  '#/api/yfiles.hierarchic.AsIsLayerer#AsIsLayerer-property-nodeScalingFactor'
                ),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$scaleItem
            },
            set: function(value) {
              this.$scaleItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableScaleItem: {
            get: function() {
              return this.rankingPolicyItem !== yfiles.hierarchic.LayeringStrategy.FROM_SKETCH
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $haloItem: 0,

          /** @type {number} */
          haloItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SketchGroup', 20),
                demo.options.LabelAttribute(
                  'Halo',
                  '#/api/yfiles.hierarchic.AsIsLayerer#AsIsLayerer-property-nodeHalo'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$haloItem
            },
            set: function(value) {
              this.$haloItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableHaloItem: {
            get: function() {
              return this.rankingPolicyItem !== yfiles.hierarchic.LayeringStrategy.FROM_SKETCH
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumSizeItem: 0,

          /** @type {number} */
          minimumSizeItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SketchGroup', 30),
                demo.options.LabelAttribute(
                  'Minimum Size',
                  '#/api/yfiles.hierarchic.AsIsLayerer#AsIsLayerer-property-minimumNodeSize'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 1000
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumSizeItem
            },
            set: function(value) {
              this.$minimumSizeItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableMinimumSizeItem: {
            get: function() {
              return this.rankingPolicyItem !== yfiles.hierarchic.LayeringStrategy.FROM_SKETCH
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $maximumSizeItem: 0,

          /** @type {number} */
          maximumSizeItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SketchGroup', 40),
                demo.options.LabelAttribute(
                  'Maximum Size',
                  '#/api/yfiles.hierarchic.AsIsLayerer#AsIsLayerer-property-maximumNodeSize'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 1000
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$maximumSizeItem
            },
            set: function(value) {
              this.$maximumSizeItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableMaximumSizeItem: {
            get: function() {
              return this.rankingPolicyItem !== yfiles.hierarchic.LayeringStrategy.FROM_SKETCH
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $considerNodeLabelsItem: false,

          /** @type {boolean} */
          considerNodeLabelsItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('NodePropertiesGroup', 10),
                demo.options.LabelAttribute(
                  'Consider Node Labels',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-considerNodeLabels'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$considerNodeLabelsItem
            },
            set: function(value) {
              this.$considerNodeLabelsItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.HierarchicLayoutConfig.EnumEdgeLabeling}
           */
          $edgeLabelingItem: null,

          /** @type {demo.HierarchicLayoutConfig.EnumEdgeLabeling} */
          edgeLabelingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Labeling',
                  '#/api/yfiles.hierarchic.HierarchicLayout#MultiStageLayout-property-labelingEnabled'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['None', demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE],
                    ['Integrated', demo.HierarchicLayoutConfig.EnumEdgeLabeling.INTEGRATED],
                    ['Generic', demo.HierarchicLayoutConfig.EnumEdgeLabeling.GENERIC]
                  ]
                }),
                demo.options.TypeAttribute(demo.HierarchicLayoutConfig.EnumEdgeLabeling.$class)
              ]
            },
            get: function() {
              return this.$edgeLabelingItem
            },
            set: function(value) {
              this.$edgeLabelingItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $compactEdgeLabelPlacementItem: false,

          /** @type {boolean} */
          compactEdgeLabelPlacementItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Compact Placement',
                  '#/api/yfiles.hierarchic.SimplexNodePlacer#SimplexNodePlacer-property-labelCompaction'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 30),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$compactEdgeLabelPlacementItem
            },
            set: function(value) {
              this.$compactEdgeLabelPlacementItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCompactEdgeLabelPlacementItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.edgeLabelingItem !== demo.HierarchicLayoutConfig.EnumEdgeLabeling.INTEGRATED
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $reduceAmbiguityItem: false,

          /** @type {boolean} */
          reduceAmbiguityItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Reduce Ambiguity',
                  '#/api/yfiles.labeling.GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$reduceAmbiguityItem
            },
            set: function(value) {
              this.$reduceAmbiguityItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableReduceAmbiguityItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem !== demo.HierarchicLayoutConfig.EnumEdgeLabeling.GENERIC
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementOrientation}
           */
          $labelPlacementOrientationItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementOrientation} */
          labelPlacementOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Parallel', demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
                    [
                      'Orthogonal',
                      demo.LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL
                    ],
                    [
                      'Horizontal',
                      demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
                    ],
                    ['Vertical', demo.LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementOrientation.$class
                )
              ]
            },
            get: function() {
              return this.$labelPlacementOrientationItem
            },
            set: function(value) {
              this.$labelPlacementOrientationItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementOrientationItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem === demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementAlongEdge}
           */
          $labelPlacementAlongEdgeItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementAlongEdge} */
          labelPlacementAlongEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Along Edge',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Anywhere', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
                    ['At Source', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
                    ['At Target', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
                    ['Centered', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.$class
                )
              ]
            },
            get: function() {
              return this.$labelPlacementAlongEdgeItem
            },
            set: function(value) {
              this.$labelPlacementAlongEdgeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementAlongEdgeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem === demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge}
           */
          $labelPlacementSideOfEdgeItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
          labelPlacementSideOfEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Side of Edge',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Anywhere', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE],
                    ['On Edge', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE],
                    ['Left', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT],
                    ['Right', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT],
                    [
                      'Left or Right',
                      demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT
                    ]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.$class
                )
              ]
            },
            get: function() {
              return this.$labelPlacementSideOfEdgeItem
            },
            set: function(value) {
              this.$labelPlacementSideOfEdgeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementSideOfEdgeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem === demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $labelPlacementDistanceItem: 0,

          /** @type {number} */
          labelPlacementDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Distance',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-distanceToEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 40.0
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$labelPlacementDistanceItem
            },
            set: function(value) {
              this.$labelPlacementDistanceItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementDistanceItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.edgeLabelingItem === demo.HierarchicLayoutConfig.EnumEdgeLabeling.NONE ||
                this.labelPlacementSideOfEdgeItem ===
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
            }
          },

          /**
           * Backing field for below property
           * @type {demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions}
           */
          $groupLayeringStrategyItem: null,

          /** @type {demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions} */
          groupLayeringStrategyItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GroupingGroup', 10),
                demo.options.LabelAttribute(
                  'Layering Strategy',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-recursiveGroupLayering'
                ),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    [
                      'Layout Groups',
                      demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS
                    ],
                    [
                      'Ignore Groups',
                      demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.IGNORE_GROUPS
                    ]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.$class
                )
              ]
            },
            get: function() {
              return this.$groupLayeringStrategyItem
            },
            set: function(value) {
              this.$groupLayeringStrategyItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableGroupLayeringStrategyItem: {
            get: function() {
              return this.UseDrawingAsSketchItem
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.GroupAlignmentPolicy}
           */
          $groupAlignmentItem: 0,

          /** @type {yfiles.hierarchic.GroupAlignmentPolicy} */
          groupAlignmentItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GroupingGroup', 20),
                demo.options.LabelAttribute(
                  'Vertical Alignment',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-groupAlignmentPolicy'
                ),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top', yfiles.hierarchic.GroupAlignmentPolicy.TOP],
                    ['Center', yfiles.hierarchic.GroupAlignmentPolicy.CENTER],
                    ['Bottom', yfiles.hierarchic.GroupAlignmentPolicy.BOTTOM]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.GroupAlignmentPolicy.$class)
              ]
            },
            get: function() {
              return this.$groupAlignmentItem
            },
            set: function(value) {
              this.$groupAlignmentItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableGroupAlignmentItem: {
            get: function() {
              return (
                this.groupLayeringStrategyItem !==
                  demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS ||
                this.groupEnableCompactionItem
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $groupEnableCompactionItem: false,

          /** @type {boolean} */
          groupEnableCompactionItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GroupingGroup', 30),
                demo.options.LabelAttribute(
                  'Compact Layers',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-compactGroups'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$groupEnableCompactionItem
            },
            set: function(value) {
              this.$groupEnableCompactionItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableGroupEnableCompactionItem: {
            get: function() {
              return (
                this.groupLayeringStrategyItem !==
                  demo.HierarchicLayoutConfig.GroupLayeringStrategyOptions.LAYOUT_GROUPS ||
                this.UseDrawingAsSketchItem
              )
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.incremental.GroupCompactionPolicy}
           */
          $groupHorizontalCompactionItem: null,

          /** @type {yfiles.hierarchic.incremental.GroupCompactionPolicy} */
          groupHorizontalCompactionItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GroupingGroup', 40),
                demo.options.LabelAttribute(
                  'Horizontal Group Compaction',
                  '#/api/yfiles.hierarchic.SimplexNodePlacer#SimplexNodePlacer-property-groupCompactionStrategy'
                ),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Weak', yfiles.hierarchic.GroupCompactionPolicy.NONE],
                    ['Strong', yfiles.hierarchic.GroupCompactionPolicy.MAXIMAL]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.GroupCompactionPolicy.$class)
              ]
            },
            get: function() {
              return this.$groupHorizontalCompactionItem
            },
            set: function(value) {
              this.$groupHorizontalCompactionItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $treatRootGroupAsSwimlanesItem: false,

          /** @type {boolean} */
          treatRootGroupAsSwimlanesItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SwimlanesGroup', 10),
                demo.options.LabelAttribute(
                  'Treat Groups as Swimlanes',
                  '#/api/yfiles.hierarchic.TopLevelGroupToSwimlaneStage'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$treatRootGroupAsSwimlanesItem
            },
            set: function(value) {
              this.$treatRootGroupAsSwimlanesItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $useOrderFromSketchItem: false,

          /** @type {boolean} */
          useOrderFromSketchItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SwimlanesGroup', 20),
                demo.options.LabelAttribute(
                  'Use Sketch for Lane Order',
                  '#/api/yfiles.hierarchic.TopLevelGroupToSwimlaneStage#TopLevelGroupToSwimlaneStage-property-orderSwimlanesFromSketch'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$useOrderFromSketchItem
            },
            set: function(value) {
              this.$useOrderFromSketchItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableUseOrderFromSketchItem: {
            get: function() {
              return !this.treatRootGroupAsSwimlanesItem
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $swimlineSpacingItem: 0,

          /** @type {number} */
          swimlineSpacingItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('SwimlanesGroup', 30),
                demo.options.LabelAttribute(
                  'Lane Spacing',
                  '#/api/yfiles.hierarchic.TopLevelGroupToSwimlaneStage#TopLevelGroupToSwimlaneStage-property-spacing'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$swimlineSpacingItem
            },
            set: function(value) {
              this.$swimlineSpacingItem = value
            }
          },

          /**
           * @type {boolean}
           */
          shouldDisableSwimlineSpacingItem: {
            get: function() {
              return !this.treatRootGroupAsSwimlanesItem
            }
          },

          /**
           * @type {boolean}
           */
          shouldHideSwimlineSpacingItem: {
            get: function() {
              return !this.treatRootGroupAsSwimlanesItem
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $gridEnabledItem: false,

          /** @type {boolean} */
          gridEnabledItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GridGroup', 10),
                demo.options.LabelAttribute(
                  'Grid',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-gridSpacing'
                ),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$gridEnabledItem
            },
            set: function(value) {
              this.$gridEnabledItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $gridSpacingItem: 0,

          /** @type {number} */
          gridSpacingItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GridGroup', 20),
                demo.options.LabelAttribute(
                  'Grid Spacing',
                  '#/api/yfiles.hierarchic.HierarchicLayout#HierarchicLayout-property-gridSpacing'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$gridSpacingItem
            },
            set: function(value) {
              this.$gridSpacingItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.hierarchic.incremental.PortAssignmentMode}
           */
          $gridPortAssignmentItem: null,

          /** @type {yfiles.hierarchic.incremental.PortAssignmentMode} */
          gridPortAssignmentItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GridGroup', 30),
                demo.options.LabelAttribute(
                  'Grid Port Style',
                  '#/api/yfiles.hierarchic.NodeLayoutDescriptor#NodeLayoutDescriptor-property-portAssignment'
                ),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Default', yfiles.hierarchic.PortAssignmentMode.DEFAULT],
                    ['On Grid', yfiles.hierarchic.PortAssignmentMode.ON_GRID],
                    ['On Subgrid', yfiles.hierarchic.PortAssignmentMode.ON_SUBGRID]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.hierarchic.PortAssignmentMode.$class)
              ]
            },
            get: function() {
              return this.$gridPortAssignmentItem
            },
            set: function(value) {
              this.$gridPortAssignmentItem = value
            }
          },

          /** @lends {demo.HierarchicLayoutConfig} */
          $static: {
            EnumEdgeLabeling: new yfiles.lang.EnumDefinition(() => {
              return {
                NONE: 0,
                INTEGRATED: 1,
                GENERIC: 2
              }
            }),

            GroupLayeringStrategyOptions: new yfiles.lang.EnumDefinition(() => {
              return {
                LAYOUT_GROUPS: 0,
                IGNORE_GROUPS: 1
              }
            })
          }
        }
      })
    })
    return yfiles.module('demo')
  })
})(
  'undefined' !== typeof window
    ? window
    : 'undefined' !== typeof global
      ? global
      : 'undefined' !== typeof self
        ? self
        : this
)
