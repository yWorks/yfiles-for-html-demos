# Demo Utility Files

The files in this directory implement demo features that are used in more than one specific demo. Like other demo code, you can use these files in your own project if it fits your needs.

#### ContextMenu.js

A simple context menu that provides methods to add context menu entries with specific listeners and means to open or close the context menu. It is used in any demo that requires a context menu and is especially featured in the [Context Menu](../input/contextmenu/index.html) demo.

#### DndPanel.js

A drag and drop panel which can be used to populate a given element with node visuals and the necessary listeners. This panel is demonstrated in the [Drag and Drop](../input/draganddrop/index.html) demo and is also used in any other demo that supports drag and drop of graph elements.

#### FileSaveSupport.js

Provides a static helper function to save files to the local filesystem. It makes use of the HTML5 file download or a proprietary approach in Internet Explorer. It is mainly used in the export demos, like the Image Export or PDF Export demo, though there is also a dedicated File Operations demo that illustrates how to save a GraphML file besides using implicit approaches with `ICommand.SAVE` or the methods of `GraphMLSupport`.

#### JsonIO.js

Contains helper classes that provide methods for JSON I/O of an `IGraph`. This implementation only supports de-/serialization of structural information, but it can be used as a starting point for including other information (e.g. item styles) as well.

#### VuejsNodeStyle.js

A template node style that leverages the powerful data binding and condition rendering features of the [Vue.js framework](https://vuejs.org/v2/guide/index.html). See the corresponding [template styles section in the developer's guide](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_vuejs-template-styles) and the [Vue.js Template Node Style Demo](../style/vuejstemplatenodestyle/index.html) for more details.

#### Workarounds.js

The yFiles for HTML library contains workarounds for several bugs of specific web browsers. An overview can be found at [Browser issues and included workarounds](https://docs.yworks.com/yfileshtml/#/kb/article/704/Browser_issues_and_included_workarounds). This helper enables those workarounds only for the affected browsers and is used throughout the demos. It is recommended to check if your application's target platform is affected from any browser issue and enabled the specific workaround in this user agents.
