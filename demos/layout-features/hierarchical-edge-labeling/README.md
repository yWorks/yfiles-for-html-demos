<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Hierarchical Layout with Edge Labeling - Layout Features

<img src="../../../doc/demo-thumbnails/layout-hierarchical-edge-labeling.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout-features/hierarchical-edge-labeling/).

This demo shows how to configure the [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) for automatic edge label placement.

### Configuring label placement

[Label models](https://docs.yworks.com/yfileshtml/#/api/ILabelModel) and their [parameters](https://docs.yworks.com/yfileshtml/#/api/ILabelModelParameter) determine the position of a label. For many interactive use cases, it makes sense to choose a model that restricts the available positions in some way. However, for automatic label placement the opposite is true: Models that do not impose restrictions on a label's position work best. For example, [FreeEdgeLabelModel](https://docs.yworks.com/yfileshtml/#/api/FreeEdgeLabelModel) would be a good choice for integrated label placement.

[PreferredPlacementDescriptor](https://docs.yworks.com/yfileshtml/#/api/PreferredPlacementDescriptor)s may be associated with labels to control automatic placement. Such a descriptor determines if the algorithm will place a label close to its owner edge's source or target node, next to or on the edge, or even rotate the label.

The demo configures several descriptors for placing each label in a way that matches its text - with two notable exceptions: For the labels _Upside down_ and _Upwards_ , the actual rotation does not match the implied rotation. This is because, by default, [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout)'s labeling algorithm ensures that a rotated label's up vector does not point downwards. Uncommenting the corresponding line in the demo's source code will turn this feature off and enable upside down labels.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchical-edge-labeling/HierarchicalEdgeLabeling.ts).

### Demos

See the [Edge Label Placement Demo](../../layout/edgelabelplacement/) for a more elaborate example regarding automatic edge label placement.

### Documentation

The [Labeling](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout#_labeling) and [Automatic Label Placement](https://docs.yworks.com/yfileshtml/#/dguide/label_placement) sections in the Developer's Guide contain in-depth discussions of the relevant concepts.

See the [PreferredPlacementDescriptor](https://docs.yworks.com/yfileshtml/#/api/PreferredPlacementDescriptor) API documentation for detailed information on all available placement options.
