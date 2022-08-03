# Recursive Group Layout Demo

<img src="../../resources/image/recursivegroup.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/recursivegroup/index.html).

# Recursive Group Layout Demo

Shows how to use the [RecursiveGroupLayout](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout) to apply different layouts to the contents of group nodes and the overall graph.

### Three-Tier Example

The example in this demo uses different layouts of elements assigned to different tiers. Each group node can be assigned to the left, right or middle tier (depending on the group node label).

As the overall layout, the so-called _core layout_, the [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) is used.

- All group nodes labeled _left_ are placed on the left side. Their content is drawn using a [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout) with layout orientation left-to-right.
- Analogously, all group nodes labeled _right_ are placed on the right side. Their content is drawn using a _TreeLayout_ with layout orientation right-to-left.
- Elements not assigned to _left_ or _right_ group nodes are always arranged in the middle using the [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) with layout orientation left-to-right. Note that group nodes not labeled _left_ or _right_ are handled non-recursively.

### Usage

- Calculate a layout by folding and unfolding a group node or pressing the layout button.
- Enable _From Sketch_ option to make _HierarchicLayout_ keep the relative locations of the group nodes to each other.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout/recursivegroup/ThreeTierLayout.ts).
