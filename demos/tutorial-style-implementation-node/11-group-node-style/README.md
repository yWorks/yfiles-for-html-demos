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
# 11 Group Node Style - Tutorial: Node Style Implementation

# Writing a custom group node style

Now that we’ve learned how to write a style for nodes, we will apply this knowledge to group nodes. The good thing about group node styles is that they work exactly the same way as other node styles. This means that we could use our style for group nodes without changing anything.

As you can see, child nodes are placed inside the tab area of this style. To prevent this, we can define specific insets for the group by implementing the interface [INodeInsetsProvider](https://docs.yworks.com/yfileshtml/#/api/INodeInsetsProvider). We use the [lookup](https://docs.yworks.com/yfileshtml/#/dguide/customizing_concepts_lookup) mechanism to provide insets that consider the tab height for this style.

```
protected lookup(node: INode, type: Class): any {
  if (type === INodeInsetsProvider.$class) {
    // use a custom insets provider that reserves space for the tab
    return INodeInsetsProvider.create(
      (node) => new Insets(4, tabHeight + 4, 4, 4)
    )
  }
  return super.lookup(node, type)
}
```

[12 Group Node Style Behavior](../../tutorial-style-implementation-node/12-group-node-style-behavior/)
