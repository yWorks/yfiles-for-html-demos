/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  Class,
  GraphMLIOHandler,
  IconLabelStyle,
  ILabelModelParameter,
  ILookup,
  INodeStyle,
  Insets,
  MarkupExtension
} from 'yfiles'
import MindmapEdgeStyle from './MindmapEdgeStyle'
import MindmapNodeStyle from './MindmapNodeStyle'
import CollapseDecorator from './CollapseDecorator'
import StateLabelDecorator from './StateLabelDecorator'
import MindmapNodeStyleRoot from './MindmapNodeStyleRoot'

// Contains markup extensions and helper functions to enable GraphML support for the Mindmap demo.

/**
 * Initializes the GraphMLIOHandler.
 */
export default function createGraphMLIOHandler(): GraphMLIOHandler {
  const ioh = new GraphMLIOHandler()
  // We have to implement a special serialization handle listener in order to be able to serialize
  // the custom style classes that have inner properties and are written in ECMAScript 6.
  ioh.addHandleSerializationListener((sender, args) => {
    const item = args.item
    if (item instanceof CollapseDecorator) {
      const collapseDecoratorExtension = new CollapseDecoratorExtension()
      collapseDecoratorExtension.wrappedStyle = item.wrappedStyle
      const context = args.context
      context.serializeReplacement(
        CollapseDecoratorExtension.$class,
        item,
        collapseDecoratorExtension
      )
      args.handled = true
    } else if (item instanceof StateLabelDecorator) {
      const stateLabelDecoratorExtension = new StateLabelDecoratorExtension()
      stateLabelDecoratorExtension.wrappedStyle = item.wrappedStyle.wrapped as IconLabelStyle
      stateLabelDecoratorExtension.labelModelParameterLeft = item.labelModelParameterLeft
      stateLabelDecoratorExtension.labelModelParameterRight = item.labelModelParameterRight
      stateLabelDecoratorExtension.insetsLeft = item.insetsLeft
      stateLabelDecoratorExtension.insetsRight = item.insetsRight
      const context = args.context
      context.serializeReplacement(
        StateLabelDecoratorExtension.$class,
        item,
        stateLabelDecoratorExtension
      )
      args.handled = true
    } else if (item instanceof MindmapNodeStyleRoot) {
      const mindmapNodeStyleRootExtension = new MindmapNodeStyleRootExtension()
      mindmapNodeStyleRootExtension.className = item.className
      const context = args.context
      context.serializeReplacement(
        MindmapNodeStyleRootExtension.$class,
        item,
        mindmapNodeStyleRootExtension
      )
      args.handled = true
    } else if (item instanceof MindmapNodeStyle) {
      const mindmapNodeStyleExtension = new MindmapNodeStyleExtension()
      mindmapNodeStyleExtension.className = item.className
      const context = args.context
      context.serializeReplacement(
        MindmapNodeStyleExtension.$class,
        item,
        mindmapNodeStyleExtension
      )
      args.handled = true
    } else if (item instanceof MindmapEdgeStyle) {
      const mindmapEdgeStyleExtension = new MindmapEdgeStyleExtension()
      mindmapEdgeStyleExtension.thicknessStart = item.thicknessStart
      mindmapEdgeStyleExtension.thicknessEnd = item.thicknessEnd
      const context = args.context
      context.serializeReplacement(
        MindmapEdgeStyleExtension.$class,
        item,
        mindmapEdgeStyleExtension
      )
      args.handled = true
    }
  })

  // initialize $class on the markup extensions
  Class.fixType(StateLabelDecoratorExtension)
  Class.fixType(CollapseDecoratorExtension)
  Class.fixType(MindmapNodeStyleExtension)
  Class.fixType(MindmapNodeStyleRootExtension)
  Class.fixType(MindmapEdgeStyleExtension)

  // enable serialization of the mind map styles - without a namespace mapping, serialization will fail
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/StateLabelDecorator/1.0',
    'StateLabelDecorator',
    StateLabelDecoratorExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/CollapseDecorator/1.0',
    'CollapseDecorator',
    CollapseDecoratorExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/MindmapNodeStyle/1.0',
    'MindmapNodeStyle',
    MindmapNodeStyleExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/MindmapNodeStyleRoot/1.0',
    'MindmapNodeStyleRoot',
    MindmapNodeStyleRootExtension.$class
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/MindmapEdgeStyle/1.0',
    'MindmapEdgeStyle',
    MindmapEdgeStyleExtension.$class
  )
  return ioh
}

/**
 * A markup extension class used for (de-)serializing a custom edge style, namely
 * MindmapEdgeStyle class, that is written in ECMAScript 6.
 */
class MindmapEdgeStyleExtension extends MarkupExtension {
  private _thicknessStart = 1
  private _thicknessEnd = 1

