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
  DashStyle,
  Fill,
  GeneralPath,
  GeneralPathNodeStyle,
  type INode,
  type IRenderContext,
  NodeStyleBase,
  Point,
  Rect,
  Stroke,
  type Visual
} from '@yfiles/yfiles'
import { NodeTypeEnum } from '../data-types'

/**
 * A node style implementation that creates shapes based on the type of a given node by delegating to GeneralPathNodeStyle.
 */
export class CustomShapeNodeStyle extends NodeStyleBase {
  private readonly gpNodeStyle: GeneralPathNodeStyle

  /**
   * Creates the custom style for the given type of node.
   */
  constructor(
    public type?: NodeTypeEnum,
    public stroke?: Stroke,
    public fill?: Fill
  ) {
    super()
    this.type = type ?? NodeTypeEnum.CORPORATION
    this.stroke = Stroke.from(stroke ?? 'black')
    this.fill = Fill.from(fill ?? 'white')

    let gp: GeneralPath
    this.gpNodeStyle = new GeneralPathNodeStyle()
    this.gpNodeStyle.stroke = this.stroke
    this.gpNodeStyle.fill = this.fill

    switch (type) {
      case NodeTypeEnum.CORPORATION:
        gp = createCorporationPath()
        break
      case NodeTypeEnum.CTB:
        gp = createCtbPath()
        break
      case NodeTypeEnum.PARTNERSHIP:
        gp = createPartnershipPath()
        break
      case NodeTypeEnum.RCTB:
        gp = createRctbPath()
        break
      case NodeTypeEnum.BRANCH:
      case NodeTypeEnum.INDIVIDUAL:
        gp = createBranchPath()
        break
      case NodeTypeEnum.DISREGARDED:
        gp = createDisregardedPath()
        break
      case NodeTypeEnum.DUAL_RESIDENT:
        gp = createDualResidentPath()
        break
      case NodeTypeEnum.MULTIPLE:
        gp = createMultiplePath()
        break
      case NodeTypeEnum.TRUST:
        gp = createTrustPath()
        break
      case NodeTypeEnum.THIRD_PARTY:
        gp = createThirdPartyPath()
        break
      case NodeTypeEnum.TRAPEZOID:
        gp = createTrapezoidPath()
        break
      case NodeTypeEnum.PE_RISK:
        this.gpNodeStyle.stroke = new Stroke({
          fill: this.stroke.fill ?? 'black',
          dashStyle: DashStyle.DASH,
          lineCap: 'square',
          thickness: 2
        })
        this.gpNodeStyle.stroke.freeze()
        gp = createPeRiskPath()
        break
      default:
        throw new Error('Unknown Type')
    }

    this.gpNodeStyle.path = gp
  }

  /**
   * Creates the visual for the given node.
   * @param renderContext The render context
   * @param node The node to which this style is assigned
   * @see Overrides {@link NodeStyleBase.createVisual}
   */
  createVisual(renderContext: IRenderContext, node: INode): Visual | null {
    return this.gpNodeStyle.renderer
      .getVisualCreator(node, this.gpNodeStyle)
      .createVisual(renderContext)
  }

  /**
   * Updates the visual for the given node.
   * @param renderContext The render context
   * @param oldVisual The visual that has been created in the call to createVisual
   * @param node The node to which this style is assigned
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, node: INode): Visual | null {
    return this.gpNodeStyle.renderer
      .getVisualCreator(node, this.gpNodeStyle)
      .updateVisual(renderContext, oldVisual)
  }

  /**
   * Gets the outline of the visual style.
   * @param node The node to which this style is assigned
   */
  getOutline(node: INode): GeneralPath | null {
    switch (this.type) {
      case NodeTypeEnum.PARTNERSHIP:
      case NodeTypeEnum.BRANCH:
      case NodeTypeEnum.MULTIPLE:
      case NodeTypeEnum.TRUST:
      case NodeTypeEnum.INDIVIDUAL:
      case NodeTypeEnum.THIRD_PARTY:
      case NodeTypeEnum.PE_RISK:
        return this.gpNodeStyle.renderer.getShapeGeometry(node, this.gpNodeStyle).getOutline()
      default:
        return null
    }
  }
}

