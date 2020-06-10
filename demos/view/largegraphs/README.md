# Large Graphs Demo

<img src="../../resources/image/largegraphs.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/view/largegraphs/index.html).

This demo illustrates improvements in **rendering performance for large graphs** in [yFiles for HTML](https://www.yworks.com/products/yfileshtml/). The default settings are adequate for graphs up to a few hundred elements. Scaling to several thousand elements is possible with a bit of tweaking, though.

The impact of each individual setting depends on the graph, its layout, and how you interact with it. Each approach comes with different trade-offs to improve the performance. Some general approaches to performance tweaking can be explored in this demo. This demo serves as a viable starting point for handling large graphs, however it might be necessary to apply more use-case specific tweaks for your application.

## Control Elements

### Samples

Choose different sizes of graphs with or without labels. The graphs are served by an optimized _JSON_ data structure in order to lower the file size and loading times compared to GraphML. The labels are not saved with the graph but generated on demand.

### Performance Optimizations

- Graph Item Styles:

  The actual [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle) which is used to render the nodes.

- GraphModelManager Optimizations:

  The [GraphModelManager](https://docs.yworks.com/yfileshtml/#/api/GraphModelManager) (GMM) manages the visual appearance of the graph. A GMM tailored to your use case can have a massive impact on the performance of your application, especially for input gestures like panning, zooming, etc. The GraphModelManager implementation illustrated in this demo is designed to be plugged into your application and to work without strong efforts.

  The custom GraphModelManager shown in this demo switches between different rendering styles at different zoom intervals:

  Detail level

  Default rendering, using the currently selected item style

  Intermediate level

  Simplified rendering, using a basic SVG style

  Overview level

  WebGL rendering, leveraging the power of the graphics card

  This feature is disabled, because your browser does not support WebGL.

  There are eight **optimization modes** that improve the rendering performance for different use cases. Hover over each option to get more information on the individual approach and the use-cases it suits. In addition, the GraphModelManager is able to switch back to **default rendering** in order to point out the difference.

  More adjustments can be made in code, e.g., the maximum size of a pre-rendered canvas, the zoom threshold at which the pre-rendered image is updated for quality, etc. Please see the `FastGraphModelManager` API for more information.

- Auto Redraw:

  All except the first two GraphModelManager optimizations use a **static approach**, i.e., the visualization is created once and if ever, only sporadically updated. While this is sufficient for viewer applications, the visualization needs to be refreshed when the graph is edited, e.g., when a node has been moved, resized, created, or deleted.  
  The **automatic redraw** option makes this static approach usable in an application with editor capabilities. If the option is checked, the graph visualization is automatically updated after the graph has been edited. This is not a GraphModelManager feature, but added by the application.

  Additionally, the graph visualization can be redrawn manually.

### Benchmarking

This section provides means to compare the performance of different graph sizes and settings. The FPS meter is a lightweight implementation and doesn't have much impact on the performance. However, it can be disabled. The FPS meter measures the redraw frequency of the GraphComponent. Thus, if the graph component is idling no new frame is requested and the FPS meter does not show new information.

The Animation and Selection subsection can be used to compare the performance during typical user interactions. The buttons trigger standardized simulated interactions to evaluate the current settings.

### Detail Level Indicator

The box in the top left corner of the GraphComponent shows the current detail level used by the GraphModelManager.

### Warning Indicators

The combination of interaction mode, graph item styles and GraphModelManager optimizations in conjunction with the graph size result in different usability. To quickly estimate the usability of the chosen settings, we display the following icons:

![](./resources/exclamation.svg)

Unrecommended setting because of (possible) slow performance for the typical gestures or because of (possible) memory shortages.

![](./resources/warning.svg)

Caution against disabling auto redraw for interaction modes with edit gestures.

However, each setting can be tested despite the warnings because the actual performance depends on your system.
