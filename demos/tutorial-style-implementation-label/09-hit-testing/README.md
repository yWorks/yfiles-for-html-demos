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
# 09 Hit-Testing - Tutorial: Label Style Implementation

# Customizing hit-testing

Styles not only provide a visual representation for graph items. They also offer crucial parts for interacting with said items. Hit-testing determines whether a particular item is at a given point in the canvas. It happens all the time during interaction, e.g. when selecting items, moving nodes, or creating edges.

The default implementation in the `LabelStyleBase` class only considers the label layout when hit-testing. When labels have shapes that deviate from the rectangular label layout, hit-testing has to be adjusted by providing a different implementation for the `isHit` method.

In this example, we have to include the "tail" of the speech balloon in the hit-test. We also take the hit-test radius into account. This value enables a bit of fuzziness when hit-testing the item, so you can still hit it when you’re slightly outside.

Note

For this demo, we increased the size of the speech balloon "tail".

```
protected isHit(
  context: IInputModeContext,
  location: Point,
  label: ILabel
): boolean {
  const labelLayout = label.layout
  // first check if the label layout is hit
  if (labelLayout.hits(location, context.hitTestRadius)) {
    return true
  }
  // if the layout is not hit, we have to check the tail triangle.
  // instead of checking the real label layout, we pretend the tail triangle is placed
  // non-rotated at 0/0 and transform the hit-test location accordingly.

  // create the inverted layout transform
  const layoutTransform = LabelStyleBase.createLayoutTransform(
    context.canvasComponent!.createRenderContext(),
    labelLayout,
    true
  )
  layoutTransform.invert()
  // transform the location and subtract the tail position
  const transformedLocation = layoutTransform
    .transform(location)
    .subtract(new Point(labelLayout.width * 0.5, labelLayout.height))

  // check the rectangular tail bounds
  const tailBounds = new Rect(0, 0, tailWidth, tailHeight)
  if (
    !tailBounds.containsWithEps(transformedLocation, context.hitTestRadius)
  ) {
    return false
  }

  // the location is inside the tail bounds - check if it's inside the triangle
  const tailHeightAtLocationX =
    tailHeight * ((tailWidth - transformedLocation.x) / tailWidth)
  return (
    transformedLocation.y <= tailHeightAtLocationX + context.hitTestRadius
  )
}
```

Note

Try this implementation by hovering both labels. Notice that the red labels, which uses the default hit-test, does not detect hits on the tail. The yellow labels use the adjusted hit-test code.

[10 Visibility](../../tutorial-style-implementation-label/10-visibility/)
