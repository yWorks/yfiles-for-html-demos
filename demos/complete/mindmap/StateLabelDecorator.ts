/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IconLabelStyle,
  ILabel,
  ILabelModelParameter,
  ILabelStyle,
  Insets,
  InteriorLabelModel,
  IRenderContext,
  LabelStyleBase,
  Size,
  SvgVisual,
  Visual
} from 'yfiles'
import type { NodeData } from './MindmapUtil'

/**
 * A decorator that renders an icon (the state label) with a text label.
 * This class implements the Decorator pattern. An innerStyle is used by this style
 * to render a text alongside with an icon. The style uses {@link StateLabelDecorator#wrappedStyle}
 * to render the icon. The icon is determined by the StateIcon property inside a nodes tag.
 * The placement of the icon is on the right (left) side of the text label for nodes on the
 * left (right) side of the tree. Visual caching is implemented using a helper class
 * RenderDataCache encapsulating the cached data.
 */
export default class StateLabelDecorator extends LabelStyleBase {
  labelModelParameterLeft: ILabelModelParameter = InteriorLabelModel.EAST
  labelModelParameterRight: ILabelModelParameter = InteriorLabelModel.WEST
  insetsLeft: Insets = new Insets(0, 0, StateLabelDecorator.STATE_ICON_SIZE.width + 4, 0)
  insetsRight: Insets = new Insets(StateLabelDecorator.STATE_ICON_SIZE.width + 4, 0, 0, 0)
  private _wrappedStyle: IconLabelStyle = new IconLabelStyle({
    icon: 'resources/no-icon-16.png',
    iconSize: StateLabelDecorator.STATE_ICON_SIZE,
    iconPlacement: this.labelModelParameterLeft
  })

  /**
   * The decorator constructor.
   * The wrapped labelStyle is passed as <code>wrappedStyle</code>
   * and used by the iconLabelStyle to render the text label.
   * @param wrappedStyle The wrapped labelStyle that is used to render the text.
   */
  constructor(wrappedStyle: ILabelStyle) {
    super()
    this._wrappedStyle.wrapped = wrappedStyle
  }

  /**
   * Returns the default icon's size.
   */
  static get STATE_ICON_SIZE(): Size {
    return new Size(16, 16)
  }

  /**
   * Returns an array with the state icons.
   */
  static get STATE_ICONS(): string[] {
    return [
      'no-icon',
      'smiley-happy',
      'smiley-not-amused',
      'smiley-grumpy',
      'abstract-green',
      'abstract-red',
      'abstract-blue',
      'questionmark',
      'exclamationmark',
      'delete',
      'checkmark',
      'star'
    ]
  }

  /**
   * Gets the style used to render the icon label.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  get wrappedStyle(): IconLabelStyle {
    return this._wrappedStyle
  }

  /**
   * Sets the style used to render the icon label.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @param value The style to be set.
   */
  set wrappedStyle(value: IconLabelStyle) {
    this._wrappedStyle = value
  }

  /**
   * Creates the Visual and initializes the RenderDataCache.
   * @param renderContext The render context.
   * @param label The label to which this style instance is assigned.
   * @see Overrides {@link LabelStyleBase#createVisual}
   */
  createVisual(renderContext: IRenderContext, label: ILabel): Visual {
    // create the cache for updating the visual
    const cache = this.createRenderDataCache(label.owner!.tag)
    this.configureIconStyle(cache)

    // create the wrapped style's visual
    const wrappedVisual = this.wrappedStyle.renderer
      .getVisualCreator(label, this.wrappedStyle)
      .createVisual(renderContext) as SvgVisual

    // store the cache with the container
    ;(wrappedVisual.svgElement as any)['data-iconRenderDataCache'] = cache
    return wrappedVisual
  }

  /**
   * Updates the Visual if cache data can be reused, creates a new Visual otherwise.
   * @param renderContext The render context.
   * @param oldVisual The old visual.
   * @param label The label to which this style instance is assigned.
   * @see Overrides {@link LabelStyleBase#updateVisual}
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, label: ILabel): Visual {
    const cache = this.createRenderDataCache(label.owner!.tag)
    const oldCache = ((oldVisual as SvgVisual).svgElement as any)['data-iconRenderDataCache']

    this.configureIconStyle(cache)
    let visual: SvgVisual
    if (!cache.equals(oldCache)) {
      visual = this.wrappedStyle.renderer
        .getVisualCreator(label, this.wrappedStyle)
        .createVisual(renderContext) as SvgVisual
    } else {
      visual = this.wrappedStyle.renderer
        .getVisualCreator(label, this.wrappedStyle)
        .updateVisual(renderContext, oldVisual) as SvgVisual
    }
    ;(visual.svgElement as any)['data-iconRenderDataCache'] = cache
    return visual
  }

  /**
   * Returns the preferred size of the wrapped {@link StateLabelDecorator#wrappedStyle}.
   * @param label The given label.
   * @see Overrides {@link LabelStyleBase#getPreferredSize}
   */
  getPreferredSize(label: ILabel): Size {
    const cache = this.createRenderDataCache(label.owner!.tag)
    this.configureIconStyle(cache)
    return this.wrappedStyle.renderer.getPreferredSize(label, this.wrappedStyle)
  }

  /**
   * Configures the wrappedStyle using parameters stored in RenderDataCache cache.
   * @param cache The data render cache.
   */
  configureIconStyle(cache: RenderDataCache): void {
    this.wrappedStyle.iconPlacement = cache.labelModelParameter
    this.wrappedStyle.wrappedInsets = cache.insets
    this.wrappedStyle.icon = cache.icon
    this.wrappedStyle.iconSize = cache.size
  }

  /**
   * Creates a RenderDataCache using values in NodeData.
   * @param data The label tag.
   */
  createRenderDataCache(data: NodeData): RenderDataCache {
    // place icon left or right of text
    const labelModelParameter = data.isLeft
      ? this.labelModelParameterLeft
      : this.labelModelParameterRight
    // use empty insets if there is no icon, else add space for the icon and text-to-icon padding
    let labelInsets: Insets
    if (data.stateIcon === 0) {
      labelInsets = Insets.EMPTY
    } else {
      labelInsets = data.isLeft ? this.insetsLeft : this.insetsRight
    }
    // get the filename
    const icon = `resources/${StateLabelDecorator.STATE_ICONS[data.stateIcon]}-16.svg`

    // use empty size if there is no icon, else use default size
    const iconSize = data.stateIcon === 0 ? Size.EMPTY : StateLabelDecorator.STATE_ICON_SIZE
    return new RenderDataCache(labelModelParameter, labelInsets, icon, iconSize)
  }
}

/**
 * Helper class that holds the data fields used by visual caching.
 * The equals method detects if the cache has changed.
 */
class RenderDataCache {
  constructor(
    public labelModelParameter: ILabelModelParameter,
    public insets: Insets,
    public icon: string,
    public size: Size
  ) {}

  equals(obj: object): boolean {
    if (!(obj instanceof RenderDataCache)) {
      return false
    }
    return (
      this.labelModelParameter === obj.labelModelParameter &&
      this.insets.equals(obj.insets) &&
      this.icon === obj.icon &&
      this.size.equals(obj.size)
    )
  }
}
