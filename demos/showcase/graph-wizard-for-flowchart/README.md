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
# Graph Wizard for Flowchart

# Graph Wizard for Flowchart

## Graph Wizard

The Graph Wizard for Flowchart demo shows how graph defaults and input gestures can be customized to support fast creation of flowchart diagrams.

Context-sensitive and complex input gestures are defined and managed by a _GraphWizardInputMode_, that filters all possible actions for a graph item by some pre-conditions. All active actions are then listed in the **Legend** that also contains their keyboard shortcuts. While an action is executed, the **Legend** is hidden.

Many actions can be triggered by a button that is displayed close to the current model item when the action is active. Those buttons can also be accessed via keyboard by pressing the _Tab_ key and confirming the action using _Enter_.

## Flowchart Diagrams

Flowchart Diagrams consist of several flowchart nodes connected by directed edges that represent the flow between the nodes.

Each flowchart node has a specific type that is visualized by the according node shape. The type also influences which actions are available for the node.

## Things to Try

- Press _Space_ to create a new flowchart node in a free direction. Note that after the new node and an edge to it are created, the node type can be selected and the labels for the edge and node can be edited.
- Use the **Arrow** keys to switch to another node in this direction.
- Press the _C_ key to trigger the shortcut for switching the node color.
- Click on the node type button and choose the diamond-shaped **Decision** type. For this you can either click the corresponding button or focus it using the _Arrow_ keys and select is using _Enter_.

  Note that the new **Create two child nodes...** action is now available for the decision node.

- Click the **Add two child nodes** button of a decision node to create two nodes with edges from the decision node and edit their labels.

  During this multi-step action, pressing the _Esc_ key brings you back to the last step.

- Press the _L_ key or click the layout button in the main toolbar to calculate a fresh layout from scratch.
