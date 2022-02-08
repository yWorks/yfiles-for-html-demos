# Rendering Optimizations Demo

<img src="../../resources/image/rendering-optimizations.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/view/rendering-optimizations/index.html).

# Rendering Optimizations Demo

This demo illustrates ways to improve the **rendering performance for large graphs** in [yFiles for HTML](https://www.yworks.com/products/yfileshtml/). yFiles' default settings are adequate for graphs up to a few hundred elements. Scaling to several thousand elements is possible with a bit of tweaking, though, as shown in this demo.

yFiles comes with a dedicated [WebGL2-based rendering pipeline](https://docs.yworks.com/yfileshtml/#/dguide/webgl2) that is especially suited for large graphs. This is the easiest way to get good performance for large data sets, but comes with a few drawbacks. This pipeline is enabled with the **WebGL2 rendering** option in the GraphModelManager Optimizations section.

The other options of this section show approaches to performance tweaking based on the normal yFiles rendering pipeline. All of them are realized in the source code of this demo, and serve as a viable starting point for handling large graphs in your project. However, it might be necessary to apply more use-case specific tweaks. The impact of each option depends on the graph, its layout, and how users interact with it.

## Settings Sidebar

### Samples

Choose different sizes of graphs with or without labels. The graphs are served by an optimized _JSON_ data structure for lower file size and loading times compared to GraphML. Labels are not saved with the graph but generated on demand.

### Performance Optimizations

- Graph Item Styles:

  The actual [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle) which is used to render the nodes.

- GraphModelManager Optimizations:

  The [GraphModelManager](https://docs.yworks.com/yfileshtml/#/api/GraphModelManager) (GMM) manages the visual appearance of the graph. A GMM tailored to your use case can have a massive impact on the performance of your application, especially for input gestures like panning, zooming, etc.

  This demo showcases two different GraphModelManager implementations. The demo's [WebGL2GraphModelManager](https://docs.yworks.com/yfileshtml/#/api/WebGL2GraphModelManager)\-based GMM uses yFiles' WebGL2-based rendering pipeline for the utmost performance gain.

  On the other hand, `FastGraphModelManager` (FGMM) shows how to improve performance for yFiles' normal rendering pipeline. This implementation is designed to be plugged right into your application and to work without much additional effort.  
  FGMM switches between different rendering styles at different zoom intervals:

  Detail level

  Default rendering, using the currently selected item style

  Intermediate level

  Simplified rendering, using a basic SVG style

  Overview level

  WebGL rendering, leveraging the power of the graphics card

  This feature is disabled, because your browser does not support WebGL.

  The demo provides eight **optimization modes** that improve rendering performance for different use cases. Hover over each option to get more information on the individual approach and the use cases for which it is intended. Additionally, it is possible to switch back to yFiles' **default rendering** settings to point out the difference between optimized and non-optimized rendering.

  More adjustments can be made in code, e.g., the maximum size of a pre-rendered canvas, the zoom threshold at which the pre-rendered image is updated for quality, etc. Please see the `FastGraphModelManager` API for more information.

- Auto Redraw:

  All except the first two GraphModelManager optimizations use a **static approach**, i.e., the visualization is created once and if ever, only sporadically updated. While this is sufficient for viewer applications, the visualization needs to be refreshed when the graph is edited, e.g., when a node has been moved, resized, created, or deleted.  
  The **automatic redraw** option makes this static approach usable in an application with editor capabilities. If the option is checked, the graph visualization is automatically updated after the graph has been edited. This is not a GraphModelManager feature, but added by the application.

  Additionally, the graph visualization can be redrawn manually.

### Benchmarking

This section provides means to compare the performance of different graph sizes and settings. The FPS meter is a lightweight implementation and does not have much impact on performance. However, it can be disabled. The FPS meter measures the redraw frequency of the GraphComponent. Thus, if the graph component is idling no new frame is requested and the FPS meter does not show new information.

The Animations and Selection subsections can be used to compare the performance during typical user interactions. The buttons trigger standardized simulated interactions to evaluate the current settings.

### Detail Level Indicator

The GraphModelManager's current level of detail is shown below the FPS meter.

### Warning Indicators

The combination of interaction mode, graph item styles and GraphModelManager optimizations in conjunction with the graph size results in different usability. To quickly estimate the usability of the chosen settings, we display the following icons:

![](./resources/exclamation.svg)

Unrecommended setting because of (possible) slow performance for the typical gestures or because of (possible) memory shortages.

![](./resources/warning.svg)

Caution against disabling auto redraw for interaction modes with edit gestures.

However, each setting can be tested despite the warnings because the actual performance depends on your system.
