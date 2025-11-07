/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  EdgePathCropper,
  EdgeStyleIndicatorRenderer,
  GroupNodeLabelModel,
  GroupNodeStyle,
  LabelStyle,
  PolylineEdgeStyle
} from '@yfiles/yfiles'

/**
 * Initializes the graph's styles, including edge highlighting, port cropping, group node styles,
 * and label styles.
 */
export function initGraphStyles(viewGraph) {
  viewGraph.decorator.edges.highlightRenderer.addConstant(
    new EdgeStyleIndicatorRenderer({
      edgeStyle: new PolylineEdgeStyle({
        smoothingLength: 50,
        stroke: 'currentColor',
        cssClass: 'edge-highlighted'
      }),
      zoomPolicy: 'world-coordinates'
    })
  )

  viewGraph.decorator.ports.edgePathCropper.addConstant(new EdgePathCropper({ extraCropLength: 2 }))

  viewGraph.groupNodeDefaults.style = new GroupNodeStyle({
    cssClass: 'demo-group-style',
    groupIcon: 'minus',
    folderIcon: 'plus',
    tabHeight: 30,
    tabWidth: 0,
    tabFill: getColor('--white'),
    tabPadding: 5,
    tabBackgroundFill: getColor('--demo-blue-dark'),
    tabPosition: 'top-trailing',
    stroke: `1px solid ${getColor('--demo-blue-dark')}`,
    iconSize: 20,
    contentAreaPadding: 20,
    cornerRadius: 7,
    hitTransparentContentArea: true
  })

  viewGraph.groupNodeDefaults.labels.style = new LabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    wrapping: 'wrap-character-ellipsis',
    textFill: getColor('--white'),
    textSize: 16,
    padding: [0, 0, 0, 5]
  })

  viewGraph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()
}

/**
 * Retrieves the computed value of a CSS color variable.
 */
export function getColor(colorVariable) {
  return getComputedStyle(document.documentElement).getPropertyValue(colorVariable)
}