/**
 * Creates the path for nodes of type "partnership".
 * @returns The general path that describes this style
 */
function createPartnershipPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 1)
  gp.lineTo(0.5, 0)
  gp.lineTo(1, 1)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "RCTB".
 * @returns The general path that describes this style
 */
function createRctbPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(1, 0)
  gp.lineTo(0.5, 1)
  gp.lineTo(0, 0)
  return gp
}

/**
 * Creates the path for nodes of type "Trapezoid".
 * @returns The general path that describes this style
 */
function createTrapezoidPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(0.2, 0)
  gp.lineTo(0.8, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.lineTo(0.2, 0)
  return gp
}

/**
 * Creates the path for nodes of type "Branch".
 * @returns The general path that describes this style
 */
function createBranchPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.appendEllipse(new Rect(0, 0, 1, 1), false)
  return gp
}

/**
 * Creates the path for nodes of type "Disregarded".
 * @returns The general path that describes this style
 */
function createDisregardedPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.appendEllipse(new Rect(0, 0, 1, 1), false)
  return gp
}

/**
 * Creates the path for nodes of type "Dual_Resident".
 * @returns The general path that describes this style
 */
function createDualResidentPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(0, 1)
  gp.lineTo(1, 0)
  return gp
}

/**
 * Creates the path for nodes of type "Multiple_Path".
 * @returns The general path that describes this style
 */
function createMultiplePath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(0.9, 0)
  gp.lineTo(0.9, 0.9)
  gp.lineTo(0, 0.9)
  gp.close()
  gp.moveTo(0.9, 0.1)
  gp.lineTo(1, 0.1)
  gp.lineTo(1, 1)
  gp.lineTo(0.1, 1)
  gp.lineTo(0.1, 0.9)
  gp.lineTo(0.9, 0.9)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "Trust".
 * @returns The general path that describes this style
 */
function createTrustPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0.5)
  gp.lineTo(0.5, 0)
  gp.lineTo(1, 0.5)
  gp.lineTo(0.5, 1)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "PE_Risk".
 * @returns The general path that describes this style
 */
function createPeRiskPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.appendEllipse(new Rect(0, 0, 1, 1), false)
  return gp
}

/**
 * Creates the path for nodes of type "Third_Party".
 * @returns The general path that describes this style
 */
function createThirdPartyPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0.25273825759228363, 0.2106077406985223)
  gp.cubicTo(
    new Point(0.37940464379944383, 0.008533694660719517),
    new Point(0.5427384738867617, -0.07436838307589484),
    new Point(0.7327381431952041, 0.20542116176184805)
  )
  gp.cubicTo(
    new Point(0.9727395859583705, 0.2054237109534111),
    new Point(1.026070204427681, 0.5059367593821318),
    new Point(0.9360671322061148, 0.6302855466359552)
  )
  gp.cubicTo(
    new Point(0.9727385659844104, 1.0499824248785579),
    new Point(0.7327384631870348, 0.9929823150021839),
    new Point(0.5727383979886994, 0.9308125068113157)
  )
  gp.cubicTo(
    new Point(0.37607164889080386, 1.044795193100142),
    new Point(0.23606605323366095, 0.9878057307616991),
    new Point(0.17274109991971903, 0.8064517974237797)
  )
  gp.cubicTo(
    new Point(-0.1039264767570484, 0.68210650753643),
    new Point(0.012736869827713297, 0.2572344906314848),
    new Point(0.25273825759228363, 0.2106077406985223)
  )
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "Corporation".
 * @returns The general path that describes this style
 */
function createCorporationPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "CTB".
 * @returns The general path that describes this style
 */
function createCtbPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(0, 1)
  gp.lineTo(0.5, 0)
  gp.lineTo(1, 1)
  return gp
}
