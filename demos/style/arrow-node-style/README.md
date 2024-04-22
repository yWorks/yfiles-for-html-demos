<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Arrow Node Style Demo

# Arrow Node Style Demo

The [ArrowNodeStyle](https://docs.yworks.com/yfileshtml/#/api/ArrowNodeStyle) provides several properties to customize its shape. There are five basic [shapes](https://docs.yworks.com/yfileshtml/#/api/ArrowNodeStyle#shape) provided that can be rotated in four [directions](https://docs.yworks.com/yfileshtml/#/api/ArrowNodeStyle#direction).

For the [Arrow](https://docs.yworks.com/yfileshtml/#/api/ArrowStyleShape#ARROW), [Double Arrow](https://docs.yworks.com/yfileshtml/#/api/ArrowStyleShape#DOUBLE_ARROW) and [Notched Arrow](https://docs.yworks.com/yfileshtml/#/api/ArrowStyleShape#NOTCHED_ARROW) shapes, the thickness of the arrow shaft can be defined as a [shaft ratio](https://docs.yworks.com/yfileshtml/#/api/ArrowNodeStyle#shaftRatio) of the node size.

For all shapes, the [angle](https://docs.yworks.com/yfileshtml/#/api/ArrowNodeStyle#angle) of the arrow tip can be defined. The angle is between an arrow blade and the perpendicular to which the arrow is pointing.

## Things to try

- Select a node and see its style settings in the property panel on the right-hand side.
- Change some of the settings while a node is selected and see how it affects the selected node.
- Resize a selected node via its resize handles and see how the shape changes based on the node size ratio.
- Click on the canvas background to create a new node using the style settings of the property panel.

To learn how to customize the handles of the arrow node style, please see the [Custom Handle Provider Demo](../../input/custom-handle-provider/).

## Related Demos

- [Shape Node Style Demo](../../style/shape-node-style/)
- [Rectangle Node Style Demo](../../style/rectangle-node-style/)
- [Group Node Style Demo](../../style/group-node-style/)
- [Step 01 Create A Rectangle](../../tutorial-style-implementation-node/01-create-a-rectangle/)
