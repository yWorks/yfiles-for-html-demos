# Label Editing Demo

<img src="../../resources/image/label_editing.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/input/labelediting/index.html).

This demo shows customizations of the interactive label editing. In particular, it shows:

- The related properties of [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode).
- A [IEditLabelHelper](https://docs.yworks.com/yfileshtml/#/api/IEditLabelHelper) that customizes label editing for individual labels and label owners.
- Input validation.
- The Instant Typing feature that allows users to start typing immediately.

## Thing to Try

- Edit a selected label by pressing F2. If no label exists, a new one will be added.
- Add an additional label to a selected graph item by pressing Shift+F2.
- Select multiple items (labels and/or label owners) and try to add or edit them by pressing Shift+F2 or F2, resp. Note that by default, if both labels and other items are selected, editing a label is preferred.

## Editing Properties

Label Creation, Label Editing

Specifies whether adding and editing of labels is allowed.

Hide Label During Editing

Specifies whether the label is hidden while the label editor text box is displayed.

Instant Typing

If enabled, label text editing starts automatically when typing, without the need for starting it explicitly.

Custom Label Helper

Enables a custom [IEditLabelHelper](https://docs.yworks.com/yfileshtml/#/api/IEditLabelHelper) for node labels. This helper has the following features:

- Each node can have at most two labels.
- The first label gets a special style and is placed on top of the node. In addition, it cannot be edited once it was created. Instead, a second label is created.
- The editing text box has a different background.

Editable Items

Specifies whether changing labels of nodes and edges is allowed.

Validation

Specifies whether new label texts are validated against the regular expression in the Pattern field. The default pattern does a simple email address verification.
