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
# Accessibility with Aria Attributes - Application Features

# Accessibility with Aria Attributes

This demo shows how to improve accessibility with ARIA attributes and a [live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) for the graph component. Switching an element in this demo, updates the live region of the graph component with the currently selected label.

## Things to Try

- Focus the GraphComponent with `TAB` key and cycle through the nodes with the arrow keys. The label of the currently selected node is read by the screen reader.
- Select an item to trigger the screen reader to read the label.
- Hover a node to trigger its tooltip which is also read by the screen reader.
- Toggle Aria-Atomic: This toggles `aria-atomic` on the live region. When enabled, the entire content of the live region is read by the screen reader. When disabled, only the changed part (i.e. the item's label) is read by the screen reader.

## About Screen Readers

Screen reader support varies vastly and you might experience different behaviors across different screen readers and browsers. Some examples of popular screen readers:

- [JAWS screen reader](https://www.freedomscientific.com/products/software/jaws/): A popular windows screen reader.
- [NVDA screen reader](https://www.nvaccess.org/download/): An open-source screen reader for windows.
- Windows Narrator: Built-in windows screen reader.
- VoiceOver: A macOS built-in screen reader.

### Known Issues

`aria-atomic` has no effect in Chrome.

Windows Narrator behaves differently depending on the browser and does not consider the aria-atomic attribute. For example, the `application` role is not honored on some systems with Chrome and Windows Narrator such that keyboard inputs are not delivered to the graph component and therefore the item selection cannot be changed with the arrow keys.

VoiceOver on macOS does not pick up the aria-describedby label that is used on the graph component container for the item's tooltip.
