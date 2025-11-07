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
  BezierEdgeStyle,
  CreateEdgeInputMode,
  type IBend,
  IBendCreator,
  type IEdge,
  type IGraph,
  IHitTestable,
  type IInputModeContext,
  type InputModeEventArgs,
  type IPortCandidate,
  type IRenderTreeElement,
  type ItemEventArgs,
  OrthogonalEdgeEditingPolicy,
  type Point,
  SimpleEdge
} from '@yfiles/yfiles'

/**
 * Custom create edge input mode for bezier edges.
 * This mode can operate in two different ways:
 * If {@link BezierCreateEdgeInputMode.createSmoothSplines} is `true`, you create only
 * the exterior control points and the mode interpolates the missing middle control point for each
 * triple.
 * Otherwise, you specify each control point exactly as intended.
 * During the gesture, the current hull curve is shown.
 */
export class BezierCreateEdgeInputMode extends CreateEdgeInputMode {
  /**
   * Re-entrance flag when we are inserting/removing dummy edge bends.
   */
  private augmenting: boolean

  /**
   * Additional render tree element that highlights the control point sequence.
   */
  private controlPointHighlight: IRenderTreeElement | null

  /**
   * Whether we want to create smooth splines.
   */
  private $createSmoothSplines: boolean

  /**
   * Determines whether we want to create smooth splines.
   * If true, each "bend" creation inserts one of the "exterior" control points for a cubic segment, and the point in the middle
   * is created automatically by the mode. Otherwise, each control point must be explicitly created.
   * Default value is true.
   */
  public get createSmoothSplines(): boolean {
    return this.$createSmoothSplines
  }

  /**
   * Specifies whether we want to create smooth splines.
   * If true, each "bend" creation inserts one of the "exterior" control points for a cubic segment, and the point in the middle
   * is created automatically by the mode. Otherwise, each control point must be explicitly created.
   * Default value is true.
   */
  public set createSmoothSplines(value: boolean) {
    this.$createSmoothSplines = value
  }

  constructor() {
    super()
    this.$createSmoothSplines = true
    // By default, we can't create orthogonal edges with this mode
    // (what would that look like)
    this.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.NEVER

    this.augmenting = false
    this.controlPointHighlight = null

    this.cancelGestureOnInvalidEnd = false

    this.validBendHitTestable = IHitTestable.create(
      (context: IInputModeContext, location: Point) => {
        if (
          !this.previewEdge ||
          !this.previewEdge.bends.at(-1) ||
          !(this.previewEdge.style instanceof BezierEdgeStyle) ||
          !this.createSmoothSplines
        ) {
          return true
        }
        const lastBend = this.previewEdge.bends.at(-2)
        if (!lastBend) {
          return true
        }
        // Require a minimum length for the control point triple
        return (
          lastBend.index % 3 !== 0 ||
          location.subtract(lastBend.location.toPoint()).vectorLength > 10
        )
      }
    )

    this.configureDummyGraph()
    this.addEventListener('edge-creation-started', this.configureDummyEdge.bind(this))
  }

  /**
   * If we have a bezier edge style, we decorate it so that we can also show the control points.
   * A better solution that would however be more involved would be to show the decoration.
   */
  private configureDummyEdge(): void {
    const simpleEdge = this.previewEdge
    if (simpleEdge instanceof SimpleEdge && simpleEdge.style instanceof BezierEdgeStyle) {
      // By default, the BezierEdgeStyle has no bend creator
      // However, we want to be able to create bends here
      // So we sneakily insert a BendCreator into the dummy edge lookup
      const defaultBendCreator = new SimpleEdge().lookup(IBendCreator)
      simpleEdge.getDecorator().bendCreator.addConstant(defaultBendCreator)
    }
  }

  public onGestureCanceling(inputModeEventArgs: InputModeEventArgs): void {
    if (this.controlPointHighlight) {
      this.parentInputModeContext?.canvasComponent?.renderTree.remove(this.controlPointHighlight)
      this.controlPointHighlight = null
    }
    super.onGestureCanceling(inputModeEventArgs)
  }

  public onGestureFinishing(inputModeEventArgs: InputModeEventArgs): void {
    if (this.controlPointHighlight) {
      this.parentInputModeContext?.canvasComponent?.renderTree.remove(this.controlPointHighlight)
      this.controlPointHighlight = null
    }
    super.onGestureFinishing(inputModeEventArgs)
  }

  public uninstall(context: IInputModeContext): void {
    if (this.controlPointHighlight) {
      this.parentInputModeContext?.canvasComponent?.renderTree.remove(this.controlPointHighlight)
      this.controlPointHighlight = null
    }
    super.uninstall(context)
  }

  public configureDummyGraph(): void {
    const dummyGraph = this.previewGraph
    // Register to bend creation and removal events
    // in order to insert additional bends in the middle of a line segment
    // or remove them if the defining bend is removed
    dummyGraph.addEventListener('bend-added', this.onBendAdded.bind(this))
    dummyGraph.addEventListener('bend-removed', this.onBendRemoved.bind(this))
  }

  private onBendRemoved(): void {
    if (!this.augmenting) {
      if (this.createSmoothSplines && this.previewEdge.style instanceof BezierEdgeStyle) {
        this.augmenting = true
        try {
          if (this.previewEdge.bends.size > 0 && this.previewEdge.bends.size % 3 === 0) {
            // Undo bend creation that finished a triple
            this.previewGraph.remove(this.previewEdge.bends.last()!)
          }
        } finally {
          this.augmenting = false
        }
      }
    }
  }

  private onBendAdded(evt: ItemEventArgs<IBend>): void {
    if (!this.augmenting) {
      if (this.createSmoothSplines && this.previewEdge.style instanceof BezierEdgeStyle) {
        this.augmenting = true
        try {
          if (this.previewEdge.bends.size % 3 === 0) {
            // Bend creation that finishes a control point line
            // Insert a middle bend
            const cp0 = this.previewEdge.bends
              .get(this.previewEdge.bends.size - 2)
              .location.toPoint()
            const cp2 = evt.item.location.toPoint()
            const cp1 = cp2.subtract(cp0).multiply(0.5).add(cp0)
            this.previewGraph.addBend(this.previewEdge, cp1, this.previewEdge.bends.size - 1)
          }
        } finally {
          this.augmenting = false
        }
      }
    }
  }

  /**
   * Overridden to pad the number of bends so that there are always 2 mod 3 by duplicating the last location, if necessary.
   */
  public createEdge(
    graph: IGraph,
    sourcePortCandidate: IPortCandidate,
    targetPortCandidate: IPortCandidate
  ): IEdge | Promise<IEdge | null> | null {
    if (this.createSmoothSplines && this.previewEdge.style instanceof BezierEdgeStyle) {
      if (this.previewEdge.bends.size > 0) {
        this.augmenting = true
        try {
          const lastLocation = this.previewEdge.bends.last()!.location.toPoint()
          if (this.previewEdge.bends.size % 3 === 1) {
            // We can reach this branch if we finish the edge creation
            // without having finished a control point triple
            // Just duplicate the last bend
            this.previewGraph.addBend(this.previewEdge, lastLocation)
          } else if (this.previewEdge.bends.size % 3 === 0) {
            // Actually, we shouldn't be able to come here
            // since we always create bend triples and have an initial single control point
            this.previewGraph.addBend(this.previewEdge, lastLocation)
            this.previewGraph.addBend(this.previewEdge, lastLocation)
          }
        } finally {
          this.augmenting = false
        }
      }
    }
    return super.createEdge(graph, sourcePortCandidate, targetPortCandidate)
  }
}
