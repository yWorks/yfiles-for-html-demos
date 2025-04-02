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
# Node Label Placement Demo

<img src="../../../doc/demo-thumbnails/node-labeling.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/node-labeling/).

This demo shows how to use the [GenericLabeling](https://docs.yworks.com/yfileshtml/#/api/GenericLabeling) algorithm (see also [Generic Labeling](https://docs.yworks.com/yfileshtml/#/dguide/label_placement-generic_labeling) in the Developer's Guide) to set the positions of labels. Additionally, we show how to set rules which define preferred placement positions of specific label positions using [NodeLabelCandidates](https://docs.yworks.com/yfileshtml/#/api/NodeLabelCandidates).

## Things to Try

- Add a new city by clicking on the canvas.
- Edit a label by selecting it and pressing F2.
- Run the label placement algorithm by clicking the button 'Place Labels'.
- Change the label model using the select box in the toolbar. The label placement algorithm runs automatically.
- Change the font size of the labels using the select box in the toolbar. The label placement algorithm runs automatically.
- If not positioned to your liking, drag labels to reposition them. This will 'pin' them locking their position for generic labeling.
- Clicking a label will 'unpin' it.