  /**
   * Gets the start thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  get thicknessStart(): number {
    return this._thicknessStart
  }

  /**
   * Sets the start thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  set thicknessStart(value: number) {
    this._thicknessStart = value
  }

  /**
   * Gets the end thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  get thicknessEnd(): number {
    return this._thicknessEnd
  }

  /**
   * Sets the end thickness of an edge.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  set thicknessEnd(value: number) {
    this._thicknessEnd = value
  }

  provideValue(lookup: ILookup) {
    return new MindmapEdgeStyle(this.thicknessStart, this.thicknessEnd)
  }
}

/**
 * A markup extension class used for (de-)serializing a custom node style, namely
 * MindmapNodeStyle class, that is written in ECMAScript 6.
 */
class MindmapNodeStyleExtension extends MarkupExtension {
  private _className = ''

  /**
   * Gets the class name.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  get className(): string {
    return this._className
  }

  /**
   * Sets the class name.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  set className(value: string) {
    this._className = value
  }

  provideValue(lookup: ILookup) {
    return new MindmapNodeStyle(this.className)
  }
}

/**
 * A markup extension class used for (de-)serializing a custom node style, namely
 * MindmapNodeStyleRoot class, that is written in ECMAScript 6.
 */
class MindmapNodeStyleRootExtension extends MarkupExtension {
  private _className = ''

  /**
   * Gets the class name.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  get className(): string {
    return this._className
  }

  /**
   * Sets the class name.
   * The explicit getter/setter is needed to support (de-)serialization.
   */
  set className(value: string) {
    this._className = value
  }

  provideValue(lookup: ILookup) {
    return new MindmapNodeStyleRoot(this.className)
  }
}

/**
 * A markup extension class used for (de-)serializing a custom label style, namely
 * StateLabelDecorator class, that is written in ECMAScript 6.
 */
class StateLabelDecoratorExtension extends MarkupExtension {
  private _wrappedStyle: IconLabelStyle = null!
  private _labelModelParameterLeft: ILabelModelParameter = null!
  private _labelModelParameterRight: ILabelModelParameter = null!
  private _insetsLeft: Insets = null!
  private _insetsRight: Insets = null!

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
   */
  set wrappedStyle(value: IconLabelStyle) {
    this._wrappedStyle = value
  }

  /**
   * Gets ILabelModelParameter for an icon of a node placed on the left side of the tree.
   * Places the icon inside the label on the east.
   */
  get labelModelParameterLeft(): ILabelModelParameter {
    return this._labelModelParameterLeft
  }

  /**
   * Sets ILabelModelParameter for an icon of a node placed on the left side of the tree.
   * Places the icon inside the label on the east.
   */
  set labelModelParameterLeft(value: ILabelModelParameter) {
    this._labelModelParameterLeft = value
  }

  /**
   * Gets the ILabelModelParameter for an icon of a node placed on the right side of the tree.
   * Places the icon inside the label on the east.
   */
  get labelModelParameterRight(): ILabelModelParameter {
    return this._labelModelParameterRight
  }

  /**
   * Sets the ILabelModelParameter for an icon of a node placed on the right side of the tree.
   * Places the icon inside the label on the east.
   */
  set labelModelParameterRight(value: ILabelModelParameter) {
    this._labelModelParameterRight = value
  }

  /**
   * Gets the insets for an icon placed on the left side of the tree.
   */
  get insetsLeft(): Insets {
    return this._insetsLeft
  }

  /**
   * Sets the insets for an icon placed on the left side of the tree.
   */
  set insetsLeft(value: Insets) {
    this._insetsLeft = value
  }

  /**
   * Gets the insets for an icon placed on the right side of the tree.
   */
  get insetsRight(): Insets {
    return this._insetsRight
  }

  /**
   * Sets the insets for an icon placed on the right side of the tree.
   */
  set insetsRight(value: Insets) {
    this._insetsRight = value
  }

  provideValue(lookup: ILookup) {
    return new StateLabelDecorator(this.wrappedStyle)
  }
}

/**
 * A markup extension class used for (de-)serializing a custom node style, namely
 * CollapseDecorator class, that is written in ECMAScript 6.
 */
class CollapseDecoratorExtension extends MarkupExtension {
  private _wrappedStyle: INodeStyle = null!

  /**
   * Gets the inner style used to render the collapse/expand icon.
   */
  get wrappedStyle(): INodeStyle {
    return this._wrappedStyle
  }

  /**
   * Sets the inner style used to render the collapse/expand icon.
   */
  set wrappedStyle(value: INodeStyle) {
    this._wrappedStyle = value
  }

  provideValue(lookup: ILookup) {
    return new CollapseDecorator(this.wrappedStyle)
  }
}
