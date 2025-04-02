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
# 08 Configure Labels - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-configure-labels.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-graph-builder/08-configure-labels/).

In this tutorial step, you will learn how to configure [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) to place the labels of the graph elements at a desired position and configure their style.

Note

This step is optional when building a graph with [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder). If you do not want to add labels to your graph, you can proceed with the next step.

In this step, we will use a simple company ownership diagram.

```
const data = {
  nodeData: [
    {
      id: '0',
      name: 'Investment Capital',
      type: 'Corporation'
    },
    { id: '1', name: 'Melissa Barner', type: 'Trust' },
    { id: '2', name: 'Monster Inc', type: 'Corporation' },
    {
      id: '3',
      name: 'International Group',
      type: 'Trust'
    }
  ],
  edgeData: [
    {
      id: '0',
      sourceId: '1',
      targetId: '0',
      ownership: 30
    },
    {
      id: '1',
      sourceId: '2',
      targetId: '0',
      ownership: 60
    },
    {
      id: '2',
      sourceId: '3',
      targetId: '0',
      ownership: 5
    }
  ]
}
```

## Configure node labels

### Label placement

The label placement can be defined either using a _default_ configuration or using a _layout provider_ on the [LabelCreator](https://docs.yworks.com/yfileshtml/#/api/LabelCreator).

A default placement will apply to all labels of the [LabelsSource](https://docs.yworks.com/yfileshtml/#/api/LabelsSource) for which no other placement is specified. In this example, as a default, we place the labels at the center of the node as follows:

```
typeLabelCreator.defaults.layoutParameter = InteriorNodeLabelModel.CENTER
```

In the case where you want to determine the label position based on specific properties of the data, you can use a [layout parameter provider](https://docs.yworks.com/yfileshtml/#/api/LabelCreator#LabelCreator-property-layoutParameterProvider) which will provide the information about the desired label placement.

In this example, we want to create two labels for each node. The first label will be bound to the `type` property of our dataset and will use the `default` placement, i.e., at the center of the node. The second label will be bound to the `name` property and will be placed at the top side of the node, stretched over the node’s width. To achieve the desired placement, we create the layout provider as follows:

```
// position the label on the top of the node
nameLabelCreator.layoutParameterProvider = (): ILabelModelParameter =>
  StretchNodeLabelModel.TOP
```

### Label styles

Similar to node/edge styling, there exist three ways to style labels. Specifically, you can set _defaults_, _style_ _bindings_ and _style_ _providers_ on the [LabelCreator](https://docs.yworks.com/yfileshtml/#/api/LabelCreator).

In our example, we will first create a default style for all labels for which we will not set a specific style. More precisely, we use the [LabelStyle](https://docs.yworks.com/yfileshtml/#/api/LabelStyle) and align the text to the `center` of the node.

```
nameLabelCreator.defaults.style = new LabelStyle({
  horizontalTextAlignment: 'center'
})
```

Next, we will visualize the labels bound to the `type` property with a different font style. To achieve this, we have first to make sure that we do not share the same style to all labels.

```
// disable the sharing of the label style
typeLabelCreator.defaults.shareStyleInstance = false
// create a new binding to assign a new font
typeLabelCreator.styleBindings.addBinding('font', () => 'bold 12px Roboto')
```

For the labels bound to the `name` property, we want to use a different background color based on the `type` of the associated node. For these of type `Trust`, we will also add an icon using the [IconLabelStyle](https://docs.yworks.com/yfileshtml/#/api/IconLabelStyle).

```
// disable the sharing of the label style
nameLabelCreator.defaults.shareStyleInstance = false
// create a provider that will assign a new style, based on the type property
nameLabelCreator.styleProvider = (data): ILabelStyle => {
  if (data.type === 'Corporation') {
    return new LabelStyle({
      backgroundFill: orange,
      horizontalTextAlignment: 'center'
    })
  } else {
    return new IconLabelStyle({
      href: icon,
      iconSize: new Size(14, 14),
      iconPlacement: InteriorNodeLabelModel.LEFT,
      wrappedStyle: new LabelStyle({
        backgroundFill: pink,
        horizontalTextAlignment: 'center'
      })
    })
  }
}
```

### Label size

Using the same approach, the label size can be configured either using [size bindings](https://docs.yworks.com/yfileshtml/#/api/LabelCreator#LabelCreator-property-preferredSizeBindings) or using a [size provider](https://docs.yworks.com/yfileshtml/#/api/LabelCreator#LabelCreator-property-preferredSizeProvider). The following code shows how to set a different size to the labels of type `Trust`.

```
// set a new size for the labels with type 'Trust'
typeLabelCreator.preferredSizeProvider = (data): Size =>
  data.type === 'Trust' ? new Size(70, 15) : new Size(100, 15)

// set different widths for nodes with type 'Trust'
typeLabelCreator.preferredSizeBindings.addBinding('width', (data) => {
  return data.type === 'Trust' ? 200 : 100
})
```

## Configure edge labels

Following a similar approach, we can configure the edge labels. In this example, we bind the label text to the `ownership` property and select a layout parameter that will position the label near the middle of the associated edge path. Regarding the style, labels that show `ownership` values greater than `50%` are drawn in red-color.

```
// configure the position of the label
edgeLabelCreator.layoutParameterProvider = (): ILabelModelParameter =>
  new EdgePathLabelModel({
    autoRotation: false
  }).createRatioParameter()

// configure its style
edgeLabelCreator.defaults.shareStyleInstance = false
edgeLabelCreator.styleBindings.addBinding('textFill', (data) => {
  return (data.ownership ?? 0) > 50 ? red : grey
})
```

Note

Please have a look in this tutorial step’s demo code in `configure-labels.ts` and play around with the sample data and try different layout and styling for the labels.

[09 Configure Tags](../../tutorial-graph-builder/09-configure-tags/)
