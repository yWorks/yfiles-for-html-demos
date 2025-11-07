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
  type Constructor,
  type GeneralPath,
  type ICanvasContext,
  type IInputModeContext,
  type ILabel,
  type IRenderContext,
  LabelStyleBase,
  type MarkupLabelStyle,
  type Point,
  type Rect,
  SimpleLabel,
  type Size,
  type Visual
} from '@yfiles/yfiles'
import MarkdownIt from 'markdown-it'

/**
 * A wrapper for {@link MarkupLabelStyle} that converts Markdown to markup on the fly.
 */
export class MarkdownLabelStyle extends LabelStyleBase {
  readonly markupLabelStyle: MarkupLabelStyle
  // the Markdown parser/renderer
  private static markdownIt: MarkdownIt = new MarkdownIt()

  private readonly simpleLabel = new SimpleLabel()
  private readonly markupCache = new WeakMap<ILabel, { markdown: string; markup: string }>()

  constructor(markupLabelStyle: MarkupLabelStyle) {
    super()
    this.markupLabelStyle = markupLabelStyle
  }

  protected createVisual(context: IRenderContext, label: ILabel): Visual | null {
    return this.markupLabelStyle.renderer
      .getVisualCreator(this.getMarkupLabel(label), this.markupLabelStyle)
      .createVisual(context)
  }

  protected updateVisual(context: IRenderContext, oldVisual: Visual, label: ILabel): Visual | null {
    return this.markupLabelStyle.renderer
      .getVisualCreator(this.getMarkupLabel(label), this.markupLabelStyle)
      .updateVisual(context, oldVisual)
  }

  protected getBounds(context: ICanvasContext, label: ILabel): Rect {
    return this.markupLabelStyle.renderer
      .getBoundsProvider(this.getMarkupLabel(label), this.markupLabelStyle)
      .getBounds(context)
  }

  protected getPreferredSize(label: ILabel): Size {
    return this.markupLabelStyle.renderer.getPreferredSize(
      this.getMarkupLabel(label),
      this.markupLabelStyle
    )
  }

  protected isHit(context: IInputModeContext, location: Point, label: ILabel): boolean {
    return this.markupLabelStyle.renderer
      .getHitTestable(this.getMarkupLabel(label), this.markupLabelStyle)
      .isHit(context, location)
  }

  protected isInBox(context: IInputModeContext, rectangle: Rect, label: ILabel): boolean {
    return this.markupLabelStyle.renderer
      .getMarqueeTestable(this.getMarkupLabel(label), this.markupLabelStyle)
      .isInBox(context, rectangle)
  }

  protected isInPath(context: IInputModeContext, path: GeneralPath, label: ILabel): boolean {
    return this.markupLabelStyle.renderer
      .getLassoTestable(this.getMarkupLabel(label), this.markupLabelStyle)
      .isInPath(context, path)
  }

  protected isVisible(context: ICanvasContext, rectangle: Rect, label: ILabel): boolean {
    return this.markupLabelStyle.renderer
      .getVisibilityTestable(this.getMarkupLabel(label), this.markupLabelStyle)
      .isVisible(context, rectangle)
  }

  protected lookup(label: ILabel, type: Constructor): any {
    return this.markupLabelStyle.renderer
      .getContext(this.getMarkupLabel(label), this.markupLabelStyle)
      .lookup(type)
  }

  /**
   * Returns a new label with the Markdown text replaced with markup text.
   */
  private getMarkupLabel(label: ILabel): ILabel {
    this.simpleLabel.text = this.getMarkupText(label)
    this.simpleLabel.owner = label.owner
    this.simpleLabel.layoutParameter = label.layoutParameter
    this.simpleLabel.style = label.style
    this.simpleLabel.preferredSize = label.preferredSize
    this.simpleLabel.tag = label.tag
    return this.simpleLabel
  }

  /**
   * Converts the Markdown text to markup and caches it for faster conversion
   * in the future.
   */
  private getMarkupText(label: ILabel): string {
    let cacheEntry = this.markupCache.get(label)
    if (!cacheEntry || cacheEntry.markdown !== label.text) {
      cacheEntry = { markdown: label.text, markup: MarkdownLabelStyle.getMarkupText(label.text) }
      this.markupCache.set(label, cacheEntry)
    }
    return cacheEntry.markup
  }

  /**
   * Converts the given Markdown text into HTML markup.
   * @param markdownText The label Markdown text
   * @yjs:keep = render
   */
  static getMarkupText(markdownText: string): string {
    // return the Markdown text
    return MarkdownLabelStyle.markdownIt.render(markdownText)
  }
}
