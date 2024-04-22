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
# Zoom-invariant Label Style

# Zoom-invariant Label Style

This demo shows label styles that render the labels independent of the zoom level.

## Zoom Modes

Fit into label owner

Node labels are scaled to fit into their owner if they are bigger than their owner.

Fixed below zoom threshold

Labels stop getting smaller in view coordinates if the zoom level is less than the zoom threshold.

Fixed above zoom threshold

Labels stop getting larger in view coordinates if the zoom level is greater than the zoom threshold.

Zoom-invariant (Fixed when outside specified range)

Labels don't scale when the zoom level is below the zoom threshold or above the maximum scale threshold.

Default behaviour

This is the standard behaviour of a label. See how it compares to this custom label style implementation.

## Things to Try

- Zoom in and out with the different policies to see how the labels change or keep their sizes.
- Change the _Zoom Threshold_ and see how it affects the _Fixed below zoom threshold_ option.
- Select labels and see how their hit-testing and selection changes with the zoom dependent rendering.
