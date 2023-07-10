<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Script Loading Demo

# Script Loading Demo

This demo loads the yFiles modules using _<script>_ tags.

With script-tags, dependencies between the yFiles modules are not resolved automatically. Therefore, all modules that are used by an application have to be loaded separately and in the correct order, as shown in this [yFiles modules dependency diagram](https://docs.yworks.com/yfileshtml/#/dguide/introduction-modules).

In order to improve code completion, install the UMD variant of yFiles locally as npm module.
