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
# String Template Node Style Demo

# String Template Node Style Demo

This demo presents the built-in [StringTemplateNodeStyle](https://docs.yworks.com/yfileshtml/#/api/StringTemplateNodeStyle) that leverages simple data binding to declaratively render SVG as node style.

With this style, node visualizations are defined by a SVG templating language, similar to what is known in React, Vue, Angular, and similar frameworks. `StringTemplateNodeStyle`'s template language is a lot simpler and less powerful than the templating support in the aforementioned frameworks, but it is more lightweight and does not depend on third party software.

The section [Using SVG Templates in Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_template-styles) in the Developer's Guide elaborates on how to create template strings and which properties are available for data binding.

## Things to Try

Change the template of one or more nodes. Bind colors or text to properties in the tag. Then, apply the new template by pressing the button. Or modify the tag and see how the style changes.

## Related Documentation

- [Using Vue.js Templates in Node Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_vuejs-template-styles)
- [Using SVG Templates in Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_template-styles)

## Related Demos

- [Template Styles Demo](../../style/templatestyles/)
- [Vue Template Node Style Demo](../../../demos-ts/style/vue-template-node-style/)
- [React JSX Component Style Demo](../../style/react-template-node-style/)
- [Lit Template Node Style Demo](../../style/lit-template-node-style/)

## Additional Tools

Generally graphs containing this node style are compatible with [yEd Live](https://www.yworks.com/yed-live/), but converter functionality is not serialized and will not be available, so only simple data bindings will work in third party applications like yEd Live.
