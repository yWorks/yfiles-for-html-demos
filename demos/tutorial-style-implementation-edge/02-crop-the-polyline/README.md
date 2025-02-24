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
# 02 Crop the Polyline - Tutorial: Edge Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-edge-crop-the-polyline.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-style-implementation-edge/02-crop-the-polyline/).

In the previous step, we generated and displayed a SVG path for an edge. However, it looks untidy as the path extends into its adjacent nodes. The reason behind it is that the path runs up to the port of the nodes, which is often located in the center of a node.

In order to fix this issue, it is necessary to adjust the path so that it ends precisely at the outline of the nodes. This requires computing the intersection point of the path and the node’s outline, which may be complex depending on the shape of the node. Thankfully, the [EdgeStyleBase](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase) offers useful methods which not only calculate the intersection points but also shorten the path accordingly.

## Working with paths

To create or modify paths in yFiles for HTML, we commonly use the [GeneralPath](https://docs.yworks.com/yfileshtml/#/api/GeneralPath) class. To obtain an instance of this class from an edge, we can use the method [EdgeStyleBase.getPath](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase#EdgeStyleBase-method-getPath).

```
const generalPath = this.getPath(edge)
```

Using the [EdgeStyleBase.cropPath](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase#EdgeStyleBase-method-cropPath) method, we can now trim the path to end at the outline of the nodes. This method requires us to specify the arrows at the beginning and end of the edge. Since we haven’t added any arrows yet, we’ll use `IArrow.NONE`.

```
const croppedGeneralPath = this.cropPath(
  edge,
  IArrow.NONE,
  IArrow.NONE,
  generalPath!
)
```

Finally, we create a SVGPathElement instance from the corrected path using the [GeneralPath.createSvgPath](https://docs.yworks.com/yfileshtml/#/api/GeneralPath#GeneralPath-method-createSvgPath) method.

```
const path = croppedGeneralPath!.createSvgPath()
```

## Bringing everything together

Now we can use the above parts to create a SVG visual from the edge in `createVisual`:

```
protected createVisual(context: IRenderContext, edge: IEdge): Visual | null {
  const generalPath = this.getPath(edge)
  const croppedGeneralPath = this.cropPath(
    edge,
    IArrow.NONE,
    IArrow.NONE,
    generalPath!
  )
  const path = croppedGeneralPath!.createSvgPath()
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'black')
  path.setAttribute('stroke-width', '1')
  return new SvgVisual(path)
}
```

[03 Create Parallel Polylines](../../tutorial-style-implementation-edge/03-create-parallel-polylines/)
