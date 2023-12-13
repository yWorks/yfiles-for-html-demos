/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HandleDeserializationEventArgs,
  HandleSerializationEventArgs,
  ILookup,
  INode,
  IPort,
  IPortLocationModel,
  IPortLocationModelParameter,
  IPortOwner,
  Point
} from 'yfiles'

/**
 * Symbolic constants for the five supported port locations.
 */
export enum PortLocation {
  CENTER,
  NORTH,
  SOUTH,
  EAST,
  WEST
}

/**
 * Custom implementation of {@link IPortLocationModel} that provides
 * five discrete port locations, one at the node center and one at each side.
 */
export class CustomNodePortLocationModel
  extends BaseClass(IPortLocationModel)
  implements IPortLocationModel
{
  /**
   * Creates a new instance of {@link CustomNodePortLocationModel}.
   * @param inset The inset for port locations NORTH, WEST, SOUTH, and EAST.
   */
  constructor(public inset: number = 0) {
    super()
  }

  /**
   * Returns an instance that implements the given type or null.
   * @param type The type for which an instance shall be returned
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T>(type: Class<T>): T | null {
    return null
  }

  /**
   * Determines the actual absolute world location of the given port for the given parameter.
   * @param port The port to determine the location for
   * @param locationParameter The parameter to use
   */
  getLocation(port: IPort, locationParameter: IPortLocationModelParameter): Point {
    if (
      locationParameter instanceof CustomNodePortLocationModelParameter &&
      port.owner instanceof INode
    ) {
      // If we have an actual owner node and the parameter can be really used by this model,
      // we just calculate the correct location, based on the node's layout.
      const modelParameter = locationParameter
      const ownerNode = port.owner
      const layout = ownerNode.layout
      switch (modelParameter.location) {
        case PortLocation.CENTER:
          return layout.center
        case PortLocation.NORTH:
          return layout.topLeft.add(layout.topRight).multiply(0.5).add(new Point(0, this.inset))
        case PortLocation.SOUTH:
          return layout.bottomLeft
            .add(layout.bottomRight)
            .multiply(0.5)
            .add(new Point(0, -this.inset))
        case PortLocation.EAST:
          return layout.topRight
            .add(layout.bottomRight)
            .multiply(0.5)
            .add(new Point(-this.inset, 0))
        case PortLocation.WEST:
          return layout.topLeft.add(layout.bottomLeft).multiply(0.5).add(new Point(this.inset, 0))
        default:
          throw new Error('Unknown PortLocation')
      }
    } else {
      // no owner node (e.g. an edge port), or parameter mismatch - return (0,0)
      return Point.ORIGIN
    }
  }

  /**
   * Factory method that creates a parameter for the given port that tries to match the provided location in absolute
   * world coordinates.
   *
   * While you are free to return arbitrary implementations of {@link IPortLocationModelParameter}, you
   * usually want to use a specialized implementation that corresponds to your model. Here we return
   * {@link CustomNodePortLocationModelParameter} instances. Note that for discrete port models, you'll want to use
   * some discretization of the coordinate space. This means that retrieving the actual location with
   * {@link getLocation} for the returned parameter does not necessarily have to provide the original coordinates
   * location; still, the actual location should probably be included in the coordinate subset that is mapped to the
   * return value (otherwise behaviour will be very confusing).
   *
   * @param owner The port owner that will own the port for which the parameter shall be
   * created
   * @param location The location in the world coordinate system that should be matched as
   * best as possible
   * @returns A new instance that can be used to describe the location of
   * an {@link IPort} at the given owner
   */
  createParameter(owner: IPortOwner, location: Point): IPortLocationModelParameter {
    if (owner instanceof INode) {
      const ownerNode = owner
      // determine the distance of the specified location to the node layout center
      const delta = location.subtract(ownerNode.layout.center)
      if (delta.vectorLength < 0.25 * Math.min(ownerNode.layout.width, ownerNode.layout.height)) {
        // nearer to the center than to the border => map to center
        return this.createCustomParameter(PortLocation.CENTER)
      }
      // map to a location on the side
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        return this.createCustomParameter(delta.x > 0 ? PortLocation.EAST : PortLocation.WEST)
      }
      return this.createCustomParameter(delta.y > 0 ? PortLocation.SOUTH : PortLocation.NORTH)
    }
    // Just return a fallback  - getLocation will ignore this anyway if the owner is null or not a node.
    return this.createCustomParameter(PortLocation.CENTER)
  }

  /**
   * Factory method that creates a custom port location parameter.
   * @param location The location of the port
   */
  createCustomParameter(location: PortLocation): CustomNodePortLocationModelParameter {
    return new CustomNodePortLocationModelParameter(this, location)
  }

  /**
   * Provides a lookup context for the given combination of port and parameter.
   * @param port The port to use in the context
   * @param locationParameter The parameter to use for the port in the context
   */
  getContext(port: IPort, locationParameter: IPortLocationModelParameter): ILookup {
    return ILookup.EMPTY
  }
}

