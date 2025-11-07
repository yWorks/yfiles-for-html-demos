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
# 07 Create Labels Sources - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-create-labels-sources.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-graph-builder/07-create-labels-sources/).

In this tutorial step, you will learn how to configure [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) in order to add labels to the visualization.

Note

This step is optional when building a graph with [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder). If you do not want to add labels to your graph, you can proceed with the next step.

## Loading node label information

There are three ways to add labels to the visualization using [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder). You can use _bindings_ or load the labels from their own _sources_ on the [NodeCreator](https://docs.yworks.com/yfileshtml/#/api/NodeCreator).

For this step, we will use a simple company ownership diagram.

### Creating labels using bindings

If you want to create the label text based on the properties of the business data, you can bind the text to a property in the node’s data. For example, in the dataset below, we bind the label text to the `name` of the associated node.

```
const nodeData = [
  { id: '0', name: 'Investment Capital' },
  { id: '1', name: 'Melissa Barner' }
]
const nodesSource = graphBuilder.createNodesSource(nodeData, 'id')

// create the label binding to the name property
nodesSource.nodeCreator.createLabelBinding((data) => data.name)
```

The label binding can also be set explicitly using the [text provider](https://docs.yworks.com/yfileshtml/#/api/LabelCreator#textProvider) property. In this example, the label text is converted to upper-case to show that text can be augmented.

```
const nodeData = [{ id: '2', name: 'Monster Inc' }]
const nodesSource = graphBuilder.createNodesSource(nodeData, 'id')

// create the text provider that will return the name of each node
const labelCreator = nodesSource.nodeCreator.createLabelBinding()
labelCreator.textProvider = (data): string => data.name.toUpperCase()
```

### Creating labels from their own sources

If the node data contains a varying number of label data, you can use a [LabelsSource](https://docs.yworks.com/yfileshtml/#/api/LabelsSource) to create the labels. For instance, take a look at the dataset below where the label information is stored in the `owners` property.

```
const nodeData = [
  { id: '3', owners: ['Local Group', 'Germany'] },
  { id: '4', owners: ['International Group'] }
]
```

In this case, the provider which is given as a parameter is expected to return an enumerable of data items where each item represents one label.

```
// create the label sources based on the `owners` property
const labelsSource = nodesSource.nodeCreator.createLabelsSource(
  (data) => data.owners
)
```

### Loading edge label information

Following a similar approach, we can also create labels for the edges. In this example, we bind the edge label text to the `ownership` property of the dataset, and we add some more text information.

```
const edgeData = [
  { id: '0', sourceId: '1', targetId: '0', ownership: 30 },
  { id: '1', sourceId: '0', targetId: '2', ownership: 60 },
  { id: '2', sourceId: '4', targetId: '0', ownership: 5 },
  { id: '3', sourceId: '3', targetId: '0', ownership: 5 }
]
const edgesSource = graphBuilder.createEdgesSource(
  edgeData,
  'sourceId',
  'targetId',
  'id'
)

// bind the label text data and add some more text information
edgesSource.edgeCreator.createLabelBinding(
  (data) => `Owns ${data.ownership}%`
)
```

Note

Please have a look in this tutorial step’s demo code in `create-labels-sources.ts` and play around with the different ways to add labels to the visualization.

[08 Configure Labels](../../tutorial-graph-builder/08-configure-labels/)
