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
# 11 Adding Arrows - Tutorial: Edge Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-edge-adding-arrows.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-style-implementation-edge/11-adding-arrows/).

Arrows are a decorative element that can be added to both ends of an edge to indicate its direction. They commonly take the form of arrowheads.

Note

Note that arrows indicate the direction of edges, but do not define them. The actual direction in the graph model is determined by the source and target nodes of the edge.

In this step, we want to give our edge style the ability to render arrows. To do this, we add two properties to define the arrows: one property for the arrow at the source node and another for the arrow at the target node.

```
constructor(
  public distance = 1,
  public sourceArrow: IArrow = IArrow.NONE,
  public targetArrow: IArrow = IArrow.NONE
) {
  super()
}
```

Now, we can specify the desired arrows when creating an edge style. For this we can use the predefined arrows which are shipped with yFiles for HTML. See also [Decorations: Arrows](https://docs.yworks.com/yfileshtml/#/dguide/styles-arrows).

```
const style = new CustomEdgeStyle(2)
style.sourceArrow = new Arrow(ArrowType.TRIANGLE)
```

In `createVisual`, we add the arrows to our visualization using the method [addArrows](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase#EdgeStyleBase-method-addArrows) from the base class EdgeStyleBase. For this purpose, we create an own SVG group `arrows`. The addArrows method adds the arrows to this group. Finally, this group is added to the group with the other edge visualization elements.

```
const arrows = document.createElementNS('http://www.w3.org/2000/svg', 'g')
this.addArrows(
  context,
  arrows,
  edge,
  pathWithBridges,
  this.sourceArrow,
  this.targetArrow
)
group.append(arrows)
```

Additionally, we need to update the visualization of arrows in `updateVisual` with the [updateArrows](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase#EdgeStyleBase-method-updateArrows) method, if the arrows or edge path have changed since the last call.

```
const arrows = group.children[2] as SVGGElement
this.updateArrows(
  context,
  arrows,
  edge,
  pathWithBridges,
  this.sourceArrow,
  this.targetArrow
)
cache.sourceArrow = this.sourceArrow
cache.targetArrow = this.targetArrow
```

[12 Custom Arrow](../../tutorial-style-implementation-edge/12-custom-arrow/)
