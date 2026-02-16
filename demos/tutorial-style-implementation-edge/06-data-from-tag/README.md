<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# 06 Data from Tag - Tutorial: Edge Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-edge-data-from-tag.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-edge/06-data-from-tag/).

In the last step, we added a property to the style to change the visualization. Now, we want to be even more versatile and change the visualization based on the data of each visualized edge.

yFiles for HTML provides a [tag](https://docs.yworks.com/yfileshtml/api/ITagOwner#tag) property for all graph items, which is frequently used to bind business objects to nodes and edges. The style can make use of this data and translate it to a visual representation.

In this example we assume that each edge represents a physical line. In the tag of the edge we store the current load of the line that we want to visualize as a color of the corresponding edge.

First, let’s add three edges with different loads in the tag:

```
edge1.tag = { load: 'Free' }
edge2.tag = { load: 'Moderate' }
edge3.tag = { load: 'Overloaded' }
```

In our style, we read the load from the tag and convert it into a color:

```
private getLoadColor(edge: IEdge): string {
  switch (edge.tag?.load) {
    case 'Free':
      return '#76b041'
    case 'Moderate':
      return '#ffc914'
    case 'Overloaded':
      return '#ff6c00'
    default:
      return 'white'
  }
}
```

Lastly, we need to set the color in [createVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#createVisual)

```
const loadColor = this.getLoadColor(edge)
thinPath.setAttribute('stroke', loadColor)
```

and update it in [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) if necessary.

```
const newLoadColor = this.getLoadColor(edge)
if (newLoadColor !== cache.loadColor) {
  thinPath.setAttribute('stroke', newLoadColor)
  cache.loadColor = newLoadColor
}
```

Note

It is important to store the load in the cache in [createVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#createVisual) and check in [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) whether its value has been changed in the meantime. If so, you should update the old visual before returning it.

[07 Hit-Testing](../../tutorial-style-implementation-edge/07-hit-testing/)
