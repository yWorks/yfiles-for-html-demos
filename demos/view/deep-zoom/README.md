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
# Deep Zoom Demo

# Deep Zoom Demo

This demo allows you to seamlessly zoom into the contents of deeply nested group nodes, similar to what is known as "deep zoom" for images and maps.

The graph component does not display the complete graph but only the nesting level that fits the current zoom level. That means that graph items at a higher nesting level are not rendered at all, and the contents of group nodes that are too small to provide meaningful interaction is displayed as a static image. When zooming in on such a group node, this image is eventually replaced with real graph elements.

## Things to try

- **Zoom into** a group node so that its entire contents fill the current viewport, and observe that the displayed graphic is automatically replaced by the contents of the group.
- **Zoom out** of a group and observe that its previous nesting layer becomes visible and the content of the group becomes an image again.
- **Click** on ![Zoom original](../../resources/icons/zoom-original3-16.svg) or ![Fit Content](../../resources/icons/fit-16.svg) to exit all groups and reset the zoom.
