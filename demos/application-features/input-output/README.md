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
# Save and Load GraphML - Application Features

<img src="../../../doc/demo-thumbnails/input-output.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/input-output/).

This demo shows how to use [GraphML input and output](https://docs.yworks.com/yfileshtml/#/dguide/io-loading_saving).

GraphML is the standard file format for yFiles for HTML. It is an XML format that provides great flexibility when storing custom data. However, note that these attributes (such as styles or even node locations) are not standardized, so you probably will not be able to exchange all of them between different graph libraries, for example.

Built-in types, in particular styles, can be de-/serialized out of the box which is illustrated in this application. Custom types can be de-/serialized automatically if they meet specific rules that are described in [Automatically Serialized Types](https://docs.yworks.com/yfileshtml/#/dguide/customizing_io_automatic-serialization).

How to de-/serialize complex types is described in [Serializing Complex Types](https://docs.yworks.com/yfileshtml/#/dguide/customizing_io_serialization_complex-types).

See the sources for details.
