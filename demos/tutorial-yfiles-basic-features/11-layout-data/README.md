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
# 11 Layout Data - Tutorial: Basic Features

# Layout Data

## How to consider graph data in automatic layout

This step shows how to [configure a layout algorithm](https://docs.yworks.com/yfileshtml/#/dguide/layout-applying_a_layout#layout-layout_data) using the information stored in the first label of each node.

In this demo, the preferred alignment for each node within its layer (top, center or bottom) is defined by its label. We use this value to configure the layout algorithm.

- Select a different alignment for a node by changing its label text to `Top`, `Center` or `Bottom`. The layout is updated automatically after editing a label.
- Create new nodes and run a new layout. Newly created nodes will be center-aligned, unless otherwise specified by the user.

Run Layout

Note

Nodes with label text other than 'Top', 'Center' or 'Bottom' will be center-aligned.

We create a [LayoutData](https://docs.yworks.com/yfileshtml/#/api/LayoutData) instance that defines how each node should be aligned.

```
// Configure the layout data using the information from the node labels
const hierarchicLayoutData = new HierarchicLayoutData({
  nodeLayoutDescriptors: (
    node: INode
  ): HierarchicLayoutNodeLayoutDescriptor =>
    new HierarchicLayoutNodeLayoutDescriptor({
      // Set the alignment of the node based on the label
      layerAlignment: getAlignment(node)
    })
})
```

The layer alignment can take values between _0_ and _1_, where _0_ corresponds to top alignment, _0.5_ to center alignment and _1.0_ to bottom alignment.

```
function getAlignment(node: INode): number {
  const text = node.labels.at(0)?.text?.toLowerCase() ?? 'center'
  switch (text) {
    default:
    case 'center':
      return 0.5
    case 'top':
      return 0.0
    case 'bottom':
      return 1.0
  }
}
```

The layout data is used as a parameter for [morphLayout](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-defaultmethod-morphLayout) to pass the information to the layout algorithm.

```
await graphComponent.morphLayout({
  layout: new MinimumNodeSizeStage(hierarchicLayout),
  layoutData: hierarchicLayoutData,
  morphDuration: '1s',
  easedAnimation: true
})
```

[12 Analysis Algorithms](../../tutorial-yfiles-basic-features/12-graph-analysis/)
