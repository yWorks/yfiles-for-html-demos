/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ILookup,
  INode,
  type IPort,
  IPortLocationModel,
  IPortLocationModelParameter,
  type IPortOwner,
  Point
} from '@yfiles/yfiles'

/**
 * Custom implementation of {@link IPortLocationModel} that provides
 * port locations on the shape boundary.
 */
export class ShapeBoundaryPortLocationModel extends BaseClass(IPortLocationModel) {
  /**
   * Determines the actual absolute world location of the given port for the given parameter.
   * @param port The port to determine the location for
   * @param locationParameter The parameter to use
   */
  getLocation(port: IPort, locationParameter: IPortLocationModelParameter): Point {
    if (
      locationParameter instanceof ShapeBoundaryPortLocationModelParameter &&
      port.owner instanceof INode
    ) {
      const { width, height, topLeft } = port.owner.layout
      return new Point(
        locationParameter.location.x * width,
        locationParameter.location.y * height
      ).add(topLeft)
    } else {
      // no owner node (e.g., an edge port), or parameter mismatch - return (0,0)
      return Point.ORIGIN
    }
  }

  /**
   * Factory method that creates a parameter for the given port that tries to match the provided
   * location in absolute world coordinates.
   *
   * While you are free to return arbitrary implementations of {@link IPortLocationModelParameter}, you
   * usually want to use a specialized implementation that corresponds to your model. Here we return
   * {@link ShapeBoundaryPortLocationModelParameter} instances.
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
      // We calculate the intersection of the ray starting from the center of the node and
      // going through the given location with the style's outline geometry.
      const { center, topLeft, width, height } = owner.layout
      const style = owner.style
      const outline = style.renderer.getShapeGeometry(owner, style).getOutline()

      if (outline) {
        const ray = location.subtract(center)
        // Move intersection slightly into the outline shape to ensure edge cropping always works
        const intersection = outline.findRayIntersection(center, ray) * 0.9999
        if (intersection !== Number.POSITIVE_INFINITY) {
          const intersectionLocation = new Point(
            center.x + ray.x * intersection,
            center.y + ray.y * intersection
          )
          const relativeToNode = intersectionLocation.subtract(topLeft)
          return this.createCustomParameter(
            new Point(relativeToNode.x / width, relativeToNode.y / height)
          )
        }
      }
      return this.createCustomParameter(center)
    }
    // Just return a fallback - getLocation will ignore this anyway if the owner is null or not a node.
    return this.createCustomParameter(Point.ORIGIN)
  }

  /**
   * Factory method that creates a custom port location parameter.
   * @param location The location of the port
   */
  createCustomParameter(location: Point): ShapeBoundaryPortLocationModelParameter {
    return new ShapeBoundaryPortLocationModelParameter(this, location)
  }

  /**
   * Provides a lookup context for the given combination of port and parameter.
   * @param _port The port to use in the context
   */
  getContext(_port: IPort): ILookup {
    return ILookup.EMPTY
  }
}

/**
 * Custom implementation of {@link IPortLocationModelParameter} that is
 * tailored to match {@link ShapeBoundaryPortLocationModel} instances.
 *
 * This implementation just stores one of the symbolic {@link PortLocation} instances.
 */
export class ShapeBoundaryPortLocationModelParameter extends BaseClass(
  IPortLocationModelParameter
) {
  readonly location: Point
  private readonly owner: ShapeBoundaryPortLocationModel

  /**
   * Creates an instance of ShapeBoundaryPortLocationModelParameter.
   */
  constructor(owner: ShapeBoundaryPortLocationModel, location: Point) {
    super()
    this.owner = owner
    this.location = location
  }

  /**
   * Returns a model instance to which this parameter belongs.
   *
   * This is usually a reference to the model instance that has created this parameter.
   */
  get model(): ShapeBoundaryPortLocationModel {
    return this.owner
  }

  /**
   * Creates a clone of this {@link ShapeBoundaryPortLocationModelParameter} object.
   */
  clone(): this {
    // we have no mutable state, so return this.
    return this
  }
}
