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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /** bounds of the "tab" */
  const TAB_H = 16
  const TAB_W = 64
  const SMALL_TAB_W = 18
  const OUTER_RADIUS = 5
  const INNER_RADIUS = 3
  const INSET = 2

  /**
   * This group node style creates a visualization that is mainly a round
   * rectangle. Additionally, it displays a textual description in a tab-like
   * fashion on the top left and the toggle button in the lower right corner.
   * This implementation uses the convenience class
   * {@link yfiles.styles.NodeStyleBase} as the base class since
   * this makes customizations easy. Additionally, it uses a couple of inner
   * classes to customize certain aspects of the user interaction behavior, for
   * example a {@link yfiles.layout.IGroupBoundsCalculator} that takes the node labels
   * into account.
   * @extends yfiles.styles.NodeStyleBase
   */
  class MyGroupNodeStyle extends yfiles.styles.NodeStyleBase {
    constructor() {
      super()
      this.$nodeColor = 'rgba(0, 130, 180, 200)'
    }

    /** @return {yfiles.view.SvgVisual} */
    createVisual(context, node) {
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      this.render(g, this.createRenderDataCache(node, context))
      yfiles.view.SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
      return new yfiles.view.SvgVisual(g)
    }

    /** @return {yfiles.view.SvgVisual} */
    updateVisual(context, oldVisual, node) {
      const container = oldVisual.svgElement
      // get the data with which the oldvisual was created
      const oldCache = container['data-renderDataCache']
      // get the data for the new visual
      const newCache = this.createRenderDataCache(node, context)

      // check if something changed except for the location of the node
      if (!newCache.equals(newCache, oldCache)) {
        // something changed - re-render the visual
        while (container.hasChildNodes()) {
          // remove all children
          container.removeChild(container.firstChild)
        }
        this.render(container, newCache)
      }
      // make sure that the location is up to date
      yfiles.view.SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
      return oldVisual
    }

    /**
     * Creates the actual visualization of this style and adds it to the given container.
     */
    render(container, cache) {
      container['data-renderDataCache'] = cache

      const width = cache.width
      const height = cache.height

      if (!cache.isCollapsed) {
        // create outer path
        const outerPath = createOuterPath(width, height)
        const outerPathElement = outerPath.createSvgPath()
        outerPathElement.setAttribute('fill', cache.color)
        outerPathElement.setAttribute('fill-opacity', '0.1')
        container.appendChild(outerPathElement)

        // create border path
        const borderPath = outerPath
        borderPath.append(createInnerPath(width, height), false)
        const borderPathElement = borderPath.createSvgPath()
        borderPathElement.setAttribute('fill', cache.color)
        borderPathElement.setAttribute('fill-rule', 'evenodd')
        container.appendChild(borderPathElement)
      } else {
        // create outer path
        const outerPath = createOuterPath(width, height)
        const outerPathElement = outerPath.createSvgPath()
        outerPathElement.setAttribute('fill', cache.color)
        container.appendChild(outerPathElement)
      }

      if (!displayTextInTab(width)) {
        return
      }
      // optionally create text element for the tab
      const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.textContent = cache.isCollapsed ? 'Folder' : 'Group'
      text.setAttribute('transform', 'translate(20 14)')
      text.setAttribute('font-size', '14px')
      text.setAttribute('font-family', 'Arial')
      text.setAttribute('fill', '#333333')
      container.appendChild(text)
    }

    /**
     * Creates an object containing all necessary data to create a visual for the node.
     * @return {object}
     */
    createRenderDataCache(node, context) {
      return {
        color: this.getNodeColor(node),
        width: node.layout.width,
        height: node.layout.height,
        isCollapsed: isCollapsed(node, context),
        equals: (self, other) =>
          self.color === other.color &&
          self.width === other.width &&
          self.height === other.height &&
          self.isCollapsed === other.isCollapsed
      }
    }

    /**
     * Overridden to customize the behavior of this style with respect to certain user interaction.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#lookup}
     * @return {Object}
     */
    lookup(node, type) {
      // Determines the insets used for the group contents.
      if (type === yfiles.input.INodeInsetsProvider.$class) {
        // use a custom insets provider that reserves space for the tab and the toggle button
        return new yfiles.input.INodeInsetsProvider(
          group => new yfiles.geometry.Insets(6, TAB_H + 6, 6, 6)
        )
      }

      // Determines the minimum and maximum node size.
      if (type === yfiles.input.INodeSizeConstraintProvider.$class) {
        // use a custom size constraint provider to make sure that the tab
        // and the toggle button are always visible
        return new yfiles.input.INodeSizeConstraintProvider({
          // Returns a reasonable minimum size to show the tab and the toggle button.
          getMinimumSize: item =>
            new yfiles.geometry.Size(
              SMALL_TAB_W + OUTER_RADIUS + OUTER_RADIUS,
              TAB_H + OUTER_RADIUS
            ),
          // Returns infinity to don't limit the maximum size.
          getMaximumSize: item => yfiles.geometry.Size.INFINITE,
          // Returns the empty rectangle to don't constrain the area.
          getMinimumEnclosedArea: item => yfiles.geometry.Rect.EMPTY
        })
      }
      return super.lookup(node, type)
    }

    /**
     * Returns whether or not the given point hits the visualization of the
     * given node. This implementation is strict, it returns
     * <code>true</code> for the main rectangle and the tab area, but not
     * for the empty space to the left of the tab.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isHit}
     * @return {boolean}
     */
    isHit(canvasContext, p, node) {
      const rect = new yfiles.geometry.Rect(
        node.layout.x,
        node.layout.y + TAB_H,
        node.layout.width,
        node.layout.height - TAB_H
      )
      // check main node rect
      if (rect.containsWithEps(p, canvasContext.hitTestRadius)) {
        return true
      }
      // check tab
      const width = displayTextInTab(node.layout.width) ? TAB_W : SMALL_TAB_W
      return new yfiles.geometry.Rect(node.layout.x, node.layout.y, width, TAB_H).containsWithEps(
        p,
        canvasContext.hitTestRadius
      )
    }

    /**
     * Returns the exact outline for the given node. This information is used
     * to clip the node's edges correctly.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getOutline}
     * @return {yfiles.geometry.GeneralPath}
     */
    getOutline(node) {
      const path = createOuterPath(node.layout.width, node.layout.height)
      path.transform(new yfiles.geometry.Matrix(1, 0, 0, 1, node.layout.x, node.layout.y))
      return path
    }

    /**
     * Gets the fill color of the node.
     * @type {yfiles.view.Color}
     */
    get nodeColor() {
      return this.$nodeColor
    }

    /**
     * Sets the fill color of the node.
     * @type {yfiles.view.Color}
     */
    set nodeColor(value) {
      this.$nodeColor = value
    }

    /**
     * Determines the color to use for filling the node.
     * This implementation uses the {@link MyGroupNodeStyle#nodeColor} property unless
     * the {@link yfiles.graph.ITagOwner#tag} of the {@link yfiles.graph.INode} is of type {@link yfiles.view.Color},
     * in which case that color overrides this style's setting.
     * @param {yfiles.graph.INode} node The node to determine the color for.
     * @return {yfiles.view.Color} The color for filling the node.
     */
    getNodeColor(node) {
      return typeof node.tag === 'string' ? node.tag : this.nodeColor
    }
  }

  /**
   * Returns whether or not the given group node is collapsed.
   * @return {boolean}
   */
  function isCollapsed(node, context) {
    if (!(context.canvasComponent instanceof yfiles.view.GraphComponent)) {
      return false
    }
    const graphComponent = context.canvasComponent
    const foldedGraph = graphComponent.graph.foldingView
    if (foldedGraph === null) {
      return false
    }
    // check if the node is collapsed in the view graph
    return !foldedGraph.isExpanded(node)
  }

  /**
   * Creates the inner group path
   */
  function createInnerPath(w, h) {
    const i = INSET
    const r = INNER_RADIUS
    const path = new yfiles.geometry.GeneralPath()
    path.moveTo(i + r, i + TAB_H)
    path.lineTo(w - i - r, i + TAB_H)
    path.quadTo(w - i, i + TAB_H, w - i, i + TAB_H + r)
    path.lineTo(w - i, h - i - r)
    path.quadTo(w - i, h - i, w - i - r, h - i)
    path.lineTo(i + r, h - i)
    path.quadTo(i, h - i, i, h - i - r)
    path.lineTo(i, i + TAB_H + r)
    path.quadTo(i, i + TAB_H, i + r, i + TAB_H)
    path.close()
    return path
  }

  /**
   * Creates the outer group path
   */
  function createOuterPath(w, h) {
    const r = OUTER_RADIUS
    const tabWidth = displayTextInTab(w) ? TAB_W : SMALL_TAB_W
    const path = new yfiles.geometry.GeneralPath()
    path.moveTo(tabWidth + r, TAB_H)
    path.lineTo(w - r, TAB_H)
    path.quadTo(w, TAB_H, w, TAB_H + r)
    path.lineTo(w, h - r)
    path.quadTo(w, h, w - r, h)
    path.lineTo(r, h)
    path.quadTo(0, h, 0, h - r)
    path.lineTo(0, r)
    path.quadTo(0, 0, r, 0)
    path.lineTo(-r + tabWidth, 0)
    path.quadTo(tabWidth, 0, tabWidth, r)
    path.lineTo(tabWidth, TAB_H - r)
    path.quadTo(tabWidth, TAB_H, tabWidth + r, TAB_H)
    path.close()

    return path
  }

  /**
   * Checks whether the node is wide enough to display the large tab.
   * @param {number} w The node width.
   * @return {boolean}
   */
  function displayTextInTab(w) {
    return w >= TAB_W + OUTER_RADIUS + OUTER_RADIUS
  }

  return MyGroupNodeStyle
})