/**
 * Custom implementation of {@link IPortLocationModelParameter} that is
 * tailored to match {@link CustomNodePortLocationModel} instances.
 *
 * This implementation just stores one of the symbolic {@link PortLocation} instances.
 */
export class CustomNodePortLocationModelParameter
  extends BaseClass(IPortLocationModelParameter)
  implements IPortLocationModelParameter
{
  /**
   * Creates an instance of CustomNodePortLocationModelParameter.
   */
  constructor(
    private readonly owner: CustomNodePortLocationModel,
    public readonly location: PortLocation
  ) {
    super()
  }

  /**
   * Returns a model instance to which this parameter belongs.
   *
   * This is usually a reference to the model instance that has created this parameter.
   */
  get model(): CustomNodePortLocationModel {
    return this.owner
  }

  /**
   * Determines if this parameter instance may be used to describe ports for the given owner.
   *
   * Our model/parameter implementation only makes sense when used for {@link INode}s.
   */
  supports(owner: IPortOwner): boolean {
    return owner instanceof INode
  }

  /**
   * Creates a clone of this {@link CustomNodePortLocationModelParameter} object.
   */
  clone(): this {
    // we have no mutable state, so return this.
    return this
  }

  /**
   * Handles GraphML serialization for this parameter instance.
   * @param source The source of the event
   * @param args An object that contains the event data
   */
  static serializationHandler(source: object, args: HandleSerializationEventArgs): void {
    // only serialize items that are of the specific type
    if (args.item instanceof CustomNodePortLocationModelParameter) {
      const modelParameter = args.item
      const writer = args.writer
      writer.writeStartElement(
        'CustomNodePortLocationModelParameter',
        'http://www.yworks.com/yFilesHTML/demos/CustomNodePortLocationModelParameter/1.0'
      )
      writer.writeAttribute('inset', modelParameter.model.inset.toString())
      writer.writeAttribute('portLocation', modelParameter.location.toString())
      writer.writeEndElement()
      // Signal that this item is serialized.
      args.handled = true
    }
  }

  /**
   * Handles GraphML deserialization for this parameter instance.
   * @param source The source of the event
   * @param args An object that contains the event data
   */
  static deserializationHandler(source: object, args: HandleDeserializationEventArgs): void {
    if (args.xmlNode instanceof Element) {
      const element = args.xmlNode
      if (
        element.localName === 'CustomNodePortLocationModelParameter' &&
        element.namespaceURI ===
          'http://www.yworks.com/yFilesHTML/demos/CustomNodePortLocationModelParameter/1.0'
      ) {
        // setting the result sets the event arguments to handled
        const model = new CustomNodePortLocationModel(parseFloat(element.getAttribute('inset')!))
        args.result = new CustomNodePortLocationModelParameter(
          model,
          parseInt(element.getAttribute('portLocation')!)
        )
      }
    }
  }
}
