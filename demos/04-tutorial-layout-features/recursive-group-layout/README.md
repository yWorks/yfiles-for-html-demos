# Recursive Group Layout - Layout Features Tutorial

<img src="../../resources/image/tutorial4recursivegrouplayout.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/04-tutorial-layout-features/recursive-group-layout/index.html).

## Recursive Group Layout

This demo shows how to use the [Recursive Group Layout](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout).

The [Recursive Group Layout](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout) algorithm recursively traverses a hierarchically organized graph in a bottom-up fashion and applies a specified layout algorithm to the contents (direct children) of each group node.

In this demo for every group node a different layout algorithm is used:

- [Hierarchic Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) for group node 1
- [Organic Layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) for group node 2
- [Radial Layout](https://docs.yworks.com/yfileshtml/#/api/RadialLayout) for group node 3
- [RecursiveGroupLayout#NULL_LAYOUT](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout#NULL_LAYOUT) for group node 4

As the child nodes of group node 4 already have fixed layout values in the graph source, [RecursiveGroupLayout#NULL_LAYOUT](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout#NULL_LAYOUT) is used, as it does not alter the layout of the child nodes and is only used to calculate the size of the group node itself.

The content of groups without an assigned layout algorithm and the toplevel hierarchy is arranged with the [core layout algorithm](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout#coreLayout), if one has been specified.

The configuration of which algorithm to use for which group node is done by setting an [Item Mapping](https://docs.yworks.com/yfileshtml/#/api/ItemMapping) to the [groupNodeLayouts](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayoutData#groupNodeLayouts) property of [RecursiveGroupLayoutData](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayoutData).

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/04-tutorial-layout-features/recursive-group-layout/RecursiveGroupLayout.ts).

### Demos

You can also take a look at the [Recursive Group Layout](../../layout/recursivegroup/index.html) demo for more elaborate applications of this layout algorithm..
