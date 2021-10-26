# Button Input Mode Demo

<img src="../../resources/image/button-input-mode.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/input/button-input-mode/index.html).

This demo shows how to use a custom input mode to add temporary buttons to model items.  
The buttons can be individually styled and placed and trigger an action on click or drag.

## Things to Try

- Hover over nodes, edges, bends or labels to see which buttons are added for them.
- Hover over these buttons to see different hover effects and cursors.
- Click or drag from a button to trigger the action associated with the button.
- Switch the _button trigger_ in the toolbar to change the trigger when buttons should be added to an item.
  - _Hover_ is the default behavior that displays the buttons for an item when hovering over it.
  - _Current item_ displays the buttons for the [current item](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-property-currentItem) of the _GraphComponent_.
  - _RightClick_ displays the buttons on right-clicking a model item.
- Press the _TAB_ key while the _GraphComponent_ is focused to set a focus to the first button and cycle through all buttons.  
  A focused button can be triggered using the _ENTER_ or _SPACE_ key.

See the sources for details.
