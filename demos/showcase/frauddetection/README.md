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
# Fraud Detection Demo

# Fraud Detection Demo

This demo shows how _yFiles for HTML_ can be used for detecting _fraud cases_ in time-dependent data. Fraud affects many companies worldwide causing economic loss and liability issues. Fraud detection relies on the analysis of a huge amount of data-sets and thus, visualizations can be valuable for the quick detection of fraud schemes.

## Main Graph Component

- Shows the graph according to the current time frame.
- Provides additional information for the nodes on _click_ (displayed in the right-panel) or on _hover_.
- Highlights fraud rings on _hover_.
- Graph elements, selection and highlight are rendered using the WebGL2 rendering technique, if this is supported by the browser.

## Timeline Component

- Shows the number of node creation/removal events with a bar for each point in time.
- Contains a time frame rectangle to select which time segment is represented in the main graph by _resizing/dragging_ it.
- Provides three detail levels (days/months/years) that are switched by _scrolling_ anywhere in the component.
- Updates the highlights/selection in the main graph when _hovering/selecting_ bars.
- Offers a ![play](timeline/icons/play.svg)\-button to automatically move the time frame to the right while updating the main graph.

## Inspection View Component

- Opens an inspection view of a fraud ring when _double-clicking_ on fraud ring elements or the according ![fraud warning](resources/icons/fraud-warning.svg)\-symbol in the toolbar. Also, hover on a ![fraud warning](resources/icons/fraud-warning.svg)\-symbol animates the viewport to the corresponding fraud component.
- Shows a single graph component that contains fraud rings along with its own timeline.
- Updates the layout when _clicking_ the Layout-button in the toolbar.
