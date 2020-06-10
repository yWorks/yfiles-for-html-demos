# AngularJS 1 Integration Demo

<img src="../../resources/image/angularjs1.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/toolkit/angular1/index.html).

# Description

This demo shows how to use yFiles for HTML in an AngularJS 1 app.

## Things to Try

- Select an employee either in the graph or in the employee list. The personal data of the selected one is displayed in the details panel.
- Edit the name of the selected employee. The name is automatically changed everywhere via two-way binding.
- Filter the graph and the employee list by name.

## AngularJS Features

An AngularJS directive is used to setup the `GraphComponent`. The graph is created automatically from JSON data using class `GraphBuilder`. The data is bound to the `GraphComponent` with the directive's attributes.

The `GraphComponent` directive also provides a way of specifying the node filter via an attribute. This filter is used to filter the node input array in code. A `watch` on the filter ensures that the graph is updated if the filter changes.

The `GraphComponent` directive provides a `currentNode` attribute that is updated with the currently focused graph item. This attribute is used to highlight the focused node in the nodes list and is updated accordingly if the `GraphComponent#currentItem` has changed as well as if the focused item in the nodes list changes.

The node styles use AngularJS templates to visualize the nodes, which are compiled before they are rendered. The templates can contain AngularJS bindings and directives.

**Level-of-detail rendering** is used by the node style. It has three different templates for different zoom levels.

A directive is used to abbreviate the employee names in the overview template.

The layout is provided by a `Service`.

The zoom buttons use a `Command` directive that binds the click events to yFiles commands.
