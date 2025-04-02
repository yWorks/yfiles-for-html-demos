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
# 10 Bridge Support - Tutorial: Edge Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-edge-bridge-support.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-edge/10-bridge-support/).

When there are a lot of crossing edges, especially when they are orthogonal, it can be hard to determine where an edge actually leads.

Bridges, or line jumps, are a means to resolve the visual ambiguity induced by intersecting edge paths. Each segment of an edge path that intersects with at least one other segment (from either the same or another edge path) can be augmented with a bridge in one of a variety of different styles like gap, arc, and rectangle.

Bridge rendering is handled by the [BridgeManager](https://docs.yworks.com/yfileshtml/#/api/BridgeManager) class. It can be enabled by assigning the GraphComponent to BridgeManager’s canvasComponent property. To determine obstacles, the BridgeManager instance uses an implementation of the [IObstacleProvider](https://docs.yworks.com/yfileshtml/#/api/IObstacleProvider) interface. We use the [GraphObstacleProvider](https://docs.yworks.com/yfileshtml/#/api/GraphObstacleProvider) that by default incorporates the obstacle definitions returned by all edges from the current graph.

```
const bridgeManager = new BridgeManager()
bridgeManager.canvasComponent = graphComponent
bridgeManager.addObstacleProvider(new GraphObstacleProvider())
```

The BridgeManager uses the lookup mechanism to ask about the obstacles for each edge. The request is passed to the EdgeStyle’s lookup method. Our lookup method provides an IObstacleProvider implementation that returns the path of the edge. Now the BridgeManager can determinate where bridges have to be created.

```
protected lookup(edge: IEdge, type: Constructor<any>): any {
  if (type === IObstacleProvider) {
    const getPath = this.getPath.bind(this)
    return new (class extends BaseClass(IObstacleProvider) {
      getObstacles(context: IRenderContext): GeneralPath | null {
        return getPath(edge)
      }
    })()
  }
  return super.lookup(edge, type)
}
```

So far we have used the cropped path for the edge visualization. Now we need to add bridges to this path where obstacles are present. Fortunately, BridgeManager can take care of this.

```
private createPathWithBridges(
  path: GeneralPath,
  context: IRenderContext
): GeneralPath {
  const manager = context.lookup(BridgeManager)
  return manager ? manager.addBridges(context, path) : path
}
```

The BridgeManager provides a [hash code](https://docs.yworks.com/yfileshtml/#/api/BridgeManager#BridgeManager-method-getObstacleHash) that describes the current obstacle locations.

```
private getObstacleHash(context: IRenderContext): number {
  const manager = context.lookup(BridgeManager)
  return manager ? manager.getObstacleHash(context) : 42
}
```

We cache that hash code in `createVisual` and use it in `updateVisual` to check for changes, and if so we update the data of the paths.

```
const newGeneralPath = super.getPath(edge)!
const newObstacleHash = this.getObstacleHash(context)
if (
  !newGeneralPath.hasSameValue(cache.generalPath) ||
  newObstacleHash !== cache.obstacleHash
) {
  const croppedGeneralPath = super.cropPath(
    edge,
    IArrow.NONE,
    IArrow.NONE,
    newGeneralPath
  )!
  const pathWithBridges = this.createPathWithBridges(
    croppedGeneralPath,
    context
  )
  const pathData = pathWithBridges.createSvgPathData()

  widePath.setAttribute('d', pathData)
  thinPath.setAttribute('d', pathData)

  cache.generalPath = newGeneralPath
  cache.obstacleHash = newObstacleHash
}
```

[11 Adding Arrows](../../tutorial-style-implementation-edge/11-adding-arrows/)
