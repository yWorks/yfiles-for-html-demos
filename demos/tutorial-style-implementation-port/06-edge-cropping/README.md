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
# 06 Edge Cropping - Tutorial: Port Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-port-edge-cropping.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-port/06-edge-cropping/).

In this tutorial step, we will add support for edge cropping at the port. Since in this example, the ports protrude from their owner node’s bounds, the edge’s arrow can be hidden behind the port.

To define the port shape, we first define an [IShapeGeometry](https://docs.yworks.com/yfileshtml/#/api/IShapeGeometry) for the style. This interface is later used by the [IEdgePathCropper](https://docs.yworks.com/yfileshtml/#/api/IEdgePathCropper) to crop the edge at the port outline.

We override the [lookup](https://docs.yworks.com/yfileshtml/#/dguide/customizing_concepts_lookup) method to return the [IShapeGeometry](https://docs.yworks.com/yfileshtml/#/api/IShapeGeometry) to the port style. The [IShapeGeometry](https://docs.yworks.com/yfileshtml/#/api/IShapeGeometry) gets the port’s bounds and uses the convenience class [GeometryUtilities](https://docs.yworks.com/yfileshtml/#/api/GeometryUtilities) to consider the elliptic port shape.

```
protected lookup(port: IPort, type: Constructor<any>): any {
  if (type === IShapeGeometry) {
    // calculate the port bounds for edge cropping
    const bounds = this.getPortBounds(port)
    // the IShapeGeometry implementation for this style
    const PortShapeGeometry = class extends BaseClass(IShapeGeometry) {
      getIntersection(inner: Point, outer: Point): Point | null {
        return GeometryUtilities.getEllipseLineIntersection(
          bounds,
          inner,
          outer
        )
      }

      getOutline(): GeneralPath | null {
        const path = new GeneralPath()
        path.appendEllipse(bounds, false)
        return path
      }

      isInside(location: Point): boolean {
        return GeometryUtilities.ellipseContains(bounds, location, 0)
      }
    }
    return new PortShapeGeometry()
  }
```

Now, we have to provide an [IEdgePathCropper](https://docs.yworks.com/yfileshtml/#/api/IEdgePathCropper) instance in the `lookup` method that yFiles for HTML can use it for edge cropping. We subclass [DefaultEdgePathCropper](https://docs.yworks.com/yfileshtml/#/api/DefaultEdgePathCropper) and override [getPortGeometry](https://docs.yworks.com/yfileshtml/#/api/DefaultEdgePathCropper#DefaultEdgePathCropper-method-getPortGeometry). In this method, we use the port’s `lookup` to get the [IShapeGeometry](https://docs.yworks.com/yfileshtml/#/api/IShapeGeometry) we defined above. We enable [cropAtPort](https://docs.yworks.com/yfileshtml/#/api/DefaultEdgePathCropper#DefaultEdgePathCropper-property-cropAtPort) in the constructor.

```
if (type === IEdgePathCropper) {
  // a custom IEdgePathCropped implementation that uses the IShapeGeometry defined above
  const CustomEdgePathCropper = class extends EdgePathCropper {
    protected getPortGeometry(port: IPort): IShapeGeometry | null {
      return port.lookup(IShapeGeometry)
    }
  }
  return new CustomEdgePathCropper({ cropAtPort: true })
}
```
