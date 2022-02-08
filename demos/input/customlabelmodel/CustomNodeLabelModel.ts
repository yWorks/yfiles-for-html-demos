/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  Class,
  DefaultLabelModelParameterFinder,
  HandleDeserializationEventArgs,
  HandleSerializationEventArgs,
  IEnumerable,
  ILabel,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILookup,
  INode,
  IOrientedRectangle,
  List,
  OrientedRectangle,
  Point
} from 'yfiles'

/**
 * Custom implementation of @{link ILabelModel} that provides either continuous or discrete label
 * positions directly outside the node border.
 *
 * In addition to the label model itself, two important support interfaces
 * {@link ILabelModelParameterFinder} and {@link ILabelModelParameterProvider} are also
 * implemented.
 */
export default class CustomNodeLabelModel
  extends BaseClass(ILabelModel, ILabelModelParameterProvider, ILabelModelParameterFinder)
  implements ILabelModel, ILabelModelParameterProvider, ILabelModelParameterFinder
{
  /**
   * The number of discrete label positions around the border.
   *
   * A value of 0 signifies that continuous label positions are used.
   */
  candidateCount = 8

  /**
   * The offset of the label location, i.e., the distance to the node layout borders.
   */
  offset = 0

  /**
   * Returns instances of the support interfaces (which are actually the model instance itself)
   */
  lookup(type: Class): Object | null {
    if (type === ILabelModelParameterProvider.$class && this.candidateCount > 0) {
      // If we request a ILabelModelParameterProvider AND we use discrete label candidates, we return the label model
      // itself, otherwise, null is returned, which means that continuous label positions are supported.
      return this
    } else if (type === ILabelModelParameterFinder.$class) {
      // If we request a ILabelModelParameterProvider, we return the label model itself, so we can always retrieve a
      // matching parameter for a given actual position.
      return this
    }
    return null
  }

  /**
   * Calculates for the given parameter the actual geometry of the specified label in absolute world coordinates.
   *
   * The actual position is calculated from the {@link CustomNodeLabelModelParameter.ratio} specified in the
   * parameter as the counterclockwise angle on the label owner's circumference. Note that we also rotate the label
   * layout itself accordingly.
   */
  getGeometry(label: ILabel, layoutParameter: ILabelModelParameter): IOrientedRectangle {
    const ownerNode = label.owner
    if (ownerNode instanceof INode && layoutParameter instanceof CustomNodeLabelModelParameter) {
      // If we have a matching parameter and a node as owner, calculate the angle for the label position
      // and the matching rotation of the label layout box itself.
      const center = ownerNode.layout.center
      const radius = Math.max(ownerNode.layout.width, ownerNode.layout.height) * 0.5
      const ratio = layoutParameter.ratio
      const angle = ratio * Math.PI * 2
      const x = Math.sin(angle)
      const y = Math.cos(angle)
      const up = new Point(-y, x)
      const result = new OrientedRectangle()
      result.setUpVector(up.x, up.y)
      result.resize(label.preferredSize)
      result.setCenter(
        center.add(up.multiply(this.offset + radius + label.preferredSize.height * 0.5))
      )
      return result
    }
    return IOrientedRectangle.EMPTY
  }

  /**
   * Creates the default parameter for this model. Here it is located at 1/4 around the node's circumference.
   */
  createDefaultParameter(): ILabelModelParameter {
    return this.createParameter(0.25)
  }

  /**
   * Factory method that creates a parameter for a given rotation angle.
   */
  createParameter(ratio: number): CustomNodeLabelModelParameter {
    return new CustomNodeLabelModelParameter(this, ratio)
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   */
  getContext(label: ILabel, parameter: ILabelModelParameter): ILookup {
    return ILookup.EMPTY
  }

  /**
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   *
   * Since in {@link lookup}, we return an instance of this class only for positive {@link candidateCount}s,
   * this method is only called for <b>discrete</b> candidates.
   */
  getParameters(label: ILabel, model: ILabelModel): IEnumerable<ILabelModelParameter> {
    const parameters = new List<ILabelModelParameter>()
    for (let i = 0; i < this.candidateCount; ++i) {
      parameters.add(new CustomNodeLabelModelParameter(this, i / this.candidateCount))
    }
    return parameters
  }

  /**
   * Tries to find a parameter that best matches the given layout for the provided label instance.
   *
   * By default, this method is only called when <b>no discrete</b> candidates are specified (i.e. here for
   * {@link candidateCount} = 0. This implementation just calculates the rotation angle for the center of layout and
   * creates a parameter for exactly this angle which {@link createParameter}.
   */
  findBestParameter(
    label: ILabel,
    model: ILabelModel,
    layout: IOrientedRectangle
  ): ILabelModelParameter {
    const labelModel = model as CustomNodeLabelModel
    const node = label.owner as INode
    if (labelModel !== null && node !== null) {
      const direction = layout.orientedRectangleCenter.subtract(node.layout.center).normalized
      const ratio = Math.atan2(direction.y, -direction.x) / (Math.PI * 2)
      return labelModel.createParameter(ratio)
    }
    return DefaultLabelModelParameterFinder.INSTANCE.findBestParameter(label, labelModel, layout)
  }
}

/**
 * Custom implementation of {@link ILabelModelParameter} that is tailored to match
 * {@link CustomNodeLabelModel} instances.
 */
export class CustomNodeLabelModelParameter extends BaseClass(ILabelModelParameter) {
  /**
   * Creates a new instance of <code>CustomNodeLabelModelParameter</code>.
   * @param _model The model for this parameter
   * @param ratio The ratio for the given label model parameter
   */
  constructor(readonly _model: CustomNodeLabelModel, readonly ratio: number) {
    super()
  }

  /**
   * Creates a clone of this {@link CustomNodeLabelModelParameter} object.
   */
  public clone(): this {
    // we have no mutable state, so return this.
    return this
  }

  /**
   * Returns the model instance to which this parameter belongs.
   *
   * This is usually a reference to the model instance that has created this parameter.
   */
  get model(): CustomNodeLabelModel {
    return this._model
  }

  /**
   * Predicate that checks if this parameter instance may be used with the given label.
   *
   * Our model/parameter implementation only makes sense when used for {@link INode}s.
   */
  public supports(label: ILabel): boolean {
    return label.owner instanceof INode
  }

  /**
   * Serialization handler for graphML I/O.
   */
  static serializationHandler = (source: any, args: HandleSerializationEventArgs): void => {
    // only serialize items that are of the specific type
    if (args.item instanceof CustomNodeLabelModelParameter) {
      const modelParameter = args.item
      const writer = args.writer
      writer.writeStartElement(
        'CustomNodeLabelModelParameter',
        'http://www.yworks.com/yFilesHTML/demos/CustomNodeLabelModelParameter/1.0'
      )
      writer.writeAttribute('candidateCount', modelParameter.model.candidateCount.toString())
      writer.writeAttribute('offset', modelParameter.model.offset.toString())
      writer.writeAttribute('ratio', modelParameter.ratio.toString())
      writer.writeEndElement()
      // Signal that this item is serialized.
      args.handled = true
    }
  }

  /**
   * Deserialization handler for graphML I/O.
   */
  static deserializationHandler = (source: any, args: HandleDeserializationEventArgs): void => {
    if (args.xmlNode instanceof Element) {
      const element = args.xmlNode
      if (
        element.localName === 'CustomNodeLabelModelParameter' &&
        element.namespaceURI ===
          'http://www.yworks.com/yFilesHTML/demos/CustomNodeLabelModelParameter/1.0'
      ) {
        // setting the result sets the event arguments to handled
        const model = new CustomNodeLabelModel()
        model.candidateCount = parseInt(element.getAttribute('candidateCount')!)
        model.offset = parseFloat(element.getAttribute('offset')!)
        args.result = new CustomNodeLabelModelParameter(
          model,
          parseFloat(element.getAttribute('ratio')!)
        )
      }
    }
  }
}
