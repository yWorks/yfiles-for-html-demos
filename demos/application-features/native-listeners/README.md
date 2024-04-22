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
# Native Listeners - Application Features

# Native Listeners

This demo illustrates an approach on how to register native event listeners to SVG-elements on a style.

In this case a style decorator adds a circle with a click listener to the style. Please note that the yFiles input modes don't know anything about the native events you registered. Therefore, the input modes also handle the input. This can cause unwanted behavior, like selecting the node despite the native click listener being triggered.

To prevent input modes from being triggered as well, a `mousedown` listener that calls `preventDefault()` on the event may be registered at the element as well.

See the sources for details.
