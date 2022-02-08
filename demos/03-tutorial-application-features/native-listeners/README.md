# Native Listeners - Application Features Tutorial

<img src="../../resources/image/tutorial3step17.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/03-tutorial-application-features/native-listeners/index.html).

Application Features Tutorial

# Native Listeners

This demo illustrates an approach on how to register native event listeners to SVG-elements on a style.

In this case a style decorator adds a circle with a click listener to the style. Please note that the yFiles input modes don't know anything about the native events you registered. Therefore, the input modes also handle the input. This can cause unwanted behavior, like selecting the node despite the native click listener being triggered.

To prevent input modes from being triggered as well, a `mousedown` listener that calls `preventDefault()` on the event may be registered at the element as well.

See the sources for details.
