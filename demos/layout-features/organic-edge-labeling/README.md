<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Organic Layout with Edge Labeling - Layout Features

# Organic Layout with Edge Labeling

This demo shows how to configure the [Organic Layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) for automatic edge label placement.

### Configuring label placement

[Label models](https://docs.yworks.com/yfileshtml/#/api/ILabelModel) and their [parameters](https://docs.yworks.com/yfileshtml/#/api/ILabelModelParameter) determine the position of a label. For many interactive use cases, it makes sense to choose a model that restricts the available positions in some way. However, for automatic label placement the opposite is true: Models that do not impose restrictions on a label's position work best. Thus [FreeEdgeLabelModel](https://docs.yworks.com/yfileshtml/#/api/FreeEdgeLabelModel) and [SmartEdgeLabelModel](https://docs.yworks.com/yfileshtml/#/api/SmartEdgeLabelModel) are good choices for integrated label placement.

[PreferredPlacementDescriptor](https://docs.yworks.com/yfileshtml/#/api/PreferredPlacementDescriptor)s may be associated with labels to control automatic placement. Such a descriptor determines if the algorithm will place a label close to its owner edge's source or target node, next to or on the edge, or even rotate the label. For better results when using [Organic Layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout), both the side and angle of the labels has to be specified relative to the edge.

Note that self-loops and parallel edges are handled by [SelfLoopRouter](https://docs.yworks.com/yfileshtml/#/api/SelfLoopRouter) and [ParallelEdgeRouter](https://docs.yworks.com/yfileshtml/#/api/ParallelEdgeRouter) respectively. Thus, labels of such edges are not considered by the [organic layout algorithm](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). To place the labels of these edges, a [generic labeling](https://docs.yworks.com/yfileshtml/#/api/GenericLabeling) algorithm has to be applied as a post-processing step.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/organic-edge-labeling/OrganicEdgeLabeling.ts).

### Demos

See the [Edge Label Placement](../../layout/edgelabelplacement/index.html) demo for a more elaborate example regarding automatic edge label placement.

### Documentation

The [Labeling](https://docs.yworks.com/yfileshtml/#/dguide/organic_layout#_labeling) and [Automatic Label Placement](https://docs.yworks.com/yfileshtml/#/dguide/label_placement) sections in the Developer's Guide contain in-depth discussions of the relevant concepts.

See the [PreferredPlacementDescriptor](https://docs.yworks.com/yfileshtml/#/api/PreferredPlacementDescriptor) API documentation for detailed information on all available placement options.
