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
# Native Listeners - Application Features

<img src="../../../doc/demo-thumbnails/native-listeners.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/application-features/native-listeners/).

This demo illustrates an approach on how to register native event listeners to SVG-elements on a style.

In this case a style decorator adds a circle with a click listener to the style. Please note that the yFiles input modes don't know anything about the native events you registered. Therefore, the input modes also handle the input. This can cause unwanted behavior, like selecting the node despite the native click listener being triggered.

To prevent input modes from being triggered as well, a `pointerDown` listener that calls `preventDefault()` on the event may be registered at the element as well.

See the sources for details.
