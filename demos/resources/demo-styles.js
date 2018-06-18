/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
/* eslint-disable */

'use strict'

define(['yfiles/view-component'], function(yfiles) {
  /**
   * @class
   * @extends yfiles.styles.NodeStyleBase
   */
  var DemoNodeStyle = yfiles.lang.Class('DemoNodeStyle', {
    $extends: yfiles.styles.NodeStyleBase,

    constructor: function() {
      yfiles.styles.NodeStyleBase.call(this)
    },

    /**
     * Backing field for below property
     * @type {string}
     */
    $cssClass: '',

    /**
     * Gets or sets a custom css class that is assigned to the top level element representing the node.
     * @type {string}
     */
    cssClass: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: '' }),
          yfiles.lang.TypeAttribute(yfiles.lang.String.$class)
        ]
      },
      get: function() {
        return this.$cssClass
      },
      set: function(/**string*/ value) {
        this.$cssClass = value
      }
    },

    /**
     * Creates the visual for a node.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.view.IRenderContext} renderContext
     * @returns {yfiles.view.SvgVisual}
     */
    createVisual: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**yfiles.graph.INode*/ node
    ) {
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      var layout = node.layout
      var nodeRounding = 2
      rect.width.baseVal.value = layout.width
      rect.height.baseVal.value = layout.height
      rect.setAttribute('rx', nodeRounding)
      rect.setAttribute('ry', nodeRounding)
      rect.setAttribute('fill', '#FF8C00')
      rect.setAttribute('stroke', '#FFF')
      rect.setAttribute('stroke-width', '1px')

      if (this.cssClass) {
        rect.setAttribute('class', this.cssClass)
      }

      rect['data-renderDataCache'] = {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        cssClass: this.cssClass
      }

      rect.setAttribute('transform', 'translate(' + layout.x + ' ' + layout.y + ')')

      return new yfiles.view.SvgVisual(rect)
    },

    /**
     * Re-renders the node by updating the old visual for improved performance.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.SvgVisual} oldVisual
     * @returns {yfiles.view.SvgVisual}
     */
    updateVisual: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**yfiles.view.SvgVisual*/ oldVisual,
      /**yfiles.graph.INode*/ node
    ) {
      var rect = oldVisual.svgElement
      var cache = rect['data-renderDataCache']
      if (!cache) {
        return this.createVisual(renderContext, node)
      }

      var layout = node.layout
      var width = layout.width
      var height = layout.height

      if (cache.width !== width) {
        rect.width.baseVal.value = width
        cache.width = width
      }
      if (cache.height !== height) {
        rect.height.baseVal.value = height
        cache.height = height
      }
      if (cache.x !== layout.x || cache.y !== layout.y) {
        rect.transform.baseVal.getItem(0).setTranslate(layout.x, layout.y)
        cache.x = layout.x
        cache.y = layout.y
      }

      if (cache.cssClass !== this.cssClass) {
        if (this.cssClass) {
          rect.setAttribute('class', this.cssClass)
        } else {
          rect.removeAttribute('class')
        }
        cache.cssClass = this.cssClass
      }

      return oldVisual
    },

    /**
     * Gets the outline of the node, a round rect in this case.
     * @return {yfiles.geometry.GeneralPath}
     */
    getOutline: function(/**yfiles.graph.INode*/ node) {
      var path = new yfiles.geometry.GeneralPath()
      path.appendRectangle(node.layout, false)
      return path
    },

    /**
     * Hit test which considers HitTestRadius specified in CanvasContext.
     * @return {boolean} True if p is inside node.
     */
    isHit: function(
      /**yfiles.input.IInputModeContext*/ inputModeContext,
      /**yfiles.geometry.Point*/ p,
      /**yfiles.graph.INode*/ node
    ) {
      return DemoNodeStyle.$super.isHit.call(this, inputModeContext, p, node)
    },

    /**
     * Exact geometric check whether a point p lies inside the node.
     * @return {boolean}
     */
    isInside: function(/**yfiles.graph.INode*/ node, /**yfiles.geometry.Point*/ point) {
      return DemoNodeStyle.$super.isInside.call(this, node, point)
    }
  })

  /**
   * @class
   * @extends yfiles.styles.NodeStyleBase
   */
  var svgNS = 'http://www.w3.org/2000/svg'
  var BORDER_THICKNESS = 4
  // Due to a strange bug in Safari 10.8, calculating this in place as "2 * BORDER_THICKNESS" results in undefined
  // Therefore, keep this constant for now.
  var BORDER_THICKNESS2 = BORDER_THICKNESS + BORDER_THICKNESS
  var HEADER_THICKNESS = 22

  var DemoGroupStyle = yfiles.lang.Class('DemoGroupStyle', {
    $extends: yfiles.styles.NodeStyleBase,

    constructor: function() {
      yfiles.styles.NodeStyleBase.call(this)
    },

    /**
     * Backing field for below property
     * @type {string}
     */
    $cssClass: '',

    /**
     * Gets or sets a custom css class that is assigned to the top level element representing the node.
     * @type {string}
     */
    cssClass: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: '' }),
          yfiles.lang.TypeAttribute(yfiles.lang.String.$class)
        ]
      },
      get: function() {
        return this.$cssClass
      },
      set: function(/**string*/ value) {
        this.$cssClass = value
      }
    },

    /**
     * Backing field for below property
     * @type {boolean}
     */
    $isCollapsible: false,

    /**
     * Enables/disables collapsing of the group nodes
     * @type {boolean}
     */
    isCollapsible: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: false }),
          yfiles.lang.TypeAttribute(yfiles.lang.Boolean.$class)
        ]
      },
      get: function() {
        return this.$isCollapsible
      },
      set: function(/**boolean*/ value) {
        this.$isCollapsible = value
      }
    },

    /**
     * Backing field for below property
     * @type {boolean}
     */
    $solidHitTest: false,

    /**
     * Configures whether the inner area of an open group node is considered as a hit.
     * @type {boolean}
     */
    solidHitTest: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: false }),
          yfiles.lang.TypeAttribute(yfiles.lang.Boolean.$class)
        ]
      },
      get: function() {
        return this.$solidHitTest
      },
      set: function(/**boolean*/ value) {
        this.$solidHitTest = value
      }
    },

    $borderColor: '#68B0E3',
    $folderFrontColor: '#68B0E3',
    $folderBackColor: '#3C679B',

    /**
     * Creates the visual for a collapsed or expanded group node.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.view.IRenderContext} renderContext
     * @returns {yfiles.view.SvgVisual}
     */
    createVisual: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**yfiles.graph.INode*/ node
    ) {
      var gc = renderContext.canvasComponent
      var /**yfiles.geometry.IRectangle*/ layout = node.layout
      var /**SVGGElement*/ container = document.createElementNS(svgNS, 'g')
      // avoid defs support recursion - nothing to see here - move along!
      container.setAttribute('data-referencesafe', 'true')
      if (this.isCollapsed(node, gc)) {
        this.$renderFolder(node, container, renderContext)
      } else {
        this.$renderGroup(node, container, renderContext)
      }
      container.setAttribute('transform', 'translate(' + layout.x + ' ' + layout.y + ')')
      return new yfiles.view.SvgVisual(container)
    },

    /**
     * Re-renders the group node by updating the old visual for improved performance.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.SvgVisual} oldVisual
     * @returns {yfiles.view.SvgVisual}
     */
    updateVisual: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**yfiles.view.SvgVisual*/ oldVisual,
      /**yfiles.graph.INode*/ node
    ) {
      var /**Element*/ container = oldVisual.svgElement
      var cache = container['data-renderDataCache']
      if (!cache) {
        return this.createVisual(renderContext, node)
      }
      if (this.isCollapsed(node, renderContext.canvasComponent)) {
        this.$updateFolder(node, container, renderContext)
      } else {
        this.$updateGroup(node, container, renderContext)
      }
      return oldVisual
    },

    /**
     * Helper function to create a collapsed group node visual inside the given container.
     * @param {yfiles.graph.INode} node
     * @param {Element} container
     * @param {yfiles.view.IRenderContext} ctx
     */
    $renderFolder: function(
      /**yfiles.graph.INode*/ node,
      /**Element*/ container,
      /**yfiles.view.IRenderContext*/ ctx
    ) {
      var layout = node.layout
      var width = layout.width
      var height = layout.height

      var /**SVGRectElement*/ backgroundRect = document.createElementNS(svgNS, 'rect')
      backgroundRect.setAttribute('fill', this.$folderBackColor)
      backgroundRect.setAttribute('stroke', '#FFF')
      backgroundRect.setAttribute('stroke-width', '1px')
      backgroundRect.width.baseVal.value = width
      backgroundRect.height.baseVal.value = height

      var path =
        'M ' +
        (width - 0.5) +
        ',2 l -25,0 q -2,0 -4,3.75 l -4,7.5 q -2,3.75 -4,3.75 L 0.5,17 L 0.5,' +
        (height - 0.5) +
        ' l ' +
        (width - 1) +
        ',0 Z'

      var /**SVGPathElement*/ folderPath = document.createElementNS(svgNS, 'path')
      folderPath.setAttribute('d', path)
      folderPath.setAttribute('fill', this.$folderFrontColor)

      container.appendChild(backgroundRect)
      container.appendChild(folderPath)

      var /**yfiles.view.SvgVisual*/ expandButton = this.$createButton(false)
      yfiles.styles.CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(
        expandButton,
        node,
        ctx
      )
      expandButton.svgElement.setAttribute('transform', 'translate(' + (width - 17) + ' 5)')
      container.appendChild(expandButton.svgElement)

      if (this.$cssClass) {
        container.setAttribute('class', this.$cssClass + '-collapsed')
        backgroundRect.setAttribute('class', 'folder-background')
        folderPath.setAttribute('class', 'folder-foreground')
      }

      container['data-renderDataCache'] = {
        isCollapsible: this.isCollapsible,
        collapsed: true,
        width: width,
        height: height,
        x: layout.x,
        y: layout.y
      }
    },

    /**
     * Helper function to update the visual of a collapsed group node.
     * @param {yfiles.graph.INode} node
     * @param {Element} container
     * @param {yfiles.view.IRenderContext} ctx
     */
    $updateFolder: function(
      /**yfiles.graph.INode*/ node,
      /**Element*/ container,
      /**yfiles.view.IRenderContext*/ ctx
    ) {
      var cache = container['data-renderDataCache']
      if (!cache) {
        return this.$renderFolder(node, container, ctx)
      }
      if (this.isCollapsible !== cache.isCollapsible) {
        return this.$renderFolder(node, container, ctx)
      }

      var width = node.layout.width
      var height = node.layout.height
      var path, backgroundRect, folderPath

      if (!cache.collapsed) {
        // transition from expanded state
        path =
          'M ' +
          (width - 0.5) +
          ',2 l -25,0 q -2,0 -4,3.75 l -4,7.5 q -2,3.75 -4,3.75 L 0.5,17 L 0.5,' +
          (height - 0.5) +
          ' l ' +
          (width - 1) +
          ',0 Z'

        backgroundRect = container.childNodes.item(0)
        backgroundRect.setAttribute('fill', this.$folderBackColor)
        backgroundRect.setAttribute('stroke', '#FFF')
        backgroundRect.setAttribute('stroke-width', '1px')

        folderPath = document.createElementNS(svgNS, 'path')
        folderPath.setAttribute('d', path)
        folderPath.setAttribute('fill', this.$folderFrontColor)

        container.replaceChild(folderPath, container.childNodes.item(1))

        // - to +
        var buttonGroup = container.childNodes.item(2)

        var minus = buttonGroup.childNodes.item(1)
        var /**SVGRectElement*/ vMinus = document.createElementNS(svgNS, 'rect')
        vMinus.setAttribute('width', '2')
        vMinus.setAttribute('height', '8')
        vMinus.setAttribute('x', 5)
        vMinus.setAttribute('y', 2)
        vMinus.setAttribute('fill', this.$borderColor)
        vMinus.setAttribute('stroke-width', 0) // we don't want a stroke here, even if it is set in the corresponding
        // css class

        if (this.$cssClass) {
          container.setAttribute('class', this.$cssClass + '-collapsed')
          backgroundRect.setAttribute('class', 'folder-background')
          folderPath.setAttribute('class', 'folder-foreground')
          minus.setAttribute('class', 'folder-foreground')
          vMinus.setAttribute('class', 'folder-foreground')
        }

        buttonGroup.appendChild(vMinus)

        cache.collapsed = true
      }

      // update old visual
      if (cache.width !== width || cache.height !== height) {
        backgroundRect = container.childNodes.item(0)
        backgroundRect.width.baseVal.value = width
        backgroundRect.height.baseVal.value = height

        path =
          'M ' +
          (width - 0.5) +
          ',2 l -25,0 q -2,0 -4,3.75 l -4,7.5 q -2,3.75 -4,3.75 L 0.5,17 L 0.5,' +
          (height - 0.5) +
          ' l ' +
          (width - 1) +
          ',0 Z'
        folderPath = container.childNodes.item(1)
        folderPath.setAttribute('d', path)

        var expandButton = container.childNodes.item(2)
        expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)

        cache.width = width
        cache.height = height
      }

      var x = node.layout.x
      var y = node.layout.y
      if (cache.x !== x || cache.y !== y) {
        container.transform.baseVal.getItem(0).setTranslate(x, y)
        cache.x = x
        cache.y = y
      }
    },

    /**
     * Helper function to create an expanded group node visual inside the given container.
     * @param {yfiles.graph.INode} node
     * @param {Element} container
     * @param {yfiles.view.IRenderContext} ctx
     */
    $renderGroup: function(
      /**yfiles.graph.INode*/ node,
      /**Element*/ container,
      /**yfiles.view.IRenderContext*/ ctx
    ) {
      var /**yfiles.geometry.IRectangle*/ layout = node.layout
      var width = layout.width
      var height = layout.height

      var /**SVGRectElement*/ outerRect = document.createElementNS(svgNS, 'rect')
      outerRect.setAttribute('fill', this.$borderColor)
      outerRect.setAttribute('stroke', '#FFF')
      outerRect.setAttribute('stroke-width', '1px')
      outerRect.width.baseVal.value = width
      outerRect.height.baseVal.value = height

      var /**SVGRectElement*/ innerRect = document.createElementNS(svgNS, 'rect')
      var innerWidth = width - BORDER_THICKNESS2
      var headerHeight = HEADER_THICKNESS
      var innerHeight = height - headerHeight - BORDER_THICKNESS

      innerRect.setAttribute('fill', '#FFF')
      innerRect.x.baseVal.value = BORDER_THICKNESS
      innerRect.y.baseVal.value = headerHeight
      innerRect.width.baseVal.value = innerWidth
      innerRect.height.baseVal.value = innerHeight

      container.appendChild(outerRect)
      container.appendChild(innerRect)

      if (this.isCollapsible) {
        var /**yfiles.view.SvgVisual*/ collapseButton = this.$createButton(true)
        yfiles.styles.CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(
          collapseButton,
          node,
          ctx
        )
        collapseButton.svgElement.setAttribute('transform', 'translate(' + (width - 17) + ' 5)')
        container.appendChild(collapseButton.svgElement)
      }

      if (this.$cssClass) {
        container.setAttribute('class', this.$cssClass + '-expanded')
        outerRect.setAttribute('class', 'group-border')
      }

      container['data-renderDataCache'] = {
        isCollapsible: this.isCollapsible,
        collapsed: false,
        width: width,
        x: layout.x,
        y: layout.y,
        height: height
      }
    },

    /**
     * Helper function to update the visual of an expanded group node.
     * @param {yfiles.graph.INode} node
     * @param {Element} container
     * @param {yfiles.view.IRenderContext} ctx
     */
    $updateGroup: function(
      /**yfiles.graph.INode*/ node,
      /**Element*/ container,
      /**yfiles.view.IRenderContext*/ ctx
    ) {
      var cache = container['data-renderDataCache']
      if (!cache) {
        return this.$renderGroup(node, container, ctx)
      }
      if (this.isCollapsible !== cache.isCollapsible) {
        return this.$renderGroup(node, container, ctx)
      }

      var width = node.layout.width
      var height = node.layout.height
      var backgroundRect, innerRect, innerWidth, innerHeight, headerHeight

      if (cache.collapsed) {
        // transition from collapsed state
        backgroundRect = container.childNodes.item(0)
        backgroundRect.setAttribute('fill', this.$borderColor)

        innerRect = document.createElementNS(svgNS, 'rect')
        innerWidth = width - BORDER_THICKNESS2
        headerHeight = HEADER_THICKNESS
        innerHeight = height - headerHeight - BORDER_THICKNESS
        innerRect.setAttribute('fill', '#FFF')

        innerRect.x.baseVal.value = BORDER_THICKNESS
        innerRect.y.baseVal.value = headerHeight
        innerRect.width.baseVal.value = innerWidth
        innerRect.height.baseVal.value = innerHeight

        container.replaceChild(innerRect, container.childNodes.item(1))

        // + to -
        var buttonGroup = container.childNodes.item(2)
        buttonGroup.removeChild(buttonGroup.childNodes.item(2))

        if (this.$cssClass) {
          container.setAttribute('class', this.$cssClass + '-expanded')
          backgroundRect.setAttribute('class', 'group-border')
          var minus = buttonGroup.childNodes.item(1)
          minus.setAttribute('class', 'group-border')
        }

        cache.collapsed = false
      }

      // update old visual
      if (cache.width !== width || cache.height !== height) {
        backgroundRect = container.childNodes.item(0)
        backgroundRect.width.baseVal.value = width
        backgroundRect.height.baseVal.value = height

        innerWidth = width - BORDER_THICKNESS2
        headerHeight = HEADER_THICKNESS
        innerHeight = height - headerHeight - BORDER_THICKNESS

        innerRect = container.childNodes.item(1)
        innerRect.width.baseVal.value = innerWidth
        innerRect.height.baseVal.value = innerHeight

        if (this.isCollapsible) {
          var expandButton = container.childNodes.item(2)
          expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)
        }

        cache.width = width
        cache.height = height
      }
      var x = node.layout.x
      var y = node.layout.y
      if (cache.x !== x || cache.y !== y) {
        container.transform.baseVal.getItem(0).setTranslate(x, y)
        cache.x = x
        cache.y = y
      }
    },

    /**
     * Helper function to create the collapse/expand button.
     * @param {boolean} collapse
     * @return {yfiles.view.SvgVisual}
     */
    $createButton: function(collapse) {
      var color = this.$borderColor
      var /**Element*/ container = document.createElementNS(svgNS, 'g')
      var /**SVGRectElement*/ rect = document.createElementNS(svgNS, 'rect')
      rect.setAttribute('fill', '#FFF')
      rect.setAttribute('width', '12')
      rect.setAttribute('height', '12')
      rect.setAttribute('rx', '1')
      rect.setAttribute('ry', '1')

      var /**SVGRectElement*/ minus = document.createElementNS(svgNS, 'rect')
      minus.setAttribute('width', '8')
      minus.setAttribute('height', '2')
      minus.setAttribute('x', 2)
      minus.setAttribute('y', 5)
      minus.setAttribute('fill', color)
      minus.setAttribute('stroke-width', 0) // we don't want a stroke here, even if it is set in the corresponding css
      // class

      container.appendChild(rect)
      container.appendChild(minus)

      if (this.$cssClass) {
        minus.setAttribute('class', collapse ? 'group-border' : 'folder-foreground')
      }

      if (!collapse) {
        var /**SVGRectElement*/ vMinus = document.createElementNS(svgNS, 'rect')
        vMinus.setAttribute('width', '2')
        vMinus.setAttribute('height', '8')
        vMinus.setAttribute('x', 5)
        vMinus.setAttribute('y', 2)
        vMinus.setAttribute('fill', color)
        vMinus.setAttribute('stroke-width', 0) // we don't want a stroke here, even if it is set in the corresponding
        // css class

        container.appendChild(vMinus)

        if (this.$cssClass) {
          vMinus.setAttribute('class', 'folder-foreground')
        }
      }

      container.setAttribute('class', 'demo-collapse-button')
      return new yfiles.view.SvgVisual(container)
    },

    /** @return {Object} */
    lookup: function(/**yfiles.graph.INode*/ node, /**yfiles.lang.Class*/ type) {
      if (type === yfiles.input.ILassoTestable.$class) {
        return new yfiles.input.ILassoTestable((context, lassoPath) => {
          const path = new yfiles.geometry.GeneralPath()
          let insetsProvider = node.lookup(yfiles.input.INodeInsetsProvider.$class)
          if (insetsProvider) {
            let insets = insetsProvider.getInsets(node)
            let outerRect = node.layout.toRect()
            path.appendRectangle(outerRect, false)
            // check if its completely outside
            if (!lassoPath.areaIntersects(path, context.hitTestRadius)) {
              return false
            }
            path.clear()
            let innerRect = outerRect.getReduced(insets)
            path.appendRectangle(innerRect, false)
            // now it's a hit if either the inner border is hit or one point of the border
            // itself is contained in the lasso
            return (
              lassoPath.intersects(path, context.hitTestRadius) ||
              lassoPath.areaContains(node.layout.topLeft)
            )
          } else {
            // no insets - we only check the center of the node.
            return lassoPath.areaContains(node.layout.center, context.hitTestRadius)
          }
        })
      } else if (type === yfiles.input.INodeInsetsProvider.$class) {
        return new yfiles.input.INodeInsetsProvider(node => {
          const margin = 5
          return new yfiles.geometry.Insets(
            BORDER_THICKNESS + margin,
            HEADER_THICKNESS + margin,
            BORDER_THICKNESS + margin,
            BORDER_THICKNESS + margin
          )
        })
      } else if (type === yfiles.input.INodeSizeConstraintProvider.$class) {
        return new yfiles.input.NodeSizeConstraintProvider(
          new yfiles.geometry.Size(40, 30),
          yfiles.geometry.Size.INFINITE,
          yfiles.geometry.Rect.EMPTY
        )
      }
      return DemoGroupStyle.$super.lookup.call(this, node, type)
    },

    /**
     * Hit test which considers HitTestRadius specified in CanvasContext.
     * @return {boolean} True if p is inside node.
     */
    isHit: function(
      /**yfiles.input.IInputModeContext*/ inputModeContext,
      /**yfiles.geometry.Point*/ p,
      /**yfiles.graph.INode*/ node
    ) {
      var layout = node.layout.toRect()
      if (this.solidHitTest || this.isCollapsed(node, inputModeContext.canvasComponent)) {
        return layout.containsWithEps(p, inputModeContext.hitTestRadius)
      } else {
        if (
          (yfiles.input.CreateEdgeInputMode &&
            inputModeContext.parentInputMode instanceof yfiles.input.CreateEdgeInputMode &&
            inputModeContext.parentInputMode.isCreationInProgress) ||
          (inputModeContext.parentInputMode instanceof yfiles.input.MoveInputMode &&
            inputModeContext.parentInputMode.isDragging) ||
          inputModeContext.parentInputMode instanceof yfiles.input.DropInputMode
        ) {
          // during edge creation - the whole area is considered a hit
          return layout.containsWithEps(p, inputModeContext.hitTestRadius)
        }
        var innerWidth = layout.width - BORDER_THICKNESS2
        var innerHeight = layout.height - HEADER_THICKNESS - BORDER_THICKNESS
        var innerLayout = new yfiles.geometry.Rect(
          layout.x + BORDER_THICKNESS,
          layout.y + HEADER_THICKNESS,
          innerWidth,
          innerHeight
        ).getEnlarged(-inputModeContext.hitTestRadius)

        return layout.containsWithEps(p, inputModeContext.hitTestRadius) && !innerLayout.contains(p)
      }
    },

    isInBox: function(
      /**yfiles.input.IInputModeContext*/ inputModeContext,
      /**yfiles.geometry.Rect*/ box,
      /**yfiles.graph.INode*/ node
    ) {
      return box.contains(node.layout.topLeft) && box.contains(node.layout.bottomRight)
    },

    /**
     * Gets the outline of the node, a round rect in this case.
     * @return {yfiles.geometry.GeneralPath}
     */
    getOutline: function(/**yfiles.graph.INode*/ node) {
      var path = new yfiles.geometry.GeneralPath()
      path.appendRectangle(node.layout, false)
      return path
    },

    /**
     * Returns whether or not the given group node is collapsed.
     * @return {boolean}
     */
    isCollapsed: function(/**yfiles.graph.INode*/ node, gc) {
      if (!(gc instanceof yfiles.view.GraphComponent)) {
        return false
      }
      var /**yfiles.graph.IFoldingView*/ foldedGraph = gc.graph.foldingView
      // check if given node is in graph
      if (foldedGraph === null || !foldedGraph.graph.contains(node)) {
        return false
      }
      // check if the node really is a group in the master graph
      return !foldedGraph.isExpanded(node)
    }
  })

  /**
   * @class
   * @implements {yfiles.styles.IArrow}
   * @implements {yfiles.view.IVisualCreator}
   * @implements {yfiles.view.IBoundsProvider}
   */
  var DemoArrow = yfiles.lang.Class('DemoArrow', {
    $with: [yfiles.styles.IArrow, yfiles.view.IVisualCreator, yfiles.view.IBoundsProvider],

    // these variables hold the state for the flyweight pattern
    // they are populated in GetPaintable and used in the implementations of the IVisualCreator interface.
    /**
     * @type {yfiles.geometry.Point}
     */
    $anchor: null,

    /**
     * @type {yfiles.geometry.Point}
     */
    $direction: null,

    /**
     * @type {yfiles.geometry.GeneralPath}
     */
    $arrowFigure: null,

    /**
     * Backing field for below property
     * @type {string}
     */
    $cssClass: '',

    /**
     * Gets or sets a custom css class that is assigned to the arrow.
     * @type {string}
     */
    cssClass: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: '' }),
          yfiles.lang.TypeAttribute(yfiles.lang.String.$class)
        ]
      },
      get: function() {
        return this.$cssClass
      },
      set: function(/**string*/ value) {
        this.$cssClass = value
      }
    },

    /**
     * Returns the length of the arrow, i.e. the distance from the arrow's tip to
     * the position where the visual representation of the edge's path should begin.
     * @see Specified by {@link yfiles.styles.IArrow#length}.
     * @type {number}
     */
    length: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: 5.5 }),
          yfiles.lang.TypeAttribute(yfiles.lang.Number.$class)
        ]
      },
      get: function() {
        return 5.5
      }
    },

    /**
     * Gets the cropping length associated with this instance.
     * This value is used by {@link yfiles.styles.IEdgeStyle}s to let the
     * edge appear to end shortly before its actual target.
     * @see Specified by {@link yfiles.styles.IArrow#cropLength}.
     * @type {number}
     */
    cropLength: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: 1 }),
          yfiles.lang.TypeAttribute(yfiles.lang.Number.$class)
        ]
      },
      get: function() {
        return 1
      }
    },

    /**
     * Gets an {@link yfiles.view.IVisualCreator} implementation that will create
     * the visual for this arrow
     * at the given location using the given direction for the given edge.
     * @param {yfiles.graph.IEdge} edge the edge this arrow belongs to
     * @param {boolean} atSource whether this will be the source arrow
     * @param {yfiles.geometry.Point} anchor the anchor point for the tip of the arrow
     * @param {yfiles.geometry.Point} direction the direction the arrow is pointing in
     * @return {yfiles.view.IVisualCreator} Itself as a flyweight.
     * @see Specified by {@link yfiles.styles.IArrow#getPaintable}.
     */
    getVisualCreator: function(
      /**yfiles.graph.IEdge*/ edge,
      /**boolean*/ atSource,
      /**yfiles.geometry.Point*/ anchor,
      /**yfiles.geometry.Point*/ direction
    ) {
      this.$anchor = anchor
      this.$direction = direction
      return this
    },

    /**
     * Gets an {@link yfiles.view.IBoundsProvider} implementation that can yield
     * this arrow's bounds if painted at the given location using the
     * given direction for the given edge.
     * @param {yfiles.graph.IEdge} edge the edge this arrow belongs to
     * @param {boolean} atSource whether this will be the source arrow
     * @param {yfiles.geometry.Point} anchor the anchor point for the tip of the arrow
     * @param {yfiles.geometry.Point} direction the direction the arrow is pointing in
     * @return {yfiles.view.IBoundsProvider}
     * an implementation of the {@link yfiles.view.IBoundsProvider} interface that can
     * subsequently be used to query the bounds. Clients will always call
     * this method before using the implementation and may not cache the instance returned.
     * This allows for applying the flyweight design pattern to implementations.
     * @see Specified by {@link yfiles.styles.IArrow#getBoundsProvider}.
     */
    getBoundsProvider: function(
      /**yfiles.graph.IEdge*/ edge,
      /**boolean*/ atSource,
      /**yfiles.geometry.Point*/ anchor,
      /**yfiles.geometry.Point*/ direction
    ) {
      this.$anchor = anchor
      this.$direction = direction
      return this
    },

    /**
     * This method is called by the framework to create a visual
     * that will be included into the {@link yfiles.view.IRenderContext}.
     * @param {yfiles.view.IRenderContext} ctx The context that describes where the visual will be used.
     * @return {yfiles.view.Visual}
     * The arrow visual to include in the canvas object visual tree./>.
     * @see {@link DemoArrow#updateVisual}
     * @see Specified by {@link yfiles.view.IVisualCreator#createVisual}.
     */
    createVisual: function(/**yfiles.view.IRenderContext*/ ctx) {
      // Create a new path to draw the arrow
      if (this.$arrowFigure === null) {
        this.$arrowFigure = new yfiles.geometry.GeneralPath()
        this.$arrowFigure.moveTo(new yfiles.geometry.Point(-7.5, -2.5))
        this.$arrowFigure.lineTo(new yfiles.geometry.Point(0, 0))
        this.$arrowFigure.lineTo(new yfiles.geometry.Point(-7.5, 2.5))
        this.$arrowFigure.close()
      }

      var /**SVGPathElement*/ path = window.document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )
      path.setAttribute('d', this.$arrowFigure.createSvgPathData())
      path.setAttribute('fill', '#336699')

      if (this.$cssClass) {
        path.setAttribute('class', this.$cssClass)
      }

      // Rotate arrow and move it to correct position
      path.setAttribute(
        'transform',
        'matrix(' +
          this.$direction.x +
          ' ' +
          this.$direction.y +
          ' ' +
          -this.$direction.y +
          ' ' +
          this.$direction.x +
          ' ' +
          this.$anchor.x +
          ' ' +
          this.$anchor.y +
          ')'
      )

      path['data-renderDataCache'] = {
        direction: this.$direction,
        anchor: this.$anchor
      }

      return new yfiles.view.SvgVisual(path)
    },

    /**
     * This method updates or replaces a previously created visual for inclusion
     * in the {@link yfiles.view.IRenderContext}.
     * The {@link yfiles.view.CanvasComponent} uses this method to give implementations a chance to
     * update an existing Visual that has previously been created by the same instance during a call
     * to {@link DemoArrow#createVisual}. Implementations may update the <code>oldVisual</code>
     * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
     * @param {yfiles.view.IRenderContext} ctx The context that describes where the visual will be used in.
     * @param {yfiles.view.Visual} oldVisual The visual instance that had been returned the last time the
     *   {@link DemoArrow#createVisual} method was called on this instance.
     * @return {yfiles.view.Visual}
     *  <code>oldVisual</code>, if this instance modified the visual, or a new visual that should replace the
     * existing one in the canvas object visual tree.
     * @see {@link DemoArrow#createVisual}
     * @see {@link yfiles.view.ICanvasObjectDescriptor}
     * @see {@link yfiles.view.CanvasComponent}
     * @see Specified by {@link yfiles.view.IVisualCreator#updateVisual}.
     */
    updateVisual: function(/**yfiles.view.IRenderContext*/ ctx, /**yfiles.view.Visual*/ oldVisual) {
      var /**SVGPathElement*/ path = oldVisual.svgElement
      var cache = path['data-renderDataCache']

      if (this.$direction !== cache.direction || this.$anchor !== cache.anchor) {
        path.setAttribute(
          'transform',
          'matrix(' +
            this.$direction.x +
            ' ' +
            this.$direction.y +
            ' ' +
            -this.$direction.y +
            ' ' +
            this.$direction.x +
            ' ' +
            this.$anchor.x +
            ' ' +
            this.$anchor.y +
            ')'
        )
      }

      return oldVisual
    },

    /**
     * Returns the bounds of the arrow for the current flyweight configuration.
     * @see Specified by {@link yfiles.view.IBoundsProvider#getBounds}.
     * @return {yfiles.geometry.Rect}
     */
    getBounds: function(/**yfiles.view.ICanvasContext*/ ctx) {
      return new yfiles.geometry.Rect(this.$anchor.x - 8, this.$anchor.y - 8, 32, 32)
    }
  })

  var svgNS = 'http://www.w3.org/2000/svg'
  var isBrowserWithBadMarkerSupport = $isMicrosoftBrowser() || $detectSafariWebkit()

  /**
   * Check if the used browser is IE or Edge.
   * @returns {boolean}
   */
  function $isMicrosoftBrowser() {
    return (
      window.navigator.userAgent.indexOf('MSIE ') > 0 ||
      !!window.navigator.userAgent.match(/Trident.*rv\:11\./) ||
      !!window.navigator.userAgent.match(/Edge\/(1[2678])./i)
    )
  }

  /**
   * Returns version of Safari.
   * @return {number} Version of Safari or -1 if browser is not Safari.
   */
  function $detectSafariVersion() {
    var ua = window.navigator.userAgent
    var isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
    if (isSafari) {
      var safariVersionMatch = ua.match(new RegExp('Version\\/(\\d*\\.\\d*)', ''))
      if (safariVersionMatch && safariVersionMatch.length > 1) {
        return parseInt(safariVersionMatch[1])
      }
    }
    return -1
  }

  /**
   * Returns true for browsers that use the Safari 11 Webkit engine.
   *
   * In detail, these are Safari 11 on either macOS or iOS, Chrome on iOS 11, and Firefox on iOS 11.
   * @return {boolean}
   */
  function $detectSafariWebkit() {
    return $detectSafariVersion() > -1 || !!/(CriOS|FxiOS)/.exec(window.navigator.userAgent)
  }

  /**
   * @class
   * @extends yfiles.styles.EdgeStyleBase
   */
  var DemoEdgeStyle = yfiles.lang.Class('DemoEdgeStyle', {
    $extends: yfiles.styles.EdgeStyleBase,

    constructor: function() {
      yfiles.styles.EdgeStyleBase.call(this)

      var hiddenArrow = new yfiles.styles.Arrow()
      hiddenArrow.type = yfiles.styles.ArrowType.NONE
      hiddenArrow.cropLength = 6
      hiddenArrow.scale = 1
      this.$hiddenArrow = hiddenArrow
      this.$fallbackArrow = new DemoArrow()
    },

    /**
     * @type {DemoEdgeStyle.MarkerDefsSupport}
     */
    $markerDefsSupport: null,

    /**
     * Backing field for below property
     * @type {string}
     */
    $cssClass: '',

    /**
     * Gets or sets a custom css class that is assigned to the top level element representing the node.
     * @type {string}
     */
    cssClass: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: '' }),
          yfiles.lang.TypeAttribute(yfiles.lang.String.$class)
        ]
      },
      get: function() {
        return this.$cssClass
      },
      set: function(/**string*/ value) {
        this.$cssClass = value
      }
    },

    /**
     * Backing field for below property
     * @type {boolean}
     */
    $showTargetArrows: true,

    /**
     * Enables or disables target arrows.
     * @type {boolean}
     */
    showTargetArrows: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: true }),
          yfiles.lang.TypeAttribute(yfiles.lang.Boolean.$class)
        ]
      },
      get: function() {
        return this.$showTargetArrows
      },
      set: function(/**boolean*/ value) {
        this.$showTargetArrows = value
      }
    },

    /**
     * Backing field for below property
     * @type {boolean}
     */
    $useMarkerArrows: true,

    /**
     * Set to false to use yfiles.styles.IArrow instead of markers.
     * @type {boolean}
     */
    useMarkerArrows: {
      $meta: function() {
        return [
          yfiles.graphml.GraphMLAttribute().init({ defaultValue: true }),
          yfiles.lang.TypeAttribute(yfiles.lang.Boolean.$class)
        ]
      },
      get: function() {
        return this.$useMarkerArrows
      },
      set: function(/**boolean*/ value) {
        this.$useMarkerArrows = value
      }
    },

    /**
     * Arrows to use in IE because markers are not supported properly in IE.
     * @type {yfiles.styles.IArrow}
     */
    $fallbackArrow: null,

    /**
     * Hidden arrow to crop the path when using markers as arrows.
     * @type {yfiles.styles.Arrow}
     */
    $hiddenArrow: null,

    /**
     * Helper function to crop a {@link yfiles.geometry.GeneralPath} by the length of the used arrow.
     * @param {yfiles.graph.IEdge} edge
     * @param {yfiles.geometry.GeneralPath} gp
     * @returns {yfiles.geometry.GeneralPath}
     */
    $cropRenderedPath: function(/**yfiles.graph.IEdge*/ edge, /**yfiles.geometry.GeneralPath*/ gp) {
      if (this.$showTargetArrows) {
        var dummyArrow =
          !isBrowserWithBadMarkerSupport && this.$useMarkerArrows
            ? this.$hiddenArrow
            : this.$fallbackArrow
        return this.cropPath(edge, yfiles.styles.IArrow.NONE, dummyArrow, gp)
      } else {
        return this.cropPath(edge, yfiles.styles.IArrow.NONE, yfiles.styles.IArrow.NONE, gp)
      }
    },

    /**
     * Creates the visual for an edge.
     * @param {yfiles.graph.IEdge} edge
     * @param {yfiles.view.IRenderContext} renderContext
     * @returns {yfiles.view.Visual}
     */
    createVisual: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**yfiles.graph.IEdge*/ edge
    ) {
      var /**yfiles.geometry.GeneralPath*/ renderPath = this.$createPath(edge)
      // crop the path such that the arrow tip is at the end of the edge
      renderPath = this.$cropRenderedPath(edge, renderPath)

      if (renderPath.length === 0) {
        return null
      }

      var gp = this.createPathWithBridges(renderPath, renderContext)

      var /**SVGPathElement*/ path = document.createElementNS(svgNS, 'path')
      var pathData = gp.size === 0 ? '' : gp.createSvgPathData()
      path.setAttribute('d', pathData)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', '#336699')

      if (this.$cssClass) {
        path.setAttribute('class', this.$cssClass)
        this.$fallbackArrow.cssClass = this.$cssClass + '-arrow'
      }

      if (!isBrowserWithBadMarkerSupport && this.$useMarkerArrows) {
        this.$showTargetArrows &&
          path.setAttribute(
            'marker-end',
            'url(#' + renderContext.getDefsId(this.$createMarker()) + ')'
          )

        path['data-renderDataCache'] = {
          path: renderPath,
          obstacleHash: this.getObstacleHash(renderContext)
        }
        return new yfiles.view.SvgVisual(path)
      } else {
        // use yfiles arrows instead of markers
        var container = document.createElementNS(svgNS, 'g')
        container.appendChild(path)
        this.$showTargetArrows &&
          DemoEdgeStyle.$super.addArrows.call(
            this,
            renderContext,
            container,
            edge,
            gp,
            yfiles.styles.IArrow.NONE,
            this.$fallbackArrow
          )
        container['data-renderDataCache'] = {
          path: renderPath,
          obstacleHash: this.getObstacleHash(renderContext)
        }
        return new yfiles.view.SvgVisual(container)
      }
    },

    /**
     * Re-renders the edge by updating the old visual for improved performance.
     * @param {yfiles.graph.IEdge} edge
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @returns {yfiles.view.Visual}
     */
    updateVisual: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**yfiles.view.Visual*/ oldVisual,
      /**yfiles.graph.IEdge*/ edge
    ) {
      if (oldVisual === null) {
        return this.createVisual(renderContext, edge)
      }

      var /**yfiles.geometry.GeneralPath*/ renderPath = this.$createPath(edge)
      if (renderPath.length === 0) {
        return null
      }
      // crop the path such that the arrow tip is at the end of the edge
      renderPath = this.$cropRenderedPath(edge, renderPath)
      var newObstacleHash = this.getObstacleHash(renderContext)

      var /**SVGPathElement*/ path = oldVisual.svgElement
      var cache = path['data-renderDataCache']
      if (!renderPath.hasSameValue(cache['path']) || cache['obstacleHash'] !== newObstacleHash) {
        cache['path'] = renderPath
        cache['obstacleHash'] = newObstacleHash
        var gp = this.createPathWithBridges(renderPath, renderContext)
        var pathData = gp.size === 0 ? '' : gp.createSvgPathData()
        if (!isBrowserWithBadMarkerSupport && this.$useMarkerArrows) {
          // update code for marker arrows
          path.setAttribute('d', pathData)
          return oldVisual
        } else {
          // update code for yfiles arrows
          var container = oldVisual.svgElement
          path = container.childNodes.item(0)
          path.setAttribute('d', pathData)
          while (container.childElementCount > 1) {
            container.removeChild(container.lastChild)
          }
          this.$showTargetArrows &&
            DemoEdgeStyle.$super.addArrows.call(
              this,
              renderContext,
              container,
              edge,
              gp,
              yfiles.styles.IArrow.NONE,
              this.$fallbackArrow
            )
        }
      }
      return oldVisual
    },

    /**
     * Creates the path of an edge.
     * @param {yfiles.graph.IEdge} edge
     * @returns {yfiles.geometry.GeneralPath}
     */
    $createPath: function(/**yfiles.graph.IEdge*/ edge) {
      var path
      // build path
      if (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) {
        // pretty self loops
        var outerX, outerY
        if (edge.bends.size == 1) {
          var bendLocation = edge.bends.get(0).location
          outerX = bendLocation.x
          outerY = bendLocation.y
        } else {
          if (yfiles.graph.INode.isInstance(edge.sourcePort.owner)) {
            outerX = edge.sourcePort.owner.layout.x - 20
            outerY = edge.sourcePort.owner.layout.y - 20
          } else {
            var sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
              edge.sourcePort,
              edge.sourcePort.locationParameter
            )
            outerX = sourcePortLocation.x - 20
            outerY = sourcePortLocation.y - 20
          }
        }
        path = new yfiles.geometry.GeneralPath(4)
        var lastPoint = edge.sourcePort.locationParameter.model.getLocation(
          edge.sourcePort,
          edge.sourcePort.locationParameter
        )
        path.moveTo(lastPoint)
        path.lineTo(outerX, lastPoint.y)
        path.lineTo(outerX, outerY)
        lastPoint = edge.targetPort.locationParameter.model.getLocation(
          edge.targetPort,
          edge.targetPort.locationParameter
        )
        path.lineTo(lastPoint.x, outerY)
        path.lineTo(lastPoint)
      } else {
        path = DemoEdgeStyle.$super.getPath.call(this, edge)
      }
      return path
    },

    /**
     * Gets the path of the edge cropped at the node border.
     * @param {yfiles.graph.IEdge} edge
     * @returns {yfiles.geometry.GeneralPath}
     */
    getPath: function(/**yfiles.graph.IEdge*/ edge) {
      var path = this.$createPath(edge)
      // crop path at node border
      return this.cropPath(edge, yfiles.styles.IArrow.NONE, yfiles.styles.IArrow.NONE, path)
    },

    /**
     * Decorates a given path with bridges.
     * All work is delegated to the BridgeManager's addBridges() method.
     * @param {yfiles.geometry.GeneralPath} path The path to decorate.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @return {yfiles.geometry.GeneralPath} A copy of the given path with bridges.
     */
    createPathWithBridges: function(
      /**yfiles.geometry.GeneralPath*/ path,
      /**yfiles.view.IRenderContext*/ context
    ) {
      var /**yfiles.view.BridgeManager*/ manager = this.getBridgeManager(context)
      // if there is a bridge manager registered: use it to add the bridges to the path
      return manager === null ? path : manager.addBridges(context, path, null)
    },

    /**
     * Gets an obstacle hash from the context.
     * The obstacle hash changes if any obstacle has changed on the entire graph.
     * The hash is used to avoid re-rendering the edge if nothing has changed.
     * This method gets the obstacle hash from the BridgeManager.
     * @param {yfiles.view.IRenderContext} context The context to get the obstacle hash for.
     * @return {number} A hash value which represents the state of the obstacles.
     */
    getObstacleHash: function(/**yfiles.view.IRenderContext*/ context) {
      var /**yfiles.view.BridgeManager*/ manager = this.getBridgeManager(context)
      // get the BridgeManager from the context's lookup. If there is one
      // get a hash value which represents the current state of the obstacles.
      return manager === null ? 42 : manager.getObstacleHash(context)
    },

    /**
     * Queries the context's lookup for a BridgeManager instance.
     * @param {yfiles.view.IRenderContext} context The context to get the BridgeManager from.
     * @return {yfiles.view.BridgeManager} The BridgeManager for the given context instance or null
     */
    getBridgeManager: function(/**yfiles.view.IRenderContext*/ context) {
      if (!context) {
        return null
      }
      var bm = context.lookup(yfiles.view.BridgeManager.$class)
      return bm instanceof yfiles.view.BridgeManager ? bm : null
    },

    /**
     * Determines whether the visual representation of the edge has been hit at the given location.
     * @param {yfiles.graph.IEdge} edge
     * @param {yfiles.geometry.Point} p
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @returns {boolean}
     */
    isHit: function(
      /**yfiles.input.IInputModeContext*/ inputModeContext,
      /**yfiles.geometry.Point*/ p,
      /**yfiles.graph.IEdge*/ edge
    ) {
      if (
        (edge.sourcePort.owner == edge.targetPort.owner && edge.bends.size < 2) ||
        DemoEdgeStyle.$super.isHit.call(this, inputModeContext, p, edge)
      ) {
        var path = this.getPath(edge)
        return path && path.pathContains(p, inputModeContext.hitTestRadius + 1)
      } else {
        return false
      }
    },

    /**
     * Determines whether the edge visual is visible or not.
     * @param {yfiles.graph.IEdge} edge
     * @param {yfiles.geometry.Rect} clip
     * @param {yfiles.view.ICanvasContext} canvasContext
     * @returns {boolean}
     */
    isVisible: function(
      /**yfiles.view.ICanvasContext*/ canvasContext,
      /**yfiles.geometry.Rect*/ clip,
      /**yfiles.graph.IEdge*/ edge
    ) {
      if (edge.sourcePort.owner == edge.targetPort.owner && edge.bends.size < 2) {
        // handle self-loops
        var spl = edge.sourcePort.locationParameter.model.getLocation(
          edge.sourcePort,
          edge.sourcePort.locationParameter
        )
        var tpl = edge.targetPort.locationParameter.model.getLocation(
          edge.targetPort,
          edge.targetPort.locationParameter
        )
        if (clip.contains(spl)) {
          return true
        }

        var outerX, outerY
        if (edge.bends.size === 1) {
          var bendLocation = edge.bends.get(0).location
          outerX = bendLocation.x
          outerY = bendLocation.y
        } else {
          if (yfiles.graph.INode.isInstance(edge.sourcePort.owner)) {
            outerX = edge.sourcePort.owner.layout.x - 20
            outerY = edge.sourcePort.owner.layout.y - 20
          } else {
            var sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
              edge.sourcePort,
              edge.sourcePort.locationParameter
            )
            outerX = sourcePortLocation.x - 20
            outerY = sourcePortLocation.y - 20
          }
        }

        // intersect the self-loop lines with the clip
        return (
          clip.intersectsLine(spl, new yfiles.geometry.Point(outerX, spl.y)) ||
          clip.intersectsLine(
            new yfiles.geometry.Point(outerX, spl.y),
            new yfiles.geometry.Point(outerX, outerY)
          ) ||
          clip.intersectsLine(
            new yfiles.geometry.Point(outerX, outerY),
            new yfiles.geometry.Point(tpl.x, outerY)
          ) ||
          clip.intersectsLine(new yfiles.geometry.Point(tpl.x, outerY), tpl)
        )
      }

      return DemoEdgeStyle.$super.isVisible.call(this, canvasContext, clip, edge)
    },

    /**
     * Helper method to let the svg marker be created by the {@link yfiles.view.ISvgDefsCreator} implementation.
     * @return {yfiles.view.ISvgDefsCreator}
     */
    $createMarker: function() {
      if (this.$markerDefsSupport === null) {
        this.$markerDefsSupport = new DemoEdgeStyle.MarkerDefsSupport(this.$cssClass)
      }
      return this.$markerDefsSupport
    },

    /**
     * This implementation of the look up provides a custom implementation of the
     * {@link yfiles.model.IObstacleProvider} to support bridges.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#lookup}
     * @return {Object}
     */
    lookup: function(/**yfiles.graph.IEdge*/ edge, /**yfiles.lang.Class*/ type) {
      if (type === yfiles.view.IObstacleProvider.$class) {
        // Provide the own IObstacleProvider implementation
        return new DemoEdgeStyle.BasicEdgeObstacleProvider(edge)
      } else {
        return DemoEdgeStyle.$super.lookup.call(this, edge, type)
      }
    },

    /** @lends {DemoEdgeStyle} */
    $static: {
      /**
       * Manages the arrow markers as svg definitions.
       * @class
       * @implements {yfiles.view.ISvgDefsCreator}
       */
      MarkerDefsSupport: new yfiles.lang.ClassDefinition(function() {
        /** @lends {DemoEdgeStyle.MarkerDefsSupport.prototype} */
        return {
          $with: [yfiles.view.ISvgDefsCreator],

          $cssClass: null,

          constructor: function(/**string*/ cssClass) {
            this.$cssClass = cssClass
          },

          /** @return {SVGElement} */
          createDefsElement: function(/**yfiles.view.ICanvasContext*/ context) {
            var /**markerType*/ markerElement = document.createElementNS(svgNS, 'marker')
            markerElement.setAttribute('viewBox', '0 0 15 10')
            markerElement.setAttribute('refX', 2)
            markerElement.setAttribute('refY', 5)
            markerElement.setAttribute('markerWidth', '7')
            markerElement.setAttribute('markerHeight', '7')
            markerElement.setAttribute('orient', 'auto')

            var /**SVGPathElement*/ path = document.createElementNS(svgNS, 'path')
            path.setAttribute('d', 'M 0 0 L 15 5 L 0 10 z')
            path.setAttribute('fill', '#336699')

            if (this.$cssClass) {
              path.setAttribute('class', this.$cssClass + '-arrow')
            }

            markerElement.appendChild(path)
            return markerElement
          },

          /** @return {boolean} */
          accept: function(
            /**yfiles.view.ICanvasContext*/ context,
            /**Node*/ node,
            /**string*/ id
          ) {
            if (node.nodeType !== 1) {
              return false
            }
            return yfiles.view.ISvgDefsCreator.isAttributeReference(node, 'marker-end', id)
          },

          updateDefsElement: function(
            /**yfiles.view.ICanvasContext*/ context,
            /**SVGElement*/ oldElement
          ) {
            // Nothing to do here
          }
        }
      }),

      /**
       * A custom IObstacleProvider implementation for this style.
       * @class
       * @implements {yfiles.model.IObstacleProvider}
       */
      BasicEdgeObstacleProvider: new yfiles.lang.ClassDefinition(function() {
        /** @lends {DemoEdgeStyle.BasicEdgeObstacleProvider.prototype} */
        return {
          $with: [yfiles.view.IObstacleProvider],

          constructor: function(/**yfiles.graph.IEdge*/ edge) {
            this.edge = edge
          },

          /**
           * @type {yfiles.graph.IEdge}
           */
          edge: null,

          /**
           * Returns this edge's path as obstacle.
           * @param {yfiles.view.IRenderContext} canvasContext
           * @return {yfiles.geometry.GeneralPath} The edge's path.
           */
          getObstacles: function(/**yfiles.view.IRenderContext*/ canvasContext) {
            return this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()
          }
        }
      })
    }
  })

  /**
   * The class provides functionality for custom style of overview control.
   * @class
   * @extends yfiles.view.GraphOverviewCanvasVisualCreator
   */
  var DemoStyleOverviewPaintable = yfiles.lang.Class('DemoStyleOverviewPaintable', {
    $extends: yfiles.view.GraphOverviewCanvasVisualCreator,

    constructor: function(/**yfiles.graph.IGraph*/ graph) {
      yfiles.view.GraphOverviewCanvasVisualCreator.call(this, graph)
    },

    /**
     *
     * @see Overrides {@link yfiles.view.CanvasOverviewGraphPaintable#paintNode}
     * @param ctx
     * @param renderContext
     * @param node
     */
    paintNode: function(
      /**yfiles.view.IRenderContext*/ renderContext,
      /**Object*/ ctx,
      /**yfiles.graph.INode*/ node
    ) {
      ctx.fillStyle = 'rgb(128, 128, 128)'
      var layout = node.layout
      ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
    },

    /**
     * @param {Object} ctx
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.INode} node
     */
    paintGroupNode: function(renderContext, ctx, node) {
      ctx.fill = 'rgb(211, 211, 211)'
      ctx.fillStyle = 'rgb(211, 211, 211)'
      ctx.strokeStyle = 'rgb(211, 211, 211)'
      ctx.lineWidth = 4
      var layout = node.layout
      ctx.strokeRect(layout.x, layout.y, layout.width, layout.height)
      ctx.fillRect(layout.x, layout.y, layout.width, 22)
      ctx.lineWidth = 1
    }
  })

  var initDemoStyles = function(/**yfiles.graph.IGraph*/ graph) {
    // set graph defaults
    graph.nodeDefaults.style = new DemoNodeStyle()
    graph.edgeDefaults.style = new DemoEdgeStyle()

    var nodeLabelStyle = new yfiles.styles.DefaultLabelStyle()
    //#5f8ac4
    nodeLabelStyle.textFill = new yfiles.view.SolidColorFill(50, 50, 50)
    graph.nodeDefaults.labels.style = nodeLabelStyle

    var edgeLabelStyle = new yfiles.styles.DefaultLabelStyle()
    edgeLabelStyle.textFill = nodeLabelStyle.textFill
    graph.edgeDefaults.labels.style = edgeLabelStyle

    var foldingEnabled = graph.foldingView !== null
    var groupStyle = new DemoGroupStyle()
    groupStyle.isCollapsible = foldingEnabled

    graph.groupNodeDefaults.style = groupStyle

    // A label model with insets for the expand/collapse button
    var groupLabelModel = new yfiles.graph.InteriorStretchLabelModel()
    groupLabelModel.insets = new yfiles.geometry.Insets(4, 4, foldingEnabled ? 18 : 4, 4)

    graph.groupNodeDefaults.labels.layoutParameter = groupLabelModel.createParameter(
      yfiles.graph.InteriorStretchLabelModelPosition.NORTH
    )

    var /**yfiles.styles.DefaultLabelStyle*/ groupLabelStyle = new yfiles.styles.DefaultLabelStyle()
    groupLabelStyle.textFill = yfiles.view.Fill.WHITE
    groupLabelStyle.wrapping = yfiles.view.TextWrapping.CHARACTER_ELLIPSIS
    graph.groupNodeDefaults.labels.style = groupLabelStyle
  }

  return {
    DemoNodeStyle: DemoNodeStyle,
    DemoEdgeStyle: DemoEdgeStyle,
    DemoGroupStyle: DemoGroupStyle,
    DemoArrow: DemoArrow,
    DemoStyleOverviewPaintable: DemoStyleOverviewPaintable,
    initDemoStyles: initDemoStyles
  }
})
