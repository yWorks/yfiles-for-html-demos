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
# 05 Label Placement - Tutorial: Basic Features

<img src="../../../doc/demo-thumbnails/tutorial-basic-features-label-placement.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-yfiles-basic-features/05-label-placement/).

## How to influence the placement of labels.

This step shows how to control label placement with the help of [layout parameters](https://docs.yworks.com/yfileshtml/#/dguide/getting_started-application#getting_started-placing_labels).

The default label layout parameters can be configured in the graph’s [nodeDefaults](https://docs.yworks.com/yfileshtml/#/api/IGraph#IGraph-property-nodeDefaults) and [edgeDefaults](https://docs.yworks.com/yfileshtml/#/api/IGraph#IGraph-property-edgeDefaults).

```
// Place node labels in the node center
graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER

// Use a rotated layout for edge labels
graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
  autoRotation: true
}).createParameterFromSource({
  segmentIndex: 0,
  distance: 10.0, // distance between the label's box and the edge path
  segmentRatio: 0.5 // placement near the center of the path
})
```

The label layout parameter can also be changed during runtime. Click the button below to apply the layout parameters from the code sample.

Change Label Layout Parameters Reset to Default

```
// InteriorStretchLabelModel stretches the label width or height to match the node size
const interiorStretchModel = new StretchNodeLabelModel({ padding: 3 })
graph.setLabelLayoutParameter(
  label1,
  interiorStretchModel.createParameter('top')
)

// ExteriorLabelModel places the label on discrete positions outside the node bounds
const exteriorLabelModel = new ExteriorNodeLabelModel({ margins: 10 })

graph.setLabelLayoutParameter(
  label2,
  exteriorLabelModel.createParameter('bottom')
)

// NinePositionsEdgeLabelModel provides a set of 9 predefined locations on an edge
graph.setLabelLayoutParameter(
  edgeLabel,
  NinePositionsEdgeLabelModel.CENTER_ABOVE
)
```

You can also take a look at the node-label-placement and the [Edge Label Placement Demo](../../layout/edgelabelplacement/) that show how to configure node and edge labels.

[06 Basic Interaction](../../tutorial-yfiles-basic-features/06-basic-interaction/)
