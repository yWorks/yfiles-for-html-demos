/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * An {@link ICanvasObjectDescriptor} implementation that hides certain edges.
 */
import {
  BaseClass,
  IBoundsProvider,
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IEdge,
  IHitTestable,
  IVisibilityTestable,
  IVisualCreator
} from 'yfiles'

export class HidingEdgeDescriptor
  extends BaseClass<ICanvasObjectDescriptor>(ICanvasObjectDescriptor)
  implements ICanvasObjectDescriptor {
  // the original descriptor that is wrapped
  private originalDescriptor: ICanvasObjectDescriptor

  /**
   * Creates a new instance that wraps the <code>originalDescriptor</code>.
   */
  constructor(originalDescriptor: ICanvasObjectDescriptor) {
    super()
    this.originalDescriptor = originalDescriptor
    this.hiddenEdges = new Set<IEdge>()
  }

  /**
   * The edges to hide.
   */
  public hiddenEdges: Set<IEdge>

  public getVisualCreator(forUserObject: object): IVisualCreator {
    return this.originalDescriptor.getVisualCreator(forUserObject)
  }

  public isDirty(context: ICanvasContext, canvasObject: ICanvasObject): boolean {
    return this.originalDescriptor.isDirty(context, canvasObject)
  }

  public getBoundsProvider(forUserObject: object): IBoundsProvider {
    return this.originalDescriptor.getBoundsProvider(forUserObject)
  }

  /**
   * Returns {@link IVisibilityTestable#NEVER} if <code>forUserObject</code> is a hidden edge or
   * the original implementation otherwise.
   */
  public getVisibilityTestable(forUserObject: object): IVisibilityTestable {
    return this.hiddenEdges.has(forUserObject as IEdge)
      ? IVisibilityTestable.NEVER
      : this.originalDescriptor.getVisibilityTestable(forUserObject)
  }

  public getHitTestable(forUserObject: object): IHitTestable {
    return this.originalDescriptor.getHitTestable(forUserObject)
  }
}
