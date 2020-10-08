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
/* eslint-disable */
import yfiles, {
  ArcEdgeStyle,
  Arrow,
  ArrowType,
  BendAnchoredPortLocationModel,
  BevelNodeStyle,
  Class,
  ClassDefinition,
  CollapsibleNodeStyleDecorator,
  Color,
  ColorExtension,
  CompositeLabelModel,
  DashStyle,
  DefaultLabelModelParameterFinder,
  DefaultLabelStyle,
  DescriptorWrapperLabelModel,
  EdgeDefaults,
  EnumDefinition,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  Fill,
  Font,
  FreeEdgeLabelModel,
  FreeLabelModel,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  GeneralPath,
  GeneralPathNodeStyle,
  GenericLabelModel,
  GradientStop,
  GraphMLAttribute,
  GraphMLMemberVisibility,
  IArrow,
  ICollection,
  IconLabelStyle,
  IContextLookup,
  IEdge,
  IEdgeDefaults,
  IEdgeStyle,
  ILabelCandidateDescriptor,
  ILabelDefaults,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILabelStyle,
  IList,
  ILookup,
  ImageNodeStyle,
  IMarkupExtensionConverter,
  INode,
  INodeDefaults,
  INodeStyle,
  Insets,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  IPoint,
  IPort,
  IPortDefaults,
  IPortLocationModel,
  IPortLocationModelParameter,
  IPortStyle,
  IStripeDefaults,
  ITable,
  LabelCandidateDescriptor,
  LabelDefaults,
  LinearGradient,
  List,
  MarkupExtension,
  NinePositionsEdgeLabelModel,
  NodeDefaults,
  NodeStyleLabelStyleAdapter,
  NodeStylePortStyleAdapter,
  NodeStyleStripeStyleAdapter,
  OrientedRectangle,
  PanelNodeStyle,
  PathType,
  Point,
  PolylineEdgeStyle,
  PortDefaults,
  Property,
  RadialGradient,
  Rect,
  SandwichLabelModel,
  SegmentRatioPortLocationModel,
  ShadowNodeStyleDecorator,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShinyPlateNodeStyle,
  Size,
  SmartEdgeLabelModel,
  SolidColorFill,
  StretchStripeLabelModel,
  StringTemplateLabelStyle,
  StringTemplateNodeStyle,
  StringTemplatePortStyle,
  StripeDefaults,
  StripeLabelModel,
  Stroke,
  TableNodeStyle,
  TableNodeStyleRenderer,
  TemplateLabelStyle,
  TemplateNodeStyle,
  TemplatePortStyle,
  TypeAttribute,
  ValueSerializer,
  VoidEdgeStyle,
  VoidLabelStyle,
  VoidNodeStyle,
  VoidPortStyle,
  YBoolean,
  YNumber,
  YObject,
  YString
} from 'yfiles'

const compat = yfiles.module('compat')

/**
 * @yjs:keep=Node
 */
export function configureIOHandler(ioh) {
  // enable serialization of the compat modules - without a namespace mapping, serialization will fail
  ioh.addXamlNamespaceMapping('http://www.yworks.com/xml/yfiles-common/2.0', compat.graphml.common)
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-common/markup/2.0',
    compat.graphml.commonmarkup
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/1.0/wpfbridge',
    compat.graphml.wpfbridge
  )
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/1.0/xaml',
    compat.graphml.xaml
  )
  ioh.addHandleDeserializationListener(function (sender, evt) {
    if (!evt.handled && evt.xmlNode.nodeType === Node.ELEMENT_NODE) {
      var /*Element*/ elem = /*(Element)*/ evt.xmlNode
      if (elem.namespaceURI === 'http://www.yworks.com/xml/yfiles-common/2.0') {
        var /*string*/ typeName = elem.localName
        switch (typeName) {
          case 'PointD':
            evt.result = new Point(
              parseFloat(elem.getAttribute('x')),
              parseFloat(elem.getAttribute('y'))
            )
            break
          case 'SizeD':
            evt.result = new Size(
              parseFloat(elem.getAttribute('width')),
              parseFloat(elem.getAttribute('height'))
            )
            break
          case 'InsetsD':
            evt.result = new Insets(
              parseFloat(elem.getAttribute('left')),
              parseFloat(elem.getAttribute('top')),
              parseFloat(elem.getAttribute('right')),
              parseFloat(elem.getAttribute('bottom'))
            )
            break
          case 'RectD':
            evt.result = new Rect(
              parseFloat(elem.getAttribute('x')),
              parseFloat(elem.getAttribute('y')),
              parseFloat(elem.getAttribute('width')),
              parseFloat(elem.getAttribute('height'))
            )
            break
          default:
            break
        }
      }
    }
  })
  ioh.addHandleDeserializationListener(function (sender, evt) {
    if (!evt.handled && evt.xmlNode.nodeType === Node.ELEMENT_NODE) {
      var /*Element*/ element = /*(Element)*/ evt.xmlNode
      if (
        element.localName === 'Json' &&
        element.namespaceURI === 'http://www.yworks.com/xml/yfiles-common/2.0'
      ) {
        var /*string*/ content = element.textContent
        if (content !== null && content !== '') {
          evt.result = JSON.parse(content)
        }
      }
    }
  })
}

yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.NodeViewStateExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initNodeViewStateExtension()
        this.$layout = new Rect(0, 0, -1, -1)
      },

      $labels: null,

      $layout: null,

      layout: {
        $meta: function () {
          return [TypeAttribute(Rect.$class)]
        },
        get: function () {
          return this.$layout
        },
        set: function (/*Rect*/ value) {
          this.$layout = value
        }
      },

      labels: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$labels
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$style = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.FolderNodeStateExtension*/ newInstance = new yfiles.graphml.FolderNodeStateExtension()
        {
          newInstance.style = this.$style
          newInstance.layout = this.$layout
        }
        var /*yfiles.graphml.FolderNodeStateExtension*/ folderNodeStateExtension = newInstance
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$labels.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*yfiles.graph.ILabel*/ label = tmpEnumerator.current
          {
            folderNodeStateExtension.labels.add(label)
          }
        }
        return folderNodeStateExtension.provideValue(serviceProvider)
      },

      $initNodeViewStateExtension: function () {
        this.$labels = new List()
        this.$layout = new Rect(0, 0, 0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.EdgeDefaultsExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$shareStyleInstance = true
      },

      $labels: null,

      labels: {
        $meta: function () {
          return [TypeAttribute(ILabelDefaults.$class)]
        },
        get: function () {
          return this.$labels
        },
        set: function (/*yfiles.graph.ILabelDefaults*/ value) {
          this.$labels = value
        }
      },

      $ports: null,

      ports: {
        $meta: function () {
          return [TypeAttribute(IPortDefaults.$class)]
        },
        get: function () {
          return this.$ports
        },
        set: function (/*yfiles.graph.IPortDefaults*/ value) {
          this.$ports = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(IEdgeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.IEdgeStyle*/ value) {
          this.$style = value
        }
      },

      $shareStyleInstance: false,

      shareStyleInstance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareStyleInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareStyleInstance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.EdgeDefaults*/ newInstance = new EdgeDefaults()
        {
          newInstance.shareStyleInstance = this.$shareStyleInstance
          newInstance.style = this.$style
          newInstance.ports = this.$ports
          newInstance.labels = this.$labels
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.LabelDefaultsExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$shareStyleInstance = true
        this.$shareLabelModelParameterInstance = true
        this.$autoAdjustPreferredSize = true
      },

      $autoAdjustPreferredSize: false,

      autoAdjustPreferredSize: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoAdjustPreferredSize
        },
        set: function (/*boolean*/ value) {
          this.$autoAdjustPreferredSize = value
        }
      },

      $shareLabelModelParameterInstance: false,

      shareLabelModelParameterInstance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareLabelModelParameterInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareLabelModelParameterInstance = value
        }
      },

      $labelModelParameter: null,

      labelModelParameter: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$labelModelParameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$labelModelParameter = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(ILabelStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.ILabelStyle*/ value) {
          this.$style = value
        }
      },

      $shareStyleInstance: false,

      shareStyleInstance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareStyleInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareStyleInstance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.LabelDefaults*/ newInstance = new LabelDefaults()
        {
          newInstance.shareStyleInstance = this.$shareStyleInstance
          newInstance.style = this.$style
          newInstance.autoAdjustPreferredSize = this.$autoAdjustPreferredSize
          newInstance.layoutParameter = this.$labelModelParameter
          newInstance.shareModelParameterInstance = this.$shareLabelModelParameterInstance
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.TableExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initTableExtension()
        this.$relativeLocation = Point.ORIGIN
        this.$insets = new Insets(0)
      },

      $rows: null,

      $columns: null,

      rows: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(ICollection.$class)
          ]
        },
        get: function () {
          return this.$rows
        }
      },

      columns: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(ICollection.$class)
          ]
        },
        get: function () {
          return this.$columns
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      $relativeLocation: null,

      relativeLocation: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$relativeLocation
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$relativeLocation = value
        }
      },

      $rowDefaults: null,

      rowDefaults: {
        $meta: function () {
          return [TypeAttribute(IStripeDefaults.$class)]
        },
        get: function () {
          return this.$rowDefaults
        },
        set: function (/*yfiles.graph.IStripeDefaults*/ value) {
          this.$rowDefaults = value
        }
      },

      $columnDefaults: null,

      columnDefaults: {
        $meta: function () {
          return [TypeAttribute(IStripeDefaults.$class)]
        },
        get: function () {
          return this.$columnDefaults
        },
        set: function (/*yfiles.graph.IStripeDefaults*/ value) {
          this.$columnDefaults = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.TableExtension*/ newInstance = new yfiles.graphml.TableExtension()
        {
          newInstance.insets = this.$insets
          newInstance.relativeLocation = this.$relativeLocation
          newInstance.rowDefaults = this.$rowDefaults
          newInstance.columnDefaults = this.$columnDefaults
        }
        var /*yfiles.graphml.TableExtension*/ tableExtension = newInstance
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$columns.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*yfiles.graph.IColumn*/ column = tmpEnumerator.current
          {
            tableExtension.columns.add(column)
          }
        }
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator2
        for (tmpEnumerator2 = this.$rows.getEnumerator(); tmpEnumerator2.moveNext(); ) {
          var /*yfiles.graph.IRow*/ row = tmpEnumerator2.current
          {
            tableExtension.rows.add(row)
          }
        }
        return tableExtension.provideValue(serviceProvider)
      },

      $initTableExtension: function () {
        this.$rows = new List()
        this.$columns = new List()
        this.$insets = new Insets(0)
        this.$relativeLocation = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.StripeDefaultsExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initStripeDefaultsExtension()
        this.$size = 100
        this.$minimumSize = 10
        this.$shareStyleInstance = true
        this.$insets = new Insets(0)
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      $size: 0,

      size: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$size
        },
        set: function (/*number*/ value) {
          this.$size = value
        }
      },

      $minimumSize: 0,

      minimumSize: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$minimumSize
        },
        set: function (/*number*/ value) {
          this.$minimumSize = value
        }
      },

      $labels: null,

      labels: {
        $meta: function () {
          return [TypeAttribute(ILabelDefaults.$class)]
        },
        get: function () {
          return this.$labels
        },
        set: function (/*yfiles.graph.ILabelDefaults*/ value) {
          this.$labels = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$style = value
        }
      },

      $shareStyleInstance: false,

      shareStyleInstance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareStyleInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareStyleInstance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.StripeDefaults*/ newInstance = new StripeDefaults()
        {
          newInstance.shareStyleInstance = this.$shareStyleInstance
          newInstance.style = new NodeStyleStripeStyleAdapter(this.$style)
          newInstance.insets = this.$insets
          newInstance.size = this.$size
          newInstance.labels = this.$labels
          newInstance.minimumSize = this.$minimumSize
        }
        return newInstance
      },

      $initStripeDefaultsExtension: function () {
        this.$insets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.PortDefaultsExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$shareStyleInstance = true
        this.$shareLocationModelParameterInstance = true
        this.$autoCleanup = true
      },

      $autoCleanup: false,

      autoCleanup: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoCleanup
        },
        set: function (/*boolean*/ value) {
          this.$autoCleanup = value
        }
      },

      $locationModelParameter: null,

      locationModelParameter: {
        $meta: function () {
          return [TypeAttribute(IPortLocationModelParameter.$class)]
        },
        get: function () {
          return this.$locationModelParameter
        },
        set: function (/*yfiles.graph.IPortLocationModelParameter*/ value) {
          this.$locationModelParameter = value
        }
      },

      $shareLocationModelParameterInstance: false,

      shareLocationModelParameterInstance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareLocationModelParameterInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareLocationModelParameterInstance = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(IPortStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.IPortStyle*/ value) {
          this.$style = value
        }
      },

      $shareStyleInstance: false,

      shareStyleInstance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareStyleInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareStyleInstance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.PortDefaults*/ newInstance = new PortDefaults()
        {
          newInstance.autoCleanUp = this.$autoCleanup
          newInstance.locationParameter = this.$locationModelParameter
          newInstance.shareLocationParameterInstance = this.$shareLocationModelParameterInstance
          newInstance.shareStyleInstance = this.$shareStyleInstance
          newInstance.style = this.$style
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.GraphMLReferenceExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $resourceKey: null,

      resourceKey: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$resourceKey
        },
        set: function (/*string*/ value) {
          this.$resourceKey = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new yfiles.graphml.GraphMLReferenceExtension(this.$resourceKey).provideValue(
          serviceProvider
        )
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.GraphSettingsExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $nodeDefaults: null,

      nodeDefaults: {
        $meta: function () {
          return [TypeAttribute(INodeDefaults.$class)]
        },
        get: function () {
          return this.$nodeDefaults
        },
        set: function (/*yfiles.graph.INodeDefaults*/ value) {
          this.$nodeDefaults = value
        }
      },

      $groupNodeDefaults: null,

      groupNodeDefaults: {
        $meta: function () {
          return [TypeAttribute(INodeDefaults.$class)]
        },
        get: function () {
          return this.$groupNodeDefaults
        },
        set: function (/*yfiles.graph.INodeDefaults*/ value) {
          this.$groupNodeDefaults = value
        }
      },

      $edgeDefaults: null,

      edgeDefaults: {
        $meta: function () {
          return [TypeAttribute(IEdgeDefaults.$class)]
        },
        get: function () {
          return this.$edgeDefaults
        },
        set: function (/*yfiles.graph.IEdgeDefaults*/ value) {
          this.$edgeDefaults = value
        }
      },

      $usePortCandidateProviders: false,

      usePortCandidateProviders: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$usePortCandidateProviders
        },
        set: function (/*boolean*/ value) {
          this.$usePortCandidateProviders = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.GraphSettings*/ newInstance = new yfiles.graphml.GraphSettings()
        {
          newInstance.edgeDefaults = this.$edgeDefaults
          newInstance.groupNodeDefaults = this.$groupNodeDefaults
          newInstance.nodeDefaults = this.$nodeDefaults
          newInstance.usePortCandidateProviders = this.$usePortCandidateProviders
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.ColumnExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'columns' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initColumnExtension()
        this.$minimumSize = -1.0
        this.$size = -1.0
      },

      $columns: null,

      $labels: null,

      columns: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(ICollection.$class)
          ]
        },
        get: function () {
          return this.$columns
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$style = value
        }
      },

      $minimumSize: 0,

      minimumSize: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$minimumSize
        },
        set: function (/*number*/ value) {
          this.$minimumSize = value
        }
      },

      $size: 0,

      size: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$size
        },
        set: function (/*number*/ value) {
          this.$size = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      labels: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(ICollection.$class)
          ]
        },
        get: function () {
          return this.$labels
        }
      },

      $tag: null,

      tag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$tag
        },
        set: function (/*Object*/ value) {
          this.$tag = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.ColumnExtension*/ newInstance = new yfiles.graphml.ColumnExtension()
        {
          newInstance.minimumSize = this.$minimumSize
          newInstance.insets = this.$insets
          newInstance.size = this.$size
          newInstance.tag = this.$tag
          newInstance.style = this.$style
        }
        var /*yfiles.graphml.ColumnExtension*/ columnExtension = newInstance
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$labels.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*yfiles.graph.ILabel*/ label = tmpEnumerator.current
          {
            columnExtension.labels.add(label)
          }
        }
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator2
        for (tmpEnumerator2 = this.$columns.getEnumerator(); tmpEnumerator2.moveNext(); ) {
          var /*yfiles.graph.IColumn*/ childRow = tmpEnumerator2.current
          {
            columnExtension.columns.add(childRow)
          }
        }
        return columnExtension.provideValue(serviceProvider)
      },

      $initColumnExtension: function () {
        this.$columns = new List()
        this.$labels = new List()
        this.$insets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.LabelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initLabelExtension()
      },

      $preferredSize: null,

      $preferredSizeSet: false,

      $text: null,

      text: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$text
        },
        set: function (/*string*/ value) {
          this.$text = value
        }
      },

      $paramSet: false,

      $labelModelParameter: null,

      labelModelParameter: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$labelModelParameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$paramSet = true
          this.$labelModelParameter = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(ILabelStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.ILabelStyle*/ value) {
          this.$style = value
        }
      },

      preferredSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$preferredSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$preferredSize = value
          this.$preferredSizeSet = true
        }
      },

      $tag: null,

      tag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$tag
        },
        set: function (/*Object*/ value) {
          this.$tag = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.LabelExtension*/ newInstance = new yfiles.graphml.LabelExtension()
        {
          newInstance.text = this.$text
          newInstance.style = this.$style
          newInstance.tag = this.$tag
        }
        var /*yfiles.graphml.LabelExtension*/ labelExtension = newInstance
        if (this.$preferredSizeSet) {
          labelExtension.preferredSize = this.$preferredSize
        }

        if (this.$paramSet) {
          labelExtension.layoutParameter = this.$labelModelParameter
        }

        return labelExtension.provideValue(serviceProvider)
      },

      $initLabelExtension: function () {
        this.$preferredSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.PortExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $tag: null,

      $tagSet: false,

      tag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$tag
        },
        set: function (/*Object*/ value) {
          this.$tagSet = true
          this.$tag = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(IPortStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.IPortStyle*/ value) {
          this.$style = value
        }
      },

      $locationModelParameter: null,

      locationModelParameter: {
        $meta: function () {
          return [TypeAttribute(IPortLocationModelParameter.$class)]
        },
        get: function () {
          return this.$locationModelParameter
        },
        set: function (/*yfiles.graph.IPortLocationModelParameter*/ value) {
          this.$locationModelParameter = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.PortExtension*/ newInstance = new yfiles.graphml.PortExtension()
        {
          newInstance.style = this.$style
          newInstance.locationParameter = this.$locationModelParameter
        }
        var /*yfiles.graphml.PortExtension*/ portExtension = newInstance
        if (this.$tagSet) {
          portExtension.tag = this.$tag
        }
        return portExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.VoidEdgeStyleExtension = new ClassDefinition(function () {
    return {
      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(IEdgeStyle.$class)]
          },
          value: null
        },

        $clinit: function () {
          compat.graphml.common.VoidEdgeStyleExtension.INSTANCE = VoidEdgeStyle.INSTANCE
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.EdgeViewStateExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initEdgeViewStateExtension()
      },

      $labels: null,

      $bends: null,

      labels: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$labels
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(IEdgeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.IEdgeStyle*/ value) {
          this.$style = value
        }
      },

      bends: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$bends
        }
      },

      $sourcePort: null,

      sourcePort: {
        $meta: function () {
          return [TypeAttribute(IPort.$class)]
        },
        get: function () {
          return this.$sourcePort
        },
        set: function (/*yfiles.graph.IPort*/ value) {
          this.$sourcePort = value
        }
      },

      $targetPort: null,

      targetPort: {
        $meta: function () {
          return [TypeAttribute(IPort.$class)]
        },
        get: function () {
          return this.$targetPort
        },
        set: function (/*yfiles.graph.IPort*/ value) {
          this.$targetPort = value
        }
      },

      $tag: null,

      $tagSet: false,

      tag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$tag
        },
        set: function (/*Object*/ value) {
          this.$tagSet = true
          this.$tag = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.FoldingEdgeStateExtension*/
          newInstance = new yfiles.graphml.FoldingEdgeStateExtension()
        {
          newInstance.style = this.$style
          newInstance.sourcePort = this.$sourcePort
          newInstance.targetPort = this.$targetPort
        }
        var /*yfiles.graphml.FoldingEdgeStateExtension*/ foldingEdgeStateExtension = newInstance
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$labels.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*yfiles.graph.ILabel*/ label = tmpEnumerator.current
          {
            foldingEdgeStateExtension.labels.add(label)
          }
        }
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator2
        for (tmpEnumerator2 = this.$bends.getEnumerator(); tmpEnumerator2.moveNext(); ) {
          var /*yfiles.graph.IBend*/ bend = tmpEnumerator2.current
          {
            foldingEdgeStateExtension.bends.add(bend)
          }
        }
        if (this.$tagSet) {
          foldingEdgeStateExtension.tag = this.$tag
        }
        return foldingEdgeStateExtension.provideValue(serviceProvider)
      },

      $initEdgeViewStateExtension: function () {
        this.$labels = new List()
        this.$bends = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.LabelCandidateDescriptorExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$nodeOverlapPenalty = 0.0
        this.$profit = 1.0
        this.$edgeOverlapPenalty = 0.0
      },

      $externalCandidate: false,

      externalCandidate: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$externalCandidate
        },
        set: function (/*boolean*/ value) {
          this.$externalCandidate = value
        }
      },

      $edgeOverlapPenalty: 0,

      edgeOverlapPenalty: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$edgeOverlapPenalty
        },
        set: function (/*number*/ value) {
          this.$edgeOverlapPenalty = value
        }
      },

      $nodeOverlapPenalty: 0,

      nodeOverlapPenalty: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$nodeOverlapPenalty
        },
        set: function (/*number*/ value) {
          this.$nodeOverlapPenalty = value
        }
      },

      $profit: 0,

      profit: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$profit
        },
        set: function (/*number*/ value) {
          this.$profit = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.LabelCandidateDescriptor*/ newInstance = new LabelCandidateDescriptor()
        {
          newInstance.edgeOverlapPenalty = this.$edgeOverlapPenalty
          newInstance.externalCandidate = this.$externalCandidate
          newInstance.nodeOverlapPenalty = this.$nodeOverlapPenalty
          newInstance.profit = this.$profit
        }
        return newInstance
      },

      $static: {
        EXTERNAL_DESCRIPTOR: {
          $meta: function () {
            return [TypeAttribute(ILabelCandidateDescriptor.$class)]
          },
          get: function () {
            return LabelCandidateDescriptor.EXTERNAL_DESCRIPTOR
          }
        },

        INTERNAL_DESCRIPTOR: {
          $meta: function () {
            return [TypeAttribute(ILabelCandidateDescriptor.$class)]
          },
          get: function () {
            return LabelCandidateDescriptor.INTERNAL_DESCRIPTOR
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.VoidNodeStyleExtension = new ClassDefinition(function () {
    return {
      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(INodeStyle.$class)]
          },
          value: null
        },

        $clinit: function () {
          compat.graphml.common.VoidNodeStyleExtension.INSTANCE = VoidNodeStyle.INSTANCE
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.VoidPortStyleExtension = new ClassDefinition(function () {
    return {
      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(IPortStyle.$class)]
          },
          value: null
        },

        $clinit: function () {
          compat.graphml.common.VoidPortStyleExtension.INSTANCE = VoidPortStyle.INSTANCE
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.RowExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'rows' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initRowExtension()
        this.$minimumSize = -1.0
        this.$size = -1.0
      },

      $labels: null,

      $rows: null,

      rows: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(ICollection.$class)
          ]
        },
        get: function () {
          return this.$rows
        }
      },

      $minimumSize: 0,

      minimumSize: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$minimumSize
        },
        set: function (/*number*/ value) {
          this.$minimumSize = value
        }
      },

      $size: 0,

      size: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$size
        },
        set: function (/*number*/ value) {
          this.$size = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      labels: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(ICollection.$class)
          ]
        },
        get: function () {
          return this.$labels
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$style = value
        }
      },

      $tag: null,

      tag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$tag
        },
        set: function (/*Object*/ value) {
          this.$tag = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.RowExtension*/ newInstance = new yfiles.graphml.RowExtension()
        {
          newInstance.minimumSize = this.$minimumSize
          newInstance.insets = this.$insets
          newInstance.size = this.$size
          newInstance.tag = this.$tag
          newInstance.style = this.$style
        }
        var /*yfiles.graphml.RowExtension*/ rowExtension = newInstance
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$labels.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*yfiles.graph.ILabel*/ label = tmpEnumerator.current
          {
            rowExtension.labels.add(label)
          }
        }
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator2
        for (tmpEnumerator2 = this.$rows.getEnumerator(); tmpEnumerator2.moveNext(); ) {
          var /*yfiles.graph.IRow*/ childRow = tmpEnumerator2.current
          {
            rowExtension.rows.add(childRow)
          }
        }
        return rowExtension.provideValue(serviceProvider)
      },

      $initRowExtension: function () {
        this.$labels = new List()
        this.$rows = new List()
        this.$insets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.BendExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initBendExtension()
      },

      $tagSet: false,

      $tag: null,

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.BendExtension*/ newInstance = new yfiles.graphml.BendExtension()
        {
          newInstance.location = this.$location
        }
        var /*yfiles.graphml.BendExtension*/ bendExtension = newInstance
        if (this.$tagSet) {
          bendExtension.tag = this.$tag
        }
        return bendExtension.provideValue(serviceProvider)
      },

      $location: null,

      location: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$location
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$location = value
        }
      },

      tag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$tag
        },
        set: function (/*Object*/ value) {
          this.$tagSet = true
          this.$tag = value
        }
      },

      $initBendExtension: function () {
        this.$location = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.VoidLabelStyleExtension = new ClassDefinition(function () {
    return {
      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(ILabelStyle.$class)]
          },
          value: null
        },

        $clinit: function () {
          compat.graphml.common.VoidLabelStyleExtension.INSTANCE = VoidLabelStyle.INSTANCE
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.common', function (exports) {
  exports.NodeDefaultsExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initNodeDefaultsExtension()
        this.$shareStyleInstance = true
      },

      $size: null,

      size: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$size
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$size = value
        }
      },

      $labels: null,

      labels: {
        $meta: function () {
          return [TypeAttribute(ILabelDefaults.$class)]
        },
        get: function () {
          return this.$labels
        },
        set: function (/*yfiles.graph.ILabelDefaults*/ value) {
          this.$labels = value
        }
      },

      $ports: null,

      ports: {
        $meta: function () {
          return [TypeAttribute(IPortDefaults.$class)]
        },
        get: function () {
          return this.$ports
        },
        set: function (/*yfiles.graph.IPortDefaults*/ value) {
          this.$ports = value
        }
      },

      $style: null,

      style: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$style
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$style = value
        }
      },

      $shareStyleInstance: false,

      shareStyleInstance: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$shareStyleInstance
        },
        set: function (/*boolean*/ value) {
          this.$shareStyleInstance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.NodeDefaults*/ newInstance = new NodeDefaults()
        {
          newInstance.shareStyleInstance = this.$shareStyleInstance
          newInstance.style = this.$style
          newInstance.labels = this.$labels
          newInstance.ports = this.$ports
          newInstance.size = this.$size
        }
        return newInstance
      },

      $initNodeDefaultsExtension: function () {
        this.$size = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.ListExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'items' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initListExtension()
      },

      $enumerable: null,

      items: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$enumerable
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.ListExtension*/ listExtension = new yfiles.graphml.ListExtension()
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$enumerable.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*Object*/ item = tmpEnumerator.current
          {
            listExtension.items.add(item)
          }
        }
        return listExtension.provideValue(serviceProvider)
      },

      $initListExtension: function () {
        this.$enumerable = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.GenericListExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'items' })],

      constructor: function () {
        MarkupExtension.call(this)
      },

      $items: null,

      items: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$items
        }
      },

      $type: null,

      type: {
        $meta: function () {
          return [TypeAttribute(Class.$class)]
        },
        get: function () {
          return this.$type
        },
        set: function (/*yfiles.lang.Class*/ value) {
          this.$type = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.ListExtension*/ listExtension = new yfiles.graphml.ListExtension()
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$items.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*Object*/ item = tmpEnumerator.current
          {
            listExtension.items.add(item)
          }
        }
        return listExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.TypeExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $typeName: null,

      typeName: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$typeName
        },
        set: function (/*string*/ value) {
          this.$typeName = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new yfiles.graphml.TypeExtension(this.$typeName).provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.NullExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return null
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.StaticExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $member: null,

      member: {
        $meta: function () {
          return [TypeAttribute(Property.$class)]
        },
        get: function () {
          return this.$member
        },
        set: function (/*yfiles.graphml.Property*/ value) {
          this.$member = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new yfiles.graphml.StaticExtension(this.$member).provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.UndefinedExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return undefined
      }
    }
  })
})
yfiles.lang.module('compat.graphml.commonmarkup', function (exports) {
  exports.ArrayExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'items' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initArrayExtension()
      },

      $type: null,

      type: {
        $meta: function () {
          return [TypeAttribute(Class.$class)]
        },
        get: function () {
          return this.$type
        },
        set: function (/*yfiles.lang.Class*/ value) {
          this.$type = value
        }
      },

      items: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$items
        }
      },

      $items: null,

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.ArrayExtension*/ arrayExtension = new yfiles.graphml.ArrayExtension()
        arrayExtension.type = this.$type
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$items.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*Object*/ item = tmpEnumerator.current
          {
            arrayExtension.items.add(item)
          }
        }
        return arrayExtension.provideValue(serviceProvider)
      },

      $initArrayExtension: function () {
        this.$items = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.PensExtension = new ClassDefinition(function () {
    return {
      $static: {
        ALICE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ALICE_BLUE
          }
        },

        ANTIQUE_WHITE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ANTIQUE_WHITE
          }
        },

        AQUA: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.AQUA
          }
        },

        AQUAMARINE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.AQUAMARINE
          }
        },

        AZURE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.AZURE
          }
        },

        BEIGE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BEIGE
          }
        },

        BISQUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BISQUE
          }
        },

        BLACK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BLACK
          }
        },

        BLANCHED_ALMOND: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BLANCHED_ALMOND
          }
        },

        BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BLUE
          }
        },

        BLUE_VIOLET: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BLUE_VIOLET
          }
        },

        BROWN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BROWN
          }
        },

        BURLY_WOOD: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.BURLY_WOOD
          }
        },

        CADET_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CADET_BLUE
          }
        },

        CHARTREUSE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CHARTREUSE
          }
        },

        CHOCOLATE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CHOCOLATE
          }
        },

        CORAL: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CORAL
          }
        },

        CORNFLOWER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CORNFLOWER_BLUE
          }
        },

        CORNSILK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CORNSILK
          }
        },

        CRIMSON: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CRIMSON
          }
        },

        CYAN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.CYAN
          }
        },

        DARK_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_BLUE
          }
        },

        DARK_CYAN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_CYAN
          }
        },

        DARK_GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_GOLDENROD
          }
        },

        DARK_GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_GRAY
          }
        },

        DARK_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_GREEN
          }
        },

        DARK_KHAKI: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_KHAKI
          }
        },

        DARK_MAGENTA: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_MAGENTA
          }
        },

        DARK_OLIVE_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_OLIVE_GREEN
          }
        },

        DARK_ORANGE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_ORANGE
          }
        },

        DARK_ORCHID: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_ORCHID
          }
        },

        DARK_RED: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_RED
          }
        },

        DARK_SALMON: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_SALMON
          }
        },

        DARK_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_SEA_GREEN
          }
        },

        DARK_SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_SLATE_BLUE
          }
        },

        DARK_SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_SLATE_GRAY
          }
        },

        DARK_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_TURQUOISE
          }
        },

        DARK_VIOLET: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DARK_VIOLET
          }
        },

        DEEP_PINK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DEEP_PINK
          }
        },

        DEEP_SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DEEP_SKY_BLUE
          }
        },

        DIM_GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DIM_GRAY
          }
        },

        DODGER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.DODGER_BLUE
          }
        },

        FIREBRICK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.FIREBRICK
          }
        },

        FLORAL_WHITE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.FLORAL_WHITE
          }
        },

        FOREST_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.FOREST_GREEN
          }
        },

        FUCHSIA: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.FUCHSIA
          }
        },

        GAINSBORO: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GAINSBORO
          }
        },

        GHOST_WHITE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GHOST_WHITE
          }
        },

        GOLD: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GOLD
          }
        },

        GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GOLDENROD
          }
        },

        GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GRAY
          }
        },

        GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GREEN
          }
        },

        GREEN_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.GREEN_YELLOW
          }
        },

        HONEYDEW: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.HONEYDEW
          }
        },

        HOT_PINK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.HOT_PINK
          }
        },

        INDIAN_RED: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.INDIAN_RED
          }
        },

        INDIGO: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.INDIGO
          }
        },

        IVORY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.IVORY
          }
        },

        KHAKI: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.KHAKI
          }
        },

        LAVENDER: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LAVENDER
          }
        },

        LAVENDER_BLUSH: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LAVENDER_BLUSH
          }
        },

        LAWN_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LAWN_GREEN
          }
        },

        LEMON_CHIFFON: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LEMON_CHIFFON
          }
        },

        LIGHT_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_BLUE
          }
        },

        LIGHT_CORAL: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_CORAL
          }
        },

        LIGHT_CYAN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_CYAN
          }
        },

        LIGHT_GOLDENROD_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_GOLDENROD_YELLOW
          }
        },

        LIGHT_GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_GRAY
          }
        },

        LIGHT_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_GREEN
          }
        },

        LIGHT_PINK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_PINK
          }
        },

        LIGHT_SALMON: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_SALMON
          }
        },

        LIGHT_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_SEA_GREEN
          }
        },

        LIGHT_SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_SKY_BLUE
          }
        },

        LIGHT_SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_SLATE_GRAY
          }
        },

        LIGHT_STEEL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_STEEL_BLUE
          }
        },

        LIGHT_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIGHT_YELLOW
          }
        },

        LIME: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIME
          }
        },

        LIME_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LIME_GREEN
          }
        },

        LINEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.LINEN
          }
        },

        MAGENTA: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MAGENTA
          }
        },

        MAROON: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MAROON
          }
        },

        MEDIUM_AQUAMARINE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_AQUAMARINE
          }
        },

        MEDIUM_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_BLUE
          }
        },

        MEDIUM_ORCHID: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_ORCHID
          }
        },

        MEDIUM_PURPLE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_PURPLE
          }
        },

        MEDIUM_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_SEA_GREEN
          }
        },

        MEDIUM_SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_SLATE_BLUE
          }
        },

        MEDIUM_SPRING_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_SPRING_GREEN
          }
        },

        MEDIUM_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_TURQUOISE
          }
        },

        MEDIUM_VIOLET_RED: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MEDIUM_VIOLET_RED
          }
        },

        MIDNIGHT_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MIDNIGHT_BLUE
          }
        },

        MINT_CREAM: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MINT_CREAM
          }
        },

        MISTY_ROSE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MISTY_ROSE
          }
        },

        MOCCASIN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.MOCCASIN
          }
        },

        NAVAJO_WHITE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.NAVAJO_WHITE
          }
        },

        NAVY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.NAVY
          }
        },

        OLD_LACE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.OLD_LACE
          }
        },

        OLIVE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.OLIVE
          }
        },

        OLIVE_DRAB: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.OLIVE_DRAB
          }
        },

        ORANGE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ORANGE
          }
        },

        ORANGE_RED: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ORANGE_RED
          }
        },

        ORCHID: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ORCHID
          }
        },

        PALE_GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PALE_GOLDENROD
          }
        },

        PALE_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PALE_GREEN
          }
        },

        PALE_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PALE_TURQUOISE
          }
        },

        PALE_VIOLET_RED: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PALE_VIOLET_RED
          }
        },

        PAPAYA_WHIP: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PAPAYA_WHIP
          }
        },

        PEACH_PUFF: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PEACH_PUFF
          }
        },

        PERU: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PERU
          }
        },

        PINK: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PINK
          }
        },

        PLUM: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PLUM
          }
        },

        POWDER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.POWDER_BLUE
          }
        },

        PURPLE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.PURPLE
          }
        },

        RED: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.RED
          }
        },

        ROSY_BROWN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ROSY_BROWN
          }
        },

        ROYAL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.ROYAL_BLUE
          }
        },

        SADDLE_BROWN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SADDLE_BROWN
          }
        },

        SALMON: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SALMON
          }
        },

        SANDY_BROWN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SANDY_BROWN
          }
        },

        SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SEA_GREEN
          }
        },

        SEA_SHELL: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SEA_SHELL
          }
        },

        SIENNA: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SIENNA
          }
        },

        SILVER: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SILVER
          }
        },

        SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SKY_BLUE
          }
        },

        SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SLATE_BLUE
          }
        },

        SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SLATE_GRAY
          }
        },

        SNOW: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SNOW
          }
        },

        SPRING_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.SPRING_GREEN
          }
        },

        STEEL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.STEEL_BLUE
          }
        },

        TAN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.TAN
          }
        },

        TEAL: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.TEAL
          }
        },

        THISTLE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.THISTLE
          }
        },

        TOMATO: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.TOMATO
          }
        },

        TRANSPARENT: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.TRANSPARENT
          }
        },

        TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.TURQUOISE
          }
        },

        VIOLET: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.VIOLET
          }
        },

        WHEAT: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.WHEAT
          }
        },

        WHITE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.WHITE
          }
        },

        WHITE_SMOKE: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.WHITE_SMOKE
          }
        },

        YELLOW: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.YELLOW
          }
        },

        YELLOW_GREEN: {
          $meta: function () {
            return [TypeAttribute(Stroke.$class)]
          },
          get: function () {
            return Stroke.YELLOW_GREEN
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.PenExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initPenExtension()
        this.$dashCap = compat.graphml.wpfbridge.PenLineCap.FLAT
        this.$endLineCap = compat.graphml.wpfbridge.PenLineCap.FLAT
        this.$startLineCap = compat.graphml.wpfbridge.PenLineCap.FLAT
        this.$miterLimit = 10.0
        this.$thickness = 1.0
        this.$dashStyle = DashStyle.SOLID
        this.$lineJoin = compat.graphml.wpfbridge.PenLineJoin.MITER
        this.$brush = Fill.BLACK
      },

      $brush: null,

      brush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$brush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$brush = value
        }
      },

      $dashCap: null,

      dashCap: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.PenLineCap.$class)]
        },
        get: function () {
          return this.$dashCap
        },
        set: function (/*compat.graphml.wpfbridge.PenLineCap*/ value) {
          this.$dashCap = value
        }
      },

      $endLineCap: null,

      endLineCap: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.PenLineCap.$class)]
        },
        get: function () {
          return this.$endLineCap
        },
        set: function (/*compat.graphml.wpfbridge.PenLineCap*/ value) {
          this.$endLineCap = value
        }
      },

      $lineJoin: null,

      lineJoin: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.PenLineJoin.$class)]
        },
        get: function () {
          return this.$lineJoin
        },
        set: function (/*compat.graphml.wpfbridge.PenLineJoin*/ value) {
          this.$lineJoin = value
        }
      },

      $dashStyle: null,

      dashStyle: {
        $meta: function () {
          return [TypeAttribute(DashStyle.$class)]
        },
        get: function () {
          return this.$dashStyle
        },
        set: function (/*yfiles.view.DashStyle*/ value) {
          this.$dashStyle = value
        }
      },

      $miterLimit: 0,

      miterLimit: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$miterLimit
        },
        set: function (/*number*/ value) {
          this.$miterLimit = value
        }
      },

      $startLineCap: null,

      startLineCap: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.PenLineCap.$class)]
        },
        get: function () {
          return this.$startLineCap
        },
        set: function (/*compat.graphml.wpfbridge.PenLineCap*/ value) {
          this.$startLineCap = value
        }
      },

      $thickness: 0,

      thickness: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$thickness
        },
        set: function (/*number*/ value) {
          this.$thickness = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.view.Stroke*/ newInstance = new Stroke()
        {
          newInstance.fill = this.$brush
          newInstance.lineCap = /*(yfiles.view.LineCap)*/ this.$dashCap
          newInstance.dashStyle = this.$dashStyle
          newInstance.lineJoin = /*(yfiles.view.LineJoin)*/ this.$lineJoin
          newInstance.miterLimit = this.$miterLimit
          newInstance.thickness = this.$thickness
        }
        return newInstance
      },

      $initPenExtension: function () {
        this.$dashCap = compat.graphml.wpfbridge.PenLineCap.SQUARE
        this.$endLineCap = compat.graphml.wpfbridge.PenLineCap.SQUARE
        this.$lineJoin = compat.graphml.wpfbridge.PenLineJoin.BEVEL
        this.$startLineCap = compat.graphml.wpfbridge.PenLineCap.SQUARE
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.PenLineJoin = new EnumDefinition(function () {
    return {
      BEVEL: 0,
      ROUND: 1,
      MITER: 2
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.PenLineCap = new EnumDefinition(function () {
    return {
      SQUARE: 0,
      FLAT: 1,
      ROUND: 2
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.LinearGradientBrushExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.wpfbridge.GradientBrushExtension,

      constructor: function () {
        compat.graphml.wpfbridge.GradientBrushExtension.call(this)
        this.$initLinearGradientBrushExtension()
        this.$startPoint = Point.ORIGIN
        this.$endPoint = new Point(1, 1)
      },

      $spreadMethod: null,

      spreadMethod: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.GradientSpreadMethod.$class)]
        },
        get: function () {
          return this.$spreadMethod
        },
        set: function (/*compat.graphml.wpfbridge.GradientSpreadMethod*/ value) {
          this.$spreadMethod = value
        }
      },

      $startPoint: null,

      startPoint: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$startPoint
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$startPoint = value
        }
      },

      $endPoint: null,

      endPoint: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$endPoint
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$endPoint = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.view.LinearGradient*/ newInstance = new LinearGradient()
        {
          newInstance.startPoint = this.$startPoint
          newInstance.endPoint = this.$endPoint
          newInstance.spreadMethod = /*(yfiles.view.GradientSpreadMethod)*/ this.$spreadMethod
        }
        var /*yfiles.view.LinearGradient*/ linearGradient = newInstance
        if (this.gradientStopsSet) {
          linearGradient.gradientStops = this.$gradientStops
        } else {
          var /*yfiles.collections.IEnumerator*/ tmpEnumerator
          for (tmpEnumerator = this.$gradientStops.getEnumerator(); tmpEnumerator.moveNext(); ) {
            var /*yfiles.view.GradientStop*/ gradientStop = tmpEnumerator.current
            {
              linearGradient.gradientStops.add(gradientStop)
            }
          }
        }
        return linearGradient
      },

      $initLinearGradientBrushExtension: function () {
        this.$spreadMethod = compat.graphml.wpfbridge.GradientSpreadMethod.PAD
        this.$startPoint = new Point(0, 0)
        this.$endPoint = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.SolidColorBrushExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $color: null,

      color: {
        $meta: function () {
          return [TypeAttribute(Color.$class)]
        },
        get: function () {
          return this.$color
        },
        set: function (/*yfiles.view.Color*/ value) {
          this.$color = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new SolidColorFill(this.$color)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.TypefaceExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initTypefaceExtension()
        this.$fontSize = 10
        this.$fontFamily = 'Arial'
        this.$fontStyle = compat.graphml.wpfbridge.FontStyle.NORMAL
        this.$fontWeight = compat.graphml.wpfbridge.FontWeight.NORMAL
        this.$lineSpacing = 0.5
        this.$textDecoration = compat.graphml.wpfbridge.TextDecoration.NONE
      },

      $fontSize: 0,

      fontSize: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$fontSize
        },
        set: function (/*number*/ value) {
          this.$fontSize = value
        }
      },

      $fontFamily: null,

      fontFamily: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$fontFamily
        },
        set: function (/*string*/ value) {
          this.$fontFamily = value
        }
      },

      $fontStyle: null,

      fontStyle: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.FontStyle.$class)]
        },
        get: function () {
          return this.$fontStyle
        },
        set: function (/*compat.graphml.wpfbridge.FontStyle*/ value) {
          this.$fontStyle = value
        }
      },

      $fontWeight: null,

      fontWeight: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.FontWeight.$class)]
        },
        get: function () {
          return this.$fontWeight
        },
        set: function (/*compat.graphml.wpfbridge.FontWeight*/ value) {
          this.$fontWeight = value
        }
      },

      $lineSpacing: 0,

      lineSpacing: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$lineSpacing
        },
        set: function (/*number*/ value) {
          this.$lineSpacing = value
        }
      },

      $textDecoration: null,

      textDecoration: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.TextDecoration.$class)]
        },
        get: function () {
          return this.$textDecoration
        },
        set: function (/*compat.graphml.wpfbridge.TextDecoration*/ value) {
          this.$textDecoration = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.view.FontExtension*/ newInstance = new yfiles.view.FontExtension()
        {
          newInstance.fontFamily = this.$fontFamily
          newInstance.fontSize = this.$fontSize
          newInstance.fontStyle = /*(yfiles.view.FontStyle)*/ this.$fontStyle
          newInstance.fontWeight = /*(yfiles.view.FontWeight)*/ this.$fontWeight
          newInstance.lineSpacing = this.$lineSpacing
          newInstance.textDecoration = /*(yfiles.view.TextDecoration)*/ this.$textDecoration
        }
        return newInstance.provideValue(serviceProvider)
      },

      $initTypefaceExtension: function () {
        this.$fontStyle = compat.graphml.wpfbridge.FontStyle.NORMAL
        this.$fontWeight = compat.graphml.wpfbridge.FontWeight.NORMAL
        this.$textDecoration = compat.graphml.wpfbridge.TextDecoration.NONE
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.ColorsExtension = new ClassDefinition(function () {
    return {
      $static: {
        ALICE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ALICE_BLUE
          }
        },

        ANTIQUE_WHITE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ANTIQUE_WHITE
          }
        },

        AQUA: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.AQUA
          }
        },

        AQUAMARINE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.AQUAMARINE
          }
        },

        AZURE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.AZURE
          }
        },

        BEIGE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BEIGE
          }
        },

        BISQUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BISQUE
          }
        },

        BLACK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BLACK
          }
        },

        BLANCHED_ALMOND: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BLANCHED_ALMOND
          }
        },

        BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BLUE
          }
        },

        BLUE_VIOLET: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BLUE_VIOLET
          }
        },

        BROWN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BROWN
          }
        },

        BURLY_WOOD: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.BURLY_WOOD
          }
        },

        CADET_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CADET_BLUE
          }
        },

        CHARTREUSE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CHARTREUSE
          }
        },

        CHOCOLATE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CHOCOLATE
          }
        },

        CORAL: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CORAL
          }
        },

        CORNFLOWER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CORNFLOWER_BLUE
          }
        },

        CORNSILK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CORNSILK
          }
        },

        CRIMSON: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CRIMSON
          }
        },

        CYAN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.CYAN
          }
        },

        DARK_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_BLUE
          }
        },

        DARK_CYAN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_CYAN
          }
        },

        DARK_GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_GOLDENROD
          }
        },

        DARK_GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_GRAY
          }
        },

        DARK_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_GREEN
          }
        },

        DARK_KHAKI: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_KHAKI
          }
        },

        DARK_MAGENTA: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_MAGENTA
          }
        },

        DARK_OLIVE_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_OLIVE_GREEN
          }
        },

        DARK_ORANGE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_ORANGE
          }
        },

        DARK_ORCHID: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_ORCHID
          }
        },

        DARK_RED: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_RED
          }
        },

        DARK_SALMON: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_SALMON
          }
        },

        DARK_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_SEA_GREEN
          }
        },

        DARK_SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_SLATE_BLUE
          }
        },

        DARK_SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_SLATE_GRAY
          }
        },

        DARK_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_TURQUOISE
          }
        },

        DARK_VIOLET: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DARK_VIOLET
          }
        },

        DEEP_PINK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DEEP_PINK
          }
        },

        DEEP_SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DEEP_SKY_BLUE
          }
        },

        DIM_GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DIM_GRAY
          }
        },

        DODGER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.DODGER_BLUE
          }
        },

        FIREBRICK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.FIREBRICK
          }
        },

        FLORAL_WHITE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.FLORAL_WHITE
          }
        },

        FOREST_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.FOREST_GREEN
          }
        },

        FUCHSIA: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.FUCHSIA
          }
        },

        GAINSBORO: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GAINSBORO
          }
        },

        GHOST_WHITE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GHOST_WHITE
          }
        },

        GOLD: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GOLD
          }
        },

        GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GOLDENROD
          }
        },

        GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GRAY
          }
        },

        GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GREEN
          }
        },

        GREEN_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.GREEN_YELLOW
          }
        },

        HONEYDEW: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.HONEYDEW
          }
        },

        HOT_PINK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.HOT_PINK
          }
        },

        INDIAN_RED: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.INDIAN_RED
          }
        },

        INDIGO: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.INDIGO
          }
        },

        IVORY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.IVORY
          }
        },

        KHAKI: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.KHAKI
          }
        },

        LAVENDER: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LAVENDER
          }
        },

        LAVENDER_BLUSH: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LAVENDER_BLUSH
          }
        },

        LAWN_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LAWN_GREEN
          }
        },

        LEMON_CHIFFON: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LEMON_CHIFFON
          }
        },

        LIGHT_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_BLUE
          }
        },

        LIGHT_CORAL: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_CORAL
          }
        },

        LIGHT_CYAN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_CYAN
          }
        },

        LIGHT_GOLDENROD_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_GOLDENROD_YELLOW
          }
        },

        LIGHT_GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_GRAY
          }
        },

        LIGHT_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_GREEN
          }
        },

        LIGHT_PINK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_PINK
          }
        },

        LIGHT_SALMON: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_SALMON
          }
        },

        LIGHT_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_SEA_GREEN
          }
        },

        LIGHT_SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_SKY_BLUE
          }
        },

        LIGHT_SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_SLATE_GRAY
          }
        },

        LIGHT_STEEL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_STEEL_BLUE
          }
        },

        LIGHT_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIGHT_YELLOW
          }
        },

        LIME: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIME
          }
        },

        LIME_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LIME_GREEN
          }
        },

        LINEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.LINEN
          }
        },

        MAGENTA: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MAGENTA
          }
        },

        MAROON: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MAROON
          }
        },

        MEDIUM_AQUAMARINE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_AQUAMARINE
          }
        },

        MEDIUM_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_BLUE
          }
        },

        MEDIUM_ORCHID: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_ORCHID
          }
        },

        MEDIUM_PURPLE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_PURPLE
          }
        },

        MEDIUM_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_SEA_GREEN
          }
        },

        MEDIUM_SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_SLATE_BLUE
          }
        },

        MEDIUM_SPRING_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_SPRING_GREEN
          }
        },

        MEDIUM_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_TURQUOISE
          }
        },

        MEDIUM_VIOLET_RED: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MEDIUM_VIOLET_RED
          }
        },

        MIDNIGHT_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MIDNIGHT_BLUE
          }
        },

        MINT_CREAM: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MINT_CREAM
          }
        },

        MISTY_ROSE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MISTY_ROSE
          }
        },

        MOCCASIN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.MOCCASIN
          }
        },

        NAVAJO_WHITE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.NAVAJO_WHITE
          }
        },

        NAVY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.NAVY
          }
        },

        OLD_LACE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.OLD_LACE
          }
        },

        OLIVE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.OLIVE
          }
        },

        OLIVE_DRAB: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.OLIVE_DRAB
          }
        },

        ORANGE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ORANGE
          }
        },

        ORANGE_RED: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ORANGE_RED
          }
        },

        ORCHID: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ORCHID
          }
        },

        PALE_GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PALE_GOLDENROD
          }
        },

        PALE_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PALE_GREEN
          }
        },

        PALE_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PALE_TURQUOISE
          }
        },

        PALE_VIOLET_RED: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PALE_VIOLET_RED
          }
        },

        PAPAYA_WHIP: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PAPAYA_WHIP
          }
        },

        PEACH_PUFF: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PEACH_PUFF
          }
        },

        PERU: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PERU
          }
        },

        PINK: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PINK
          }
        },

        PLUM: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PLUM
          }
        },

        POWDER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.POWDER_BLUE
          }
        },

        PURPLE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.PURPLE
          }
        },

        RED: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.RED
          }
        },

        ROSY_BROWN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ROSY_BROWN
          }
        },

        ROYAL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.ROYAL_BLUE
          }
        },

        SADDLE_BROWN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SADDLE_BROWN
          }
        },

        SALMON: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SALMON
          }
        },

        SANDY_BROWN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SANDY_BROWN
          }
        },

        SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SEA_GREEN
          }
        },

        SEA_SHELL: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SEA_SHELL
          }
        },

        SIENNA: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SIENNA
          }
        },

        SILVER: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SILVER
          }
        },

        SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SKY_BLUE
          }
        },

        SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SLATE_BLUE
          }
        },

        SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SLATE_GRAY
          }
        },

        SNOW: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SNOW
          }
        },

        SPRING_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.SPRING_GREEN
          }
        },

        STEEL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.STEEL_BLUE
          }
        },

        TAN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.TAN
          }
        },

        TEAL: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.TEAL
          }
        },

        THISTLE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.THISTLE
          }
        },

        TOMATO: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.TOMATO
          }
        },

        TRANSPARENT: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.TRANSPARENT
          }
        },

        TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.TURQUOISE
          }
        },

        VIOLET: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.VIOLET
          }
        },

        WHEAT: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.WHEAT
          }
        },

        WHITE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.WHITE
          }
        },

        WHITE_SMOKE: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.WHITE_SMOKE
          }
        },

        YELLOW: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.YELLOW
          }
        },

        YELLOW_GREEN: {
          $meta: function () {
            return [TypeAttribute(Color.$class)]
          },
          get: function () {
            return Color.YELLOW_GREEN
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.ColorExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'value' })],

      constructor: function () {
        MarkupExtension.call(this)
      },

      $value: null,

      $valueSet: false,

      $r: 0,

      r: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$r
        },
        set: function (/*number*/ value) {
          this.$r = value
        }
      },

      $g: 0,

      g: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$g
        },
        set: function (/*number*/ value) {
          this.$g = value
        }
      },

      $b: 0,

      b: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$b
        },
        set: function (/*number*/ value) {
          this.$b = value
        }
      },

      $a: 0,

      a: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$a
        },
        set: function (/*number*/ value) {
          this.$a = value
        }
      },

      value: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$value
        },
        set: function (/*string*/ value) {
          this.$valueSet = true
          this.$value = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        if (this.$valueSet) {
          var /*yfiles.view.ColorExtension*/ newInstance = new ColorExtension()
          {
            newInstance.value = this.$value
          }
          return newInstance.provideValue(serviceProvider)
        }
        return new Color(this.$r, this.$g, this.$b, this.$a)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.BrushesExtension = new ClassDefinition(function () {
    return {
      $static: {
        ALICE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ALICE_BLUE
          }
        },

        ANTIQUE_WHITE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ANTIQUE_WHITE
          }
        },

        AQUA: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.AQUA
          }
        },

        AQUAMARINE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.AQUAMARINE
          }
        },

        AZURE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.AZURE
          }
        },

        BEIGE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BEIGE
          }
        },

        BISQUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BISQUE
          }
        },

        BLACK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BLACK
          }
        },

        BLANCHED_ALMOND: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BLANCHED_ALMOND
          }
        },

        BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BLUE
          }
        },

        BLUE_VIOLET: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BLUE_VIOLET
          }
        },

        BROWN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BROWN
          }
        },

        BURLY_WOOD: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.BURLY_WOOD
          }
        },

        CADET_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CADET_BLUE
          }
        },

        CHARTREUSE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CHARTREUSE
          }
        },

        CHOCOLATE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CHOCOLATE
          }
        },

        CORAL: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CORAL
          }
        },

        CORNFLOWER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CORNFLOWER_BLUE
          }
        },

        CORNSILK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CORNSILK
          }
        },

        CRIMSON: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CRIMSON
          }
        },

        CYAN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.CYAN
          }
        },

        DARK_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_BLUE
          }
        },

        DARK_CYAN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_CYAN
          }
        },

        DARK_GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_GOLDENROD
          }
        },

        DARK_GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_GRAY
          }
        },

        DARK_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_GREEN
          }
        },

        DARK_KHAKI: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_KHAKI
          }
        },

        DARK_MAGENTA: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_MAGENTA
          }
        },

        DARK_OLIVE_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_OLIVE_GREEN
          }
        },

        DARK_ORANGE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_ORANGE
          }
        },

        DARK_ORCHID: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_ORCHID
          }
        },

        DARK_RED: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_RED
          }
        },

        DARK_SALMON: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_SALMON
          }
        },

        DARK_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_SEA_GREEN
          }
        },

        DARK_SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_SLATE_BLUE
          }
        },

        DARK_SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_SLATE_GRAY
          }
        },

        DARK_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_TURQUOISE
          }
        },

        DARK_VIOLET: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DARK_VIOLET
          }
        },

        DEEP_PINK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DEEP_PINK
          }
        },

        DEEP_SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DEEP_SKY_BLUE
          }
        },

        DIM_GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DIM_GRAY
          }
        },

        DODGER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.DODGER_BLUE
          }
        },

        FIREBRICK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.FIREBRICK
          }
        },

        FLORAL_WHITE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.FLORAL_WHITE
          }
        },

        FOREST_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.FOREST_GREEN
          }
        },

        FUCHSIA: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.FUCHSIA
          }
        },

        GAINSBORO: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GAINSBORO
          }
        },

        GHOST_WHITE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GHOST_WHITE
          }
        },

        GOLD: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GOLD
          }
        },

        GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GOLDENROD
          }
        },

        GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GRAY
          }
        },

        GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GREEN
          }
        },

        GREEN_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.GREEN_YELLOW
          }
        },

        HONEYDEW: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.HONEYDEW
          }
        },

        HOT_PINK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.HOT_PINK
          }
        },

        INDIAN_RED: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.INDIAN_RED
          }
        },

        INDIGO: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.INDIGO
          }
        },

        IVORY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.IVORY
          }
        },

        KHAKI: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.KHAKI
          }
        },

        LAVENDER: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LAVENDER
          }
        },

        LAVENDER_BLUSH: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LAVENDER_BLUSH
          }
        },

        LAWN_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LAWN_GREEN
          }
        },

        LEMON_CHIFFON: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LEMON_CHIFFON
          }
        },

        LIGHT_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_BLUE
          }
        },

        LIGHT_CORAL: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_CORAL
          }
        },

        LIGHT_CYAN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_CYAN
          }
        },

        LIGHT_GOLDENROD_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_GOLDENROD_YELLOW
          }
        },

        LIGHT_GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_GRAY
          }
        },

        LIGHT_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_GREEN
          }
        },

        LIGHT_PINK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_PINK
          }
        },

        LIGHT_SALMON: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_SALMON
          }
        },

        LIGHT_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_SEA_GREEN
          }
        },

        LIGHT_SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_SKY_BLUE
          }
        },

        LIGHT_SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_SLATE_GRAY
          }
        },

        LIGHT_STEEL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_STEEL_BLUE
          }
        },

        LIGHT_YELLOW: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIGHT_YELLOW
          }
        },

        LIME: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIME
          }
        },

        LIME_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LIME_GREEN
          }
        },

        LINEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.LINEN
          }
        },

        MAGENTA: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MAGENTA
          }
        },

        MAROON: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MAROON
          }
        },

        MEDIUM_AQUAMARINE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_AQUAMARINE
          }
        },

        MEDIUM_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_BLUE
          }
        },

        MEDIUM_ORCHID: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_ORCHID
          }
        },

        MEDIUM_PURPLE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_PURPLE
          }
        },

        MEDIUM_SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_SEA_GREEN
          }
        },

        MEDIUM_SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_SLATE_BLUE
          }
        },

        MEDIUM_SPRING_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_SPRING_GREEN
          }
        },

        MEDIUM_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_TURQUOISE
          }
        },

        MEDIUM_VIOLET_RED: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MEDIUM_VIOLET_RED
          }
        },

        MIDNIGHT_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MIDNIGHT_BLUE
          }
        },

        MINT_CREAM: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MINT_CREAM
          }
        },

        MISTY_ROSE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MISTY_ROSE
          }
        },

        MOCCASIN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.MOCCASIN
          }
        },

        NAVAJO_WHITE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.NAVAJO_WHITE
          }
        },

        NAVY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.NAVY
          }
        },

        OLD_LACE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.OLD_LACE
          }
        },

        OLIVE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.OLIVE
          }
        },

        OLIVE_DRAB: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.OLIVE_DRAB
          }
        },

        ORANGE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ORANGE
          }
        },

        ORANGE_RED: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ORANGE_RED
          }
        },

        ORCHID: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ORCHID
          }
        },

        PALE_GOLDENROD: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PALE_GOLDENROD
          }
        },

        PALE_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PALE_GREEN
          }
        },

        PALE_TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PALE_TURQUOISE
          }
        },

        PALE_VIOLET_RED: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PALE_VIOLET_RED
          }
        },

        PAPAYA_WHIP: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PAPAYA_WHIP
          }
        },

        PEACH_PUFF: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PEACH_PUFF
          }
        },

        PERU: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PERU
          }
        },

        PINK: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PINK
          }
        },

        PLUM: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PLUM
          }
        },

        POWDER_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.POWDER_BLUE
          }
        },

        PURPLE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.PURPLE
          }
        },

        RED: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.RED
          }
        },

        ROSY_BROWN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ROSY_BROWN
          }
        },

        ROYAL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.ROYAL_BLUE
          }
        },

        SADDLE_BROWN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SADDLE_BROWN
          }
        },

        SALMON: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SALMON
          }
        },

        SANDY_BROWN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SANDY_BROWN
          }
        },

        SEA_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SEA_GREEN
          }
        },

        SEA_SHELL: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SEA_SHELL
          }
        },

        SIENNA: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SIENNA
          }
        },

        SILVER: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SILVER
          }
        },

        SKY_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SKY_BLUE
          }
        },

        SLATE_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SLATE_BLUE
          }
        },

        SLATE_GRAY: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SLATE_GRAY
          }
        },

        SNOW: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SNOW
          }
        },

        SPRING_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.SPRING_GREEN
          }
        },

        STEEL_BLUE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.STEEL_BLUE
          }
        },

        TAN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.TAN
          }
        },

        TEAL: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.TEAL
          }
        },

        THISTLE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.THISTLE
          }
        },

        TOMATO: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.TOMATO
          }
        },

        TRANSPARENT: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.TRANSPARENT
          }
        },

        TURQUOISE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.TURQUOISE
          }
        },

        VIOLET: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.VIOLET
          }
        },

        WHEAT: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.WHEAT
          }
        },

        WHITE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.WHITE
          }
        },

        WHITE_SMOKE: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.WHITE_SMOKE
          }
        },

        YELLOW: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.YELLOW
          }
        },

        YELLOW_GREEN: {
          $meta: function () {
            return [TypeAttribute(Fill.$class)]
          },
          get: function () {
            return Fill.YELLOW_GREEN
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.RadialGradientBrushExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.wpfbridge.GradientBrushExtension,

      constructor: function () {
        compat.graphml.wpfbridge.GradientBrushExtension.call(this)
        this.$initRadialGradientBrushExtension()
      },

      $center: null,

      center: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$center
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$center = value
        }
      },

      $gradientOrigin: null,

      gradientOrigin: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$gradientOrigin
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$gradientOrigin = value
        }
      },

      $radiusX: 0,

      radiusX: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$radiusX
        },
        set: function (/*number*/ value) {
          this.$radiusX = value
        }
      },

      $radiusY: 0,

      radiusY: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$radiusY
        },
        set: function (/*number*/ value) {
          this.$radiusY = value
        }
      },

      $spreadMethod: null,

      spreadMethod: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.wpfbridge.GradientSpreadMethod.$class)]
        },
        get: function () {
          return this.$spreadMethod
        },
        set: function (/*compat.graphml.wpfbridge.GradientSpreadMethod*/ value) {
          this.$spreadMethod = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*RadialGradient*/ newInstance = new RadialGradient()
        {
          newInstance.spreadMethod = /*(yfiles.view.GradientSpreadMethod)*/ this.$spreadMethod
          newInstance.center = this.$center
          newInstance.gradientOrigin = this.$gradientOrigin
          newInstance.radiusX = this.$radiusX
          newInstance.radiusY = this.$radiusY
        }
        var /*yfiles.view.RadialGradient*/ radialGradient = newInstance
        if (this.gradientStopsSet) {
          radialGradient.gradientStops = this.$gradientStops
        } else {
          var /*yfiles.collections.IEnumerator*/ tmpEnumerator
          for (tmpEnumerator = this.$gradientStops.getEnumerator(); tmpEnumerator.moveNext(); ) {
            var /*yfiles.view.GradientStop*/ gradientStop = tmpEnumerator.current
            {
              radialGradient.gradientStops.add(gradientStop)
            }
          }
        }
        return radialGradient
      },

      $initRadialGradientBrushExtension: function () {
        this.$center = new Point(0, 0)
        this.$gradientOrigin = new Point(0, 0)
        this.$spreadMethod = compat.graphml.wpfbridge.GradientSpreadMethod.PAD
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.GradientStopCollectionExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.GradientStopExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $color: null,

      color: {
        $meta: function () {
          return [TypeAttribute(Color.$class)]
        },
        get: function () {
          return this.$color
        },
        set: function (/*yfiles.view.Color*/ value) {
          this.$color = value
        }
      },

      $offset: 0,

      offset: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$offset
        },
        set: function (/*number*/ value) {
          this.$offset = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.view.GradientStop*/ newInstance = new GradientStop()
        {
          newInstance.color = this.$color
          newInstance.offset = this.$offset
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.GradientBrushExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,
      $abstract: true,

      $meta: [GraphMLAttribute().init({ contentProperty: 'gradientStops' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initGradientBrushExtension()
      },

      $gradientStops: null,

      gradientStopsSet: false,

      gradientStops: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(List.$class)
          ]
        },
        get: function () {
          return this.$gradientStops
        },
        set: function (/*yfiles.collections.List<yfiles.view.GradientStop>*/ value) {
          this.gradientStopsSet = true
          this.$gradientStops = value
        }
      },

      $initGradientBrushExtension: function () {
        this.$gradientStops = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.DashStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$dashes = new List()
      },

      $dashes: null,

      dashes: {
        $meta: function () {
          return [
            GraphMLAttribute().init({
              valueSerializer:
                compat.graphml.wpfbridge.DashStyleExtension.NumberCollectionValueSerializer.$class
            }),
            TypeAttribute(List.$class)
          ]
        },
        get: function () {
          return this.$dashes
        },
        set: function (/*yfiles.collections.List<number>*/ value) {
          this.$dashes = value
        }
      },

      $offset: 0,

      offset: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$offset
        },
        set: function (/*number*/ value) {
          this.$offset = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new DashStyle(this.$dashes.toArray(), this.$offset)
      },

      $static: {
        NumberCollectionValueSerializer: new ClassDefinition(function () {
          return {
            $extends: ValueSerializer,

            constructor: function () {
              ValueSerializer.call(this)
            },

            canConvertFromString: function (
              /*string*/ value,
              /*yfiles.graphml.IValueSerializerContext*/ context
            ) {
              return true
            },

            convertFromString: function (
              /*string*/ value,
              /*yfiles.graphml.IValueSerializerContext*/ context
            ) {
              var /*string[]*/ parts = value.split(/[, ]+/)
              var /*yfiles.collections.List<number>*/ doubles = new List()
              var /*number*/ i
              for (i = 0; i < parts.length; i++) {
                var /*string*/ part = parts[i]
                var /*number*/ num = parseFloat(part)
                doubles.add(num)
              }
              return doubles
            }
          }
        })
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.DashStylesExtension = new ClassDefinition(function () {
    return {
      $static: {
        DASH: {
          $meta: function () {
            return [TypeAttribute(DashStyle.$class)]
          },
          get: function () {
            return DashStyle.DASH
          }
        },

        DASH_DOT: {
          $meta: function () {
            return [TypeAttribute(DashStyle.$class)]
          },
          get: function () {
            return DashStyle.DASH_DOT
          }
        },

        DASH_DOT_DOT: {
          $meta: function () {
            return [TypeAttribute(DashStyle.$class)]
          },
          get: function () {
            return DashStyle.DASH_DOT_DOT
          }
        },

        DOT: {
          $meta: function () {
            return [TypeAttribute(DashStyle.$class)]
          },
          get: function () {
            return DashStyle.DOT
          }
        },

        SOLID: {
          $meta: function () {
            return [TypeAttribute(DashStyle.$class)]
          },
          get: function () {
            return DashStyle.SOLID
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.GradientSpreadMethod = new EnumDefinition(function () {
    return {
      PAD: 0,
      REFLECT: 1,
      REPEAT: 2
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.FontStyle = new EnumDefinition(function () {
    return {
      NORMAL: 0,
      ITALIC: 1,
      OBLIQUE: 2,
      INHERIT: 3
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.FontWeight = new EnumDefinition(function () {
    return {
      NORMAL: 0,
      BOLD: 1,
      BOLDER: 2,
      LIGHTER: 3,
      ITEM100: 4,
      ITEM200: 5,
      ITEM300: 6,
      ITEM400: 7,
      ITEM500: 8,
      ITEM600: 9,
      ITEM700: 10,
      ITEM800: 11,
      ITEM900: 12,
      INHERIT: 13
    }
  })
})
yfiles.lang.module('compat.graphml.wpfbridge', function (exports) {
  exports.TextDecoration = new EnumDefinition(function () {
    return {
      $flags: true,
      NONE: 0,
      UNDERLINE: 1,
      OVERLINE: 2,
      LINE_THROUGH: 4,
      BLINK: 8
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SandwichParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initSandwichParameterExtension()
        this.$position = ExteriorLabelModelPosition.NORTH
      },

      $position: null,

      position: {
        $meta: function () {
          return [TypeAttribute(ExteriorLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*yfiles.graph.ExteriorLabelModel.ExteriorLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.SandwichParameterExtension*/
          newInstance = new yfiles.graphml.SandwichParameterExtension()
        {
          newInstance.position = this.$position
          newInstance.model = this.$model
        }
        var /*yfiles.graphml.SandwichParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initSandwichParameterExtension: function () {
        this.$position = ExteriorLabelModelPosition.NORTH
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SandwichLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$yOffset = 0
      },

      $yOffset: 0,

      yOffset: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$yOffset
        },
        set: function (/*number*/ value) {
          this.$yOffset = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.SandwichLabelModel*/ newInstance = new SandwichLabelModel()
        {
          newInstance.yOffset = this.$yOffset
        }
        return newInstance
      },

      $static: {
        NORTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return SandwichLabelModel.NORTH
          }
        },

        SOUTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return SandwichLabelModel.SOUTH
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StripeLabelModelPosition = new EnumDefinition(function () {
    return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatingEdgeLabelModel = new ClassDefinition(function () {
    return {
      $with: [ILabelModel, ILabelModelParameterProvider],

      constructor: function () {
        this.$edgeRelativeDistance = true
      },

      $distance: 0,

      distance: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$distance
        },
        set: function (/*number*/ value) {
          this.$distance = value
        }
      },

      $edgeRelativeDistance: false,

      edgeRelativeDistance: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$edgeRelativeDistance
        },
        set: function (/*boolean*/ value) {
          this.$edgeRelativeDistance = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      lookup: function (/*yfiles.lang.Class*/ type) {
        if (type === ILabelModelParameterProvider.$class) {
          return this
        }
        if (type === ILabelModelParameterFinder.$class) {
          return DefaultLabelModelParameterFinder.INSTANCE
        }
        return null
      },

      getContext: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        return yfiles.graph.Lookups.EMPTY
      },

      getParameters: function (/*yfiles.graph.ILabel*/ label, /*yfiles.graph.ILabelModel*/ model) {
        var /*compat.graphml.xaml.RotatingEdgeLabelModel*/
          rotatingEdgeLabelModel = /*(compat.graphml.xaml.RotatingEdgeLabelModel)*/ model
        var /*yfiles.collections.List<yfiles.graph.ILabelModelParameter>*/ candidates = new List()
        for (var /*number*/ i = 0; i <= 10; i++) {
          candidates.add(
            new compat.graphml.xaml.RotatingEdgeLabelModel.RatioParameter(
              rotatingEdgeLabelModel,
              i * 0.1
            )
          )
        }
        return candidates
      },

      getGeometry: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        var /*yfiles.geometry.OrientedRectangle*/ rect = new OrientedRectangle(0, 0, 10, 10, 0, -1)
        /*(compat.graphml.xaml.RotatingEdgeLabelModel.RatioParameter)*/
        parameter.$setGeometry(this, label, rect)
        return rect
      },

      createDefaultParameter: function () {
        return this.createRatio(0.5)
      },

      createRatio: function (/*number*/ ratio) {
        return new compat.graphml.xaml.RotatingEdgeLabelModel.RatioParameter(this, ratio)
      },

      $static: {
        RatioParameter: new ClassDefinition(function () {
          return {
            $with: [ILabelModelParameter, IMarkupExtensionConverter],

            constructor: function (
              /*compat.graphml.xaml.RotatingEdgeLabelModel*/ model,
              /*number*/ r
            ) {
              this.$ratio = r
              this.$model = model
            },

            $ratio: 0,

            $model: null,

            supports: function (/*yfiles.graph.ILabel*/ label) {
              return IEdge.isInstance(label.owner)
            },

            clone: function () {
              return this
            },

            model: {
              get: function () {
                return this.$model
              }
            },

            $setGeometry: function (
              /*compat.graphml.xaml.RotatingEdgeLabelModel*/ model,
              /*yfiles.graph.ILabel*/ label,
              /*yfiles.geometry.IMutableOrientedRectangle*/ rect
            ) {
              var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner
              var /*yfiles.lang.Reference*/ upX = {}
              var /*yfiles.lang.Reference*/ upY = {}
              var /*yfiles.lang.Reference*/ cx = {}
              var /*yfiles.lang.Reference*/ cy = {}
              if (edge !== null && this.$findAnchorTangent(edge, upX, upY, cx, cy)) {
                var /*number*/ newAngle = Math.atan2(upX.value, -upY.value) + model.$angle

                var /*number*/ distance = model.$distance
                if (distance !== 0) {
                  var /*number*/ l = Math.sqrt(upX.value * upX.value + upY.value * upY.value)
                  if (l > 0) {
                    upX.value /= l
                    upY.value /= l

                    if (!model.$edgeRelativeDistance && upY.value > 0) {
                      distance = -distance
                    }

                    cx.value += upX.value * distance
                    cy.value += upY.value * distance
                  }
                }

                var /*number*/ sin = Math.sin(newAngle)
                var /*number*/ cos = -Math.cos(newAngle)
                rect.setUpVector(sin, cos)

                var /*number*/ w = label.preferredSize.width
                var /*number*/ h = label.preferredSize.height
                rect.width = w
                rect.height = h
                rect.setCenter(new Point(cx.value, cy.value))
              } else {
                rect.width = -1
                rect.height = -1
              }
            },

            $findAnchorTangent: function (
              /*yfiles.graph.IEdge*/ edge,
              /*yfiles.lang.Reference*/ upX,
              /*yfiles.lang.Reference*/ upY,
              /*yfiles.lang.Reference*/ cx,
              /*yfiles.lang.Reference*/ cy
            ) {
              var /*yfiles.styles.IEdgeStyle*/ style = edge.style
              if (style !== null) {
                var /*yfiles.styles.IEdgeStyleRenderer*/ renderer = style.renderer
                var /*yfiles.styles.IPathGeometry*/ geometry = renderer.getPathGeometry(edge, style)
                if (geometry !== null) {
                  var /*yfiles.geometry.Tangent*/ t = geometry.getTangent(this.$ratio)
                  if (t !== null) {
                    var /*yfiles.geometry.Tangent*/ tangent = t
                    upX.value = -tangent.vector.y
                    upY.value = tangent.vector.x
                    cx.value = tangent.point.x
                    cy.value = tangent.point.y
                    return true
                  }
                }
              }

              var /*number*/ l = 0

              var /*yfiles.geometry.Point*/ spl = edge.sourcePort.location
              var /*number*/ x1 = spl.x
              var /*number*/ y1 = spl.y

              var /*yfiles.geometry.Point*/ tpl = edge.targetPort.location
              var /*number*/ x2 = tpl.x
              var /*number*/ y2 = tpl.y

              {
                var /*number*/ lx = x1
                var /*number*/ ly = y1

                var /*yfiles.collections.IListEnumerable<yfiles.graph.IBend>*/ bends = edge.bends
                for (var /*number*/ i = 0; i < bends.size; i++) {
                  var /*yfiles.graph.IBend*/ bend = bends.get(i)
                  var /*number*/ bx = bend.location.x
                  var /*number*/ by = bend.location.y
                  var /*number*/ dx = bx - lx
                  var /*number*/ dy = by - ly

                  l += Math.sqrt(dx * dx + dy * dy)
                  lx = bx
                  ly = by
                }

                {
                  var /*number*/ dx = x2 - lx
                  var /*number*/ dy = y2 - ly

                  l += Math.sqrt(dx * dx + dy * dy)
                }
              }
              var /*number*/ tl = this.$ratio * l

              if (l === 0) {
                // no length, no path, no label
                upX.value = 0
                upY.value = -1
                cx.value = x1
                cy.value = y1
                return false
              }

              l = 0

              {
                var /*number*/ lx = x1
                var /*number*/ ly = y1

                var /*yfiles.collections.IListEnumerable<yfiles.graph.IBend>*/ bends = edge.bends
                for (var /*number*/ i = 0; i < bends.size; i++) {
                  var /*yfiles.graph.IBend*/ bend = bends.get(i)
                  var /*number*/ bx = bend.location.x
                  var /*number*/ by = bend.location.y
                  var /*number*/ dx = bx - lx
                  var /*number*/ dy = by - ly

                  var /*number*/ sl = Math.sqrt(dx * dx + dy * dy)
                  if (sl > 0 && l + sl >= tl) {
                    tl -= l
                    cx.value = lx + (tl * dx) / sl
                    cy.value = ly + (tl * dy) / sl
                    upX.value = -dy
                    upY.value = dx
                    return true
                  }
                  l += sl
                  lx = bx
                  ly = by
                }

                {
                  var /*number*/ dx = x2 - lx
                  var /*number*/ dy = y2 - ly

                  var /*number*/ sl = Math.sqrt(dx * dx + dy * dy)
                  if (sl > 0) {
                    tl -= l
                    cx.value = lx + (tl * dx) / sl
                    cy.value = ly + (tl * dy) / sl
                    upX.value = -dy
                    upY.value = dx
                    return true
                  } else {
                    upX.value = 0
                    upY.value = -1
                    cx.value = x1
                    cy.value = y1
                    return false
                  }
                }
              }
            },

            canConvert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              return true
            },

            convert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              var /*compat.graphml.xaml.RotatingEdgeLabelModelParameterExtension*/
                newInstance = new compat.graphml.xaml.RotatingEdgeLabelModelParameterExtension()
              {
                newInstance.ratio = this.$ratio
                newInstance.model = this.$model
              }
              return newInstance
            }
          }
        })
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatingEdgeLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$ratio = 0.5
      },

      $ratio: 0,

      ratio: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.5 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$ratio
        },
        set: function (/*number*/ value) {
          this.$ratio = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ defaultValue: null }),
            TypeAttribute(ILabelModel.$class)
          ]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*compat.graphml.xaml.RotatingEdgeLabelModel*/
          exModel = /*(compat.graphml.xaml.RotatingEdgeLabelModel)*/ this.$model
        return exModel.createRatio(this.$ratio)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatedSliderEdgeLabelModel = new ClassDefinition(function () {
    return {
      $with: [ILabelModel, ILabelModelParameterProvider, ILabelModelParameterFinder],

      constructor: {
        RotatedSliderEdgeLabelModel: function () {
          compat.graphml.xaml.RotatedSliderEdgeLabelModel.FromDistanceAngleDistanceRelativeToEdgeAndAutoRotationEnabled.call(
            this,
            0,
            0,
            true,
            true
          )
        },

        FromDistanceAngleDistanceRelativeToEdgeAndAutoRotationEnabled: function (
          /*number*/ distance,
          /*number*/ angle,
          /*boolean*/ distanceRelativeToEdge,
          /*boolean*/ autoRotationEnabled
        ) {
          this.$distance = distance
          this.$distanceRelativeToEdge = distanceRelativeToEdge
          this.$angle = angle
          this.$autoRotationEnabled = autoRotationEnabled
          this.$defaultParameter = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
            this,
            0,
            0.0
          )
        }
      },

      $defaultParameter: null,

      $distanceRelativeToEdge: false,

      distanceRelativeToEdge: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$distanceRelativeToEdge
        },
        set: function (/*boolean*/ value) {
          this.$distanceRelativeToEdge = value
        }
      },

      $distance: 0,

      distance: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$distance
        },
        set: function (/*number*/ value) {
          this.$distance = value
        }
      },

      $autoRotationEnabled: true,

      autoRotationEnabled: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoRotationEnabled
        },
        set: function (/*boolean*/ value) {
          this.$autoRotationEnabled = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      lookup: function (/*yfiles.lang.Class*/ type) {
        if (type === ILabelModelParameterProvider.$class) {
          return this
        }
        if (type === ILabelModelParameterFinder.$class) {
          return this
        }
        return null
      },

      createDefaultParameter: function () {
        return this.$defaultParameter
      },

      getGeometry: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter*/ rsp =
            parameter instanceof
            compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter
              ? /*(compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter)*/ parameter
              : /*(compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter)*/ this.createDefaultParameter()
        var /*number*/ segmentNo = rsp.$segment
        var /*number*/ ratio = rsp.$ratio
        var /*yfiles.geometry.OrientedRectangle*/ bounds = new OrientedRectangle(
            0,
            0,
            label.preferredSize.width,
            label.preferredSize.height,
            0,
            -1
          )
        bounds.angle = this.$angle

        var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner
        var /*yfiles.graph.IPortOwner*/ tmp
        var /*yfiles.graph.INode*/ sourceNode = INode.isInstance((tmp = edge.sourcePort.owner))
            ? /*(yfiles.graph.INode)*/ tmp
            : null
        var /*yfiles.graph.IPortOwner*/ tmp2
        var /*yfiles.graph.INode*/ targetNode = INode.isInstance((tmp2 = edge.targetPort.owner))
            ? /*(yfiles.graph.INode)*/ tmp2
            : null
        if (sourceNode === null || targetNode === null) {
          throw new Exception('Source or target node is null!', 'null')
        }
        var /*yfiles.geometry.Rect*/ sourceNodeLayout = sourceNode.layout.toRect()
        var /*yfiles.geometry.Rect*/ targetNodeLayout = targetNode.layout.toRect()

        // get edge path
        var /*yfiles.geometry.GeneralPath*/ generalPath = edge.style.renderer
            .getPathGeometry(edge, edge.style)
            .getPath()
        var /*yfiles.geometry.Point[]*/ path = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getPathPoints(
            generalPath
          )
        // check path
        if (
          path.length < 2 ||
          (path.length === 2 &&
            path[0].distanceTo(path[path.length - 1]) <
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS)
        ) {
          if (path.length < 2) {
            var /*yfiles.geometry.Rect*/ bBox = bounds.bounds
            bounds.setCenter(
              new Point(
                sourceNodeLayout.x + bBox.width * 0.5,
                sourceNodeLayout.y + bBox.height * 0.5
              )
            )
          } else {
            bounds.setCenter(path[0])
          }
          return bounds
        }
        // get interesting line segment
        var /*number*/ index = segmentNo < 0 ? path.length - 1 + segmentNo : segmentNo
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          segment = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getLineSegment(path, index)

        if (segment === null) {
          var /*yfiles.geometry.Rect*/ bBox = bounds.bounds
          bounds.setCenter(
            new Point(sourceNodeLayout.x + bBox.width * 0.5, sourceNodeLayout.y + bBox.height * 0.5)
          )
          return bounds
        }
        var /*yfiles.geometry.Point*/ p1 = segment.$firstEndPoint
        var /*yfiles.geometry.Point*/ p2 = segment.$secondEndPoint
        if (segment.$getLength() === 0) {
          // something bad happened, try to fix it!
          var /*yfiles.geometry.Point*/ spl = edge.sourcePort.location
          var /*yfiles.geometry.Point*/ tpl = edge.targetPort.location
          var /*number*/ dx =
              sourceNodeLayout.x +
              sourceNodeLayout.width * 0.5 +
              spl.x -
              (targetNodeLayout.x + targetNodeLayout.width * 0.5 + tpl.x)
          var /*number*/ dy =
              sourceNodeLayout.y +
              sourceNodeLayout.height * 0.5 +
              spl.y -
              (targetNodeLayout.y + targetNodeLayout.height * 0.5 + tpl.y)
          if (dx === 0 && dy === 0) {
            // something even worse happened, try to fix it!
            p2 = new Point(
              p1.x + compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS_SEGMENT_END,
              p1.y
            )
          } else {
            var /*number*/ dl = Math.sqrt(dx * dx + dy * dy)
            segment.$secondEndPoint = p2 = new Point(
              p1.x + (compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS_SEGMENT_END * dx) / dl,
              p1.y + (compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS_SEGMENT_END * dy) / dl
            )
          }
        }
        // determine rotation angle
        if (this.$autoRotationEnabled) {
          bounds.angle = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calculateRotationAngle(
            segment.$toVector(),
            this.$angle
          )
        }

        var /*boolean*/ absolutePlacement = 0 > ratio || ratio > 1

        // get oriented box representing candidate at ratio 0
        var /*yfiles.geometry.OrientedRectangle*/ boundsR0 = new OrientedRectangle(bounds)
        this.$placeAtPoint(boundsR0, segment, p1, this.$distance)
        if (
          index === 0 &&
          compat.graphml.xaml.RotatedSliderEdgeLabelModel.doIntersect(sourceNodeLayout, boundsR0)
        ) {
          // placement depends on source node
          this.$placeAtSource(boundsR0, segment, sourceNodeLayout, this.$distance)
        }
        // get oriented box representing candidate at ratio 1
        var /*yfiles.geometry.OrientedRectangle*/ boundsR1 = new OrientedRectangle(bounds)
        this.$placeAtPoint(boundsR1, segment, p2, this.$distance)
        if (
          index >= path.length - 2 &&
          compat.graphml.xaml.RotatedSliderEdgeLabelModel.doIntersect(targetNodeLayout, boundsR1)
        ) {
          // placement depends on target node
          this.$placeAtTarget(boundsR1, segment, targetNodeLayout, this.$distance)
        }
        // get oriented box representing candidate at ratio "ratio"
        var /*yfiles.geometry.Point*/ anchor
        if (absolutePlacement) {
          // not between 0 and 1: absolute length
          var /*number*/ ddx = boundsR1.anchorX - boundsR0.anchorX
          var /*number*/ ddy = boundsR1.anchorY - boundsR0.anchorY
          var /*number*/ segLength = Math.sqrt(ddx * ddx + ddy * ddy)
          if (segLength < 1) {
            var /*yfiles.geometry.Point*/ vec = segment.$toVector()
            ddx = vec.x
            ddy = vec.y
            segLength = Math.sqrt(ddx * ddx + ddy * ddy)
          }
          var /*number*/ x, y
          if (ratio < 0) {
            var /*number*/ normalizedRatio = segLength !== 0 ? ratio / segLength : 0
            x = boundsR0.anchorX + normalizedRatio * ddx
            y = boundsR0.anchorY + normalizedRatio * ddy
          } else {
            var /*number*/ normalizedRatio = segLength !== 0 ? (ratio - 1) / segLength : 0
            x = boundsR1.anchorX + normalizedRatio * ddx
            y = boundsR1.anchorY + normalizedRatio * ddy
          }
          anchor = new Point(x, y)
        } else {
          anchor = new Point(
            boundsR0.anchorX * (1 - ratio) + boundsR1.anchorX * ratio,
            boundsR0.anchorY * (1 - ratio) + boundsR1.anchorY * ratio
          )
        }
        bounds.anchor = anchor
        return bounds
      },

      getParameters: function (/*yfiles.graph.ILabel*/ label, /*yfiles.graph.ILabelModel*/ model) {
        var /*yfiles.collections.List<yfiles.graph.ILabelModelParameter>*/ candList = new List()
        var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner
        var /*yfiles.geometry.Rect*/
          sourceNodeLayout = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getNodeLayout(
            edge.sourcePort
          )
        var /*yfiles.geometry.Rect*/
          targetNodeLayout = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getNodeLayout(
            edge.targetPort
          )

        // get edge path
        var /*yfiles.geometry.GeneralPath*/ generalPath = edge.style.renderer
            .getPathGeometry(edge, edge.style)
            .getPath()
        // get array of path points
        var /*yfiles.geometry.Point[]*/ path = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getPathPoints(
            generalPath
          )

        // if something is wrong with the path generate one trivial position)
        if (
          path.length < 2 ||
          (path.length === 2 &&
            path[0].distanceTo(path[1]) < compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS)
        ) {
          candList.add(this.createDefaultParameter())
          return candList
        }

        var /*yfiles.geometry.OrientedRectangle*/ boundsR0 = new OrientedRectangle(
            0,
            0,
            0,
            0,
            0,
            -1
          )
        var /*yfiles.geometry.OrientedRectangle*/ boundsR1 = new OrientedRectangle(
            0,
            0,
            0,
            0,
            0,
            -1
          )

        // iterate over all edge segments
        for (var /*number*/ i = 0; i < path.length - 1; i++) {
          var /*yfiles.geometry.Point*/ p1 = path[i]
          var /*yfiles.geometry.Point*/ p2 = path[i + 1]
          this.setFirstAndLastBoxOnSegment(
            p1,
            p2,
            i === 0,
            i === path.length - 2,
            label,
            sourceNodeLayout,
            targetNodeLayout,
            boundsR0,
            boundsR1
          )

          // determine rotation angle
          var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
            segment = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(p1, p2)
          var /*number*/ segmentId = i > (((path.length - 2) / 2) | 0) ? i + 1 - path.length : i
          var /*boolean*/ isSingleSegment = path.length === 2

          var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter*/
            paramR0 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
              this,
              segmentId,
              0
            )
          candList.add(paramR0)

          var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter*/ paramR1
          // in case of edges with only one segment, treat second parameter as 'from target'
          if (isSingleSegment) {
            paramR1 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
              this,
              -1,
              1
            )
          } else {
            paramR1 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
              this,
              segmentId,
              1
            )
          }
          candList.add(paramR1)
          this.$addIntermediateCandidates(
            candList,
            boundsR0,
            boundsR1,
            segment,
            segmentId,
            isSingleSegment
          )
        }

        return candList
      },

      getContext: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        return yfiles.graph.Lookups.EMPTY
      },

      $placeAtPoint: function (
        /*yfiles.geometry.OrientedRectangle*/ rect,
        /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ segment,
        /*yfiles.geometry.Point*/ p,
        /*number*/ dist
      ) {
        var /*yfiles.geometry.Point*/ segmentVector = segment.$toVector()
        if (this.$isSideSliderModel() === false) {
          rect.setCenter(new Point(p.x, p.y))
        } else {
          // calc offset vector
          var /*yfiles.geometry.Point*/ offsetVec = compat.graphml.xaml.RotatedSliderEdgeLabelModel.orthoNormal(
              segmentVector
            )
          if (this.$distanceRelativeToEdge) {
            if (compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist)) {
              offsetVec = new Point(-offsetVec.x, -offsetVec.y)
            }
          } else {
            var /*number*/ offsetAngle = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calculateAngle(
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.ZERO_VECTOR,
                offsetVec
              )
            if (offsetAngle === 2 * Math.PI) {
              offsetAngle = 0
            }
            if (
              (offsetAngle >= Math.PI &&
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist)) ||
              (offsetAngle < Math.PI &&
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist))
            ) {
              offsetVec = new Point(-offsetVec.x, -offsetVec.y)
            }
          }
          // calculate initial position
          offsetVec = offsetVec.multiply(Math.abs(dist) + rect.width + rect.height)
          var /*yfiles.geometry.Point*/ rectCenter = p.add(offsetVec)
          rect.setCenter(new Point(rectCenter.x, rectCenter.y))
          // calc distance to segment
          var /*yfiles.geometry.Point[]*/ corners = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(
              rect
            )
          var /*number*/ minDist = Number.MAX_VALUE
          for (var /*number*/ i = 0; i < corners.length; i++) {
            minDist = Math.min(
              minDist,
              this.$distanceToLine(corners[i], segment.$firstEndPoint, segment.$secondEndPoint)
            )
          }
          // adjust distance to node
          var /*yfiles.geometry.Point*/ corrVec = new Point(-offsetVec.x, -offsetVec.y).normalized
          corrVec = corrVec.multiply(minDist - Math.abs(dist))
          rectCenter = rectCenter.add(corrVec)
          rect.setCenter(new Point(rectCenter.x, rectCenter.y))
        }
      },

      $distanceToLine: function (
        /*yfiles.geometry.Point*/ p,
        /*yfiles.geometry.Point*/ l1,
        /*yfiles.geometry.Point*/ l2
      ) {
        var /*number*/ dx = l2.x - l1.x
        var /*number*/ dy = l2.y - l1.y

        var /*number*/ tdx = p.x - l1.x
        var /*number*/ tdy = p.y - l1.y

        // calc projection length
        var /*number*/ tmp = tdx * dx + tdy * dy
        var /*number*/ squaredProjLength = (tmp * tmp) / (dx * dx + dy * dy)
        var /*number*/ squaredLength = tdx * tdx + tdy * tdy - squaredProjLength
        return squaredLength < 0 ? 0 : Math.sqrt(squaredLength)
      },

      $placeAtTarget: function (
        /*yfiles.geometry.OrientedRectangle*/ rect,
        /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ segment,
        /*yfiles.geometry.IRectangle*/ nodeLayout,
        /*number*/ dist
      ) {
        this.$placeAtEndpoint(
          rect,
          segment.$secondEndPoint,
          segment.$firstEndPoint,
          nodeLayout,
          false,
          dist
        )
      },

      $placeAtSource: function (
        /*yfiles.geometry.OrientedRectangle*/ rect,
        /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ segment,
        /*yfiles.geometry.IRectangle*/ nodeLayout,
        /*number*/ dist
      ) {
        this.$placeAtEndpoint(
          rect,
          segment.$firstEndPoint,
          segment.$secondEndPoint,
          nodeLayout,
          true,
          dist
        )
      },

      $placeAtEndpoint: function (
        /*yfiles.geometry.OrientedRectangle*/ bounds,
        /*yfiles.geometry.Point*/ p1,
        /*yfiles.geometry.Point*/ p2,
        /*yfiles.geometry.IRectangle*/ nodeLayout,
        /*boolean*/ atSource,
        /*number*/ dist
      ) {
        var /*yfiles.geometry.Rect*/ nodeBox = nodeLayout.toRect()
        // the bounds of the endpoint
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          lineSegment = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(p1, p2)
        var /*number*/ side = compat.graphml.xaml.RotatedSliderEdgeLabelModel.determineNodeSide(
            p1,
            p2
          )
        // the side where to place the label
        var /*yfiles.geometry.Point*/ anchor = this.$placeOnSide(
            side,
            lineSegment,
            bounds,
            nodeBox,
            atSource,
            dist
          )
        bounds.anchor = anchor
        var /*number*/ distToNode = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getDistance(
            nodeBox,
            bounds
          )
        // distance is used to determine the quality of the label position
        var /*yfiles.geometry.Rect*/ rectBox = bounds.bounds
        var /*boolean*/ tryAlternative =
            (distToNode <
              0.5 * compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE ||
              distToNode >
                1.2 * compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE) &&
            // label is not good (too close or too far)
            (((side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_TOP ||
              side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_BOTTOM) &&
              Math.abs(p1.x - p2.x) > compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS &&
              // edge ends above or below
              (p2.x <
                nodeBox.x -
                  compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE -
                  rectBox.width * 0.5 || // edge ends to the left
                p2.x >
                  nodeBox.x +
                    nodeBox.width +
                    compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE +
                    rectBox.width * 0.5)) ||
              // or to the right
              ((side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_LEFT ||
                side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_RIGHT) &&
                Math.abs(p1.y - p2.y) > compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS &&
                // at the sides
                (p2.y <
                  nodeBox.y -
                    compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE -
                    rectBox.height * 0.5 || // above
                  p2.y >
                    nodeBox.y +
                      nodeBox.height +
                      compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE +
                      rectBox.height * 0.5)))
        // below
        // enough place for the alternative candidate?
        if (tryAlternative) {
          // try to place label at another side
          var /*number*/
            alternativeSide = compat.graphml.xaml.RotatedSliderEdgeLabelModel.determineAlternativeNodeSide(
              p1,
              p2
            )
          var /*yfiles.geometry.Point*/ anchorAlternative = this.$placeOnSide(
              alternativeSide,
              lineSegment,
              bounds,
              nodeBox,
              atSource,
              dist
            )
          bounds.anchor = anchorAlternative // try alternative
          var /*number*/ distToNodeAlternative = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getDistance(
              nodeBox,
              bounds
            ) // measure alternative
          // see if the situation got worse
          if (
            distToNodeAlternative <
              0.5 * compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE ||
            // if the alternative is closer than a min distance, discard it
            (distToNodeAlternative > distToNode &&
              distToNode >
                0.5 * compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE)
          ) {
            // or the first was too far away, and the alternative is even farther away
            // => distToNode > 1.2 * LabelNodeDistance
            bounds.anchor = anchor // reset to previous (non-alternative)
          }
        }
      },

      $addIntermediateCandidates: function (
        /*yfiles.collections.List<yfiles.graph.ILabelModelParameter>*/ candList,
        /*yfiles.geometry.OrientedRectangle*/ boundsR0,
        /*yfiles.geometry.OrientedRectangle*/ boundsR1,
        /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ edgeSegment,
        /*number*/ segmentId,
        /*boolean*/ singleSegment
      ) {
        // determine the two segments of boundsR0 that are adjacent to the given edge segment
        var /*yfiles.geometry.Point[]*/ boundsR0Corner = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(
            boundsR0
          )
        var /*number*/ closestPointR0Index = edgeSegment.$getClosestPointIndex(boundsR0Corner)
        var /*yfiles.geometry.Point*/ otherPoint1 =
            closestPointR0Index > 0 ? boundsR0Corner[closestPointR0Index - 1] : boundsR0Corner[3]
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          boundsR0Segment1 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Corner[closestPointR0Index],
            otherPoint1
          )
        var /*yfiles.geometry.Point*/ otherPoint2 =
            closestPointR0Index < 3 ? boundsR0Corner[closestPointR0Index + 1] : boundsR0Corner[0]
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          boundsR0Segment2 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Corner[closestPointR0Index],
            otherPoint2
          )

        // check on which of both segments of boundsR0 (boundsR1) adjacent to the edge segment consecutive
        // candidates touch each other
        var /*yfiles.geometry.Point[]*/ boundsR1Corner = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(
            boundsR1
          )

        var /*yfiles.geometry.Point*/ vectorSegment1 = boundsR0Segment1.$toVector()
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          segment1R0 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Corner[closestPointR0Index],
            Point.add(boundsR0Corner[closestPointR0Index], vectorSegment1)
          )
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          segment1R1 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR1Corner[closestPointR0Index],
            boundsR1Corner[closestPointR0Index].add(vectorSegment1)
          )
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          orthogonalToSegment1 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Corner[closestPointR0Index],
            boundsR0Corner[closestPointR0Index].add(
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.orthoNormal(vectorSegment1)
            )
          )
        var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ segment1R0Crossing = {}
        compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection(
          segment1R0,
          orthogonalToSegment1,
          segment1R0Crossing
        )
        var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ segment1R1Crossing = {}
        compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection(
          segment1R1,
          orthogonalToSegment1,
          segment1R1Crossing
        )
        var /*number*/ distSegment1 = segment1R0Crossing.value.distanceTo(segment1R1Crossing.value)
        var /*number*/ intermediateCandidatesCountSegment1 =
            Math.floor(
              (distSegment1 - boundsR0Segment2.$getLength()) / boundsR0Segment2.$getLength()
            ) | 0

        var /*yfiles.geometry.Point*/ vectorSegment2 = boundsR0Segment2.$toVector()
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          segment2R0 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Corner[closestPointR0Index],
            boundsR0Corner[closestPointR0Index].add(vectorSegment2)
          )
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          segment2R1 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR1Corner[closestPointR0Index],
            boundsR1Corner[closestPointR0Index].add(vectorSegment2)
          )
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          orthogonalToSegment2 = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Corner[closestPointR0Index],
            boundsR0Corner[closestPointR0Index].add(
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.orthoNormal(vectorSegment2)
            )
          )
        var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ segment2R0Crossing = {}
        compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection(
          segment2R0,
          orthogonalToSegment2,
          segment2R0Crossing
        )
        var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ segment2R1Crossing = {}
        compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection(
          segment2R1,
          orthogonalToSegment2,
          segment2R1Crossing
        )
        var /*number*/ distSegment2 = segment2R0Crossing.value.distanceTo(segment2R1Crossing.value)

        var /*number*/ intermediateCandidatesCountSegment2 =
            Math.floor(
              (distSegment2 - boundsR0Segment1.$getLength()) / boundsR0Segment1.$getLength()
            ) | 0
        var /*boolean*/ useFirstSegment =
            intermediateCandidatesCountSegment1 >= intermediateCandidatesCountSegment2
        var /*number*/ dist = useFirstSegment ? distSegment1 : distSegment2

        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ segment = useFirstSegment
            ? boundsR0Segment1
            : boundsR0Segment2
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ otherSegment = useFirstSegment
            ? boundsR0Segment2
            : boundsR0Segment1

        var /*number*/ intermediateCandidatesCount = useFirstSegment
            ? intermediateCandidatesCountSegment1
            : intermediateCandidatesCountSegment2
        // distance between two adjacent candidates
        var /*number*/ candidateDist =
            (dist - (intermediateCandidatesCount + 1) * otherSegment.$getLength()) /
            (intermediateCandidatesCount + 1)
        // calculate offset vector (we obtain the anchor of a candidate by adding this vector to the anchor of the
        // previous candidate)
        var /*yfiles.geometry.Point*/ offsetVec = edgeSegment.$toVector().normalized
        // points to the location of the next candidate (next with respect to the vector's direction)
        var /*yfiles.geometry.Point*/ otherSegmentVec = otherSegment.$toVector().normalized
        otherSegmentVec = otherSegmentVec.multiply(candidateDist + otherSegment.$getLength())
        var /*yfiles.geometry.Point*/ boundsR0Anchor = boundsR0.anchor.toPoint()
        var /*yfiles.geometry.Point*/ tmpLocation = boundsR0Anchor.add(otherSegmentVec)
        // we have to project this location on the line which is parallel to the edge segment and contains the
        // anchor point of boundsR0
        var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ nextAnchor = {}
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          projLine = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            boundsR0Anchor,
            boundsR0Anchor.add(edgeSegment.$toVector())
          )
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          orthoTmpLocationLine = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
            tmpLocation,
            tmpLocation.add(segment.$toVector())
          )
        var /*boolean*/ nextAnchorFound = compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection(
            orthoTmpLocationLine,
            projLine,
            nextAnchor
          )
        if (!nextAnchorFound) {
          nextAnchor.value = tmpLocation
        }
        offsetVec = offsetVec.multiply(boundsR0Anchor.distanceTo(nextAnchor.value))
        // now, we can place the intermediate candidates
        var /*yfiles.geometry.Point*/ lastAnchor = boundsR0Anchor
        var /*number*/ boundsR0R1Dist = boundsR0.anchor.distanceTo(boundsR1.anchor)
        for (var /*number*/ i = 0; i < intermediateCandidatesCount; i++) {
          var /*yfiles.geometry.OrientedRectangle*/ bounds = new OrientedRectangle(boundsR0)
          var /*yfiles.geometry.Point*/ anchor = lastAnchor.add(offsetVec)
          var /*number*/ boundsR0BoundsDist = boundsR0.anchor.distanceTo(anchor)
          bounds.anchor = anchor
          var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter*/ param
          if (singleSegment && i > intermediateCandidatesCount * 0.5) {
            param = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
              this,
              -1,
              boundsR0BoundsDist / boundsR0R1Dist
            )
          } else {
            param = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
              this,
              segmentId,
              boundsR0BoundsDist / boundsR0R1Dist
            )
          }
          candList.add(param)
          lastAnchor = anchor
        }
      },

      $placeOnSide: function (
        /*number*/ side,
        /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ lineSegment,
        /*yfiles.geometry.OrientedRectangle*/ rectOrig,
        /*yfiles.geometry.Rect*/ nodeLayout,
        /*boolean*/ atSource,
        /*number*/ dist
      ) {
        var /*boolean*/ isCenterSlider = !this.$isSideSliderModel()
        var /*yfiles.geometry.OrientedRectangle*/ rectClone = new OrientedRectangle(rectOrig)
        var /*yfiles.geometry.Point*/ p1 = lineSegment.$firstEndPoint
        var /*yfiles.geometry.Point*/ p2 = lineSegment.$secondEndPoint
        var /*yfiles.geometry.Point*/ lineSegmentVector = lineSegment.$toVector()
        var /*number*/ segmentAngle = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calculateAngle(
            lineSegmentVector,
            compat.graphml.xaml.RotatedSliderEdgeLabelModel.ZERO_VECTOR
          )
        var /*yfiles.geometry.Rect*/ bBox = rectClone.bounds
        if (side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_TOP) {
          var /*boolean*/ leftOfEdge
          // whether the label should be placed to the left of the edge segment (in geometric sense)
          if (this.$distanceRelativeToEdge) {
            leftOfEdge =
              (atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist)) ||
              (!atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist))
          } else {
            // if true, place label to the left of segment p1, p2
            leftOfEdge =
              (compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist) &&
                segmentAngle <= Math.PI * 0.5) ||
              (compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist) &&
                segmentAngle > Math.PI * 0.5)
          }
          var /*number*/ desiredCenterY =
              nodeLayout.y -
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE -
              bBox.height * 0.5
          if (desiredCenterY < p2.y) {
            desiredCenterY = p2.y
          }
          // candidate should be placed near the segment
          var /*number*/ initialXPos = leftOfEdge
              ? Math.min(p1.x, p2.x) - bBox.width
              : Math.max(p1.x, p2.x) + bBox.width
          rectClone.setCenter(new Point(initialXPos, desiredCenterY))
          // initial placement of rect
          // calc placement
          var /*yfiles.geometry.Point*/ closestPoint = isCenterSlider
              ? rectClone.orientedRectangleCenter
              : lineSegment.$getClosestPoint(
                  compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(rectClone)
                )
          var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ intersectionPoint = {}
          compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection1(
            p1,
            p2,
            closestPoint,
            new Point(1, 0),
            intersectionPoint
          )
          rectClone.moveBy(new Point(intersectionPoint.value.x - closestPoint.x, 0))
          if (!isCenterSlider) {
            // include edge to label distance
            var /*number*/ distanceOffset = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calcProjDistance(
                lineSegment,
                new Point(1, 0),
                Math.abs(dist)
              )
            if (isFinite(distanceOffset)) {
              if (leftOfEdge) {
                distanceOffset = -distanceOffset
              }
              rectClone.moveBy(new Point(distanceOffset, 0))
            }
          }
        } else {
          if (side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_BOTTOM) {
            var /*boolean*/ leftOfEdge
            // whether the label should be placed to the left of the edge segment (in geometric sense)
            if (this.$distanceRelativeToEdge) {
              leftOfEdge =
                (atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist)) ||
                (!atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist))
            } else {
              // if true, place label to the left of segment p1, p2
              leftOfEdge =
                (compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist) &&
                  segmentAngle <= Math.PI * 1.5) ||
                (compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist) &&
                  segmentAngle > Math.PI * 1.5)
            }
            var /*number*/ desiredCenterY =
                nodeLayout.y +
                nodeLayout.height +
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE +
                bBox.height * 0.5
            if (desiredCenterY > p2.y) {
              desiredCenterY = p2.y
            }
            // candidate should be placed near the segment
            var /*number*/ initialXPos = leftOfEdge
                ? Math.min(p1.x, p2.x) - bBox.width
                : Math.max(p1.x, p2.x) + bBox.width
            rectClone.setCenter(new Point(initialXPos, desiredCenterY))
            // initial placement of rect
            // calc placement
            var /*yfiles.geometry.Point*/ closestPoint = isCenterSlider
                ? rectClone.orientedRectangleCenter
                : lineSegment.$getClosestPoint(
                    compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(rectClone)
                  )
            var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ intersectionPoint = {}
            compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection1(
              p1,
              p2,
              closestPoint,
              new Point(1, 0),
              intersectionPoint
            )
            rectClone.moveBy(new Point(intersectionPoint.value.x - closestPoint.x, 0))
            if (!isCenterSlider) {
              // include edge to label distance
              var /*number*/ distanceOffset = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calcProjDistance(
                  lineSegment,
                  new Point(1, 0),
                  Math.abs(dist)
                )
              if (isFinite(distanceOffset)) {
                if (!leftOfEdge) {
                  distanceOffset = -distanceOffset
                }
                rectClone.moveBy(new Point(distanceOffset, 0))
              }
            }
          } else {
            if (side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_LEFT) {
              var /*boolean*/ belowEdge
              // whether the label should be placed below the edge segment (in geometric sense)
              if (this.$distanceRelativeToEdge) {
                belowEdge =
                  (atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist)) ||
                  (!atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist))
              } else {
                belowEdge = compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist)
              }
              var /*number*/ desiredCenterX =
                  nodeLayout.x -
                  compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE -
                  bBox.width * 0.5
              if (desiredCenterX < p2.x) {
                desiredCenterX = p2.x
              }
              var /*number*/ initialYPos = belowEdge
                  ? Math.max(p1.y, p2.y) + bBox.height
                  : Math.min(p1.y, p2.y) - bBox.height
              rectClone.setCenter(new Point(desiredCenterX, initialYPos))
              // initial placement of rect
              // calc placement
              var /*yfiles.geometry.Point*/ closestPoint = isCenterSlider
                  ? rectClone.orientedRectangleCenter
                  : lineSegment.$getClosestPoint(
                      compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(rectClone)
                    )
              var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ intersectionPoint = {}
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection1(
                p1,
                p2,
                closestPoint,
                new Point(0, 1),
                intersectionPoint
              )
              rectClone.moveBy(new Point(0, intersectionPoint.value.y - closestPoint.y))
              if (!isCenterSlider) {
                // include edge to label distance
                var /*number*/ distanceOffset = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calcProjDistance(
                    lineSegment,
                    new Point(0, 1),
                    Math.abs(dist)
                  )
                if (isFinite(distanceOffset)) {
                  if (belowEdge) {
                    distanceOffset = -distanceOffset
                  }
                  rectClone.moveBy(new Point(0, distanceOffset))
                }
              }
            } else {
              if (side === compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_RIGHT) {
                var /*boolean*/ belowEdge
                // whether the label should be placed below the edge segment (in geometric sense)
                if (this.$distanceRelativeToEdge) {
                  belowEdge =
                    (atSource &&
                      compat.graphml.xaml.RotatedSliderEdgeLabelModel.isPositive(dist)) ||
                    (!atSource && compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist))
                } else {
                  belowEdge = compat.graphml.xaml.RotatedSliderEdgeLabelModel.isNegative(dist)
                }
                var /*number*/ desiredCenterX =
                    nodeLayout.x +
                    nodeLayout.width +
                    compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE +
                    bBox.width * 0.5
                if (desiredCenterX > p2.x) {
                  desiredCenterX = p2.x
                }
                var /*number*/ initialYPos = belowEdge
                    ? Math.max(p1.y, p2.y) + bBox.height
                    : Math.min(p1.y, p2.y) - bBox.height
                rectClone.setCenter(new Point(desiredCenterX, initialYPos))
                // initial placement of rect
                // calc placement
                var /*yfiles.geometry.Point*/ closestPoint = isCenterSlider
                    ? rectClone.orientedRectangleCenter
                    : lineSegment.$getClosestPoint(
                        compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(rectClone)
                      )
                var /*yfiles.lang.Reference<yfiles.geometry.Point>*/ intersectionPoint = {}
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection1(
                  p1,
                  p2,
                  closestPoint,
                  new Point(0, 1),
                  intersectionPoint
                )
                rectClone.moveBy(new Point(0, intersectionPoint.value.y - closestPoint.y))
                if (!isCenterSlider) {
                  // include edge to label distance
                  var /*number*/ distanceOffset = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calcProjDistance(
                      lineSegment,
                      new Point(0, 1),
                      Math.abs(dist)
                    )
                  if (isFinite(distanceOffset)) {
                    if (!belowEdge) {
                      distanceOffset = -distanceOffset
                    }
                    rectClone.moveBy(new Point(0, distanceOffset))
                  }
                }
              }
            }
          }
        }
        // guarantee that the source/target candidates do not pass the center position
        if (
          rectClone.orientedRectangleCenter.distanceTo(p1) >
          rectClone.orientedRectangleCenter.distanceTo(p2)
        ) {
          var /*yfiles.geometry.Point*/ center = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
          if (atSource) {
            this.$placeAtPoint(rectClone, lineSegment, center, dist)
          } else {
            var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
              original = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
                lineSegment.$secondEndPoint,
                lineSegment.$firstEndPoint
              )
            // current segment was reversed
            this.$placeAtPoint(rectClone, original, center, dist)
          }
        }
        return rectClone.anchor.toPoint()
      },

      $isSideSliderModel: function () {
        return this.$distance !== 0
      },

      createParameterFromSource: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
          this,
          segmentIndex,
          segmentRatio
        )
      },

      createParameterFromTarget: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter(
          this,
          -1 - segmentIndex,
          1 - segmentRatio
        )
      },

      findBestParameter: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModel*/ model,
        /*yfiles.geometry.IOrientedRectangle*/ labelLayout
      ) {
        if (!IEdge.isInstance(label.owner)) {
          throw new Exception(
            'RotatedSliderEdgeLabelModel.findBestParameter() can only handle edge labels.',
            'argument'
          )
        }
        if (!(model instanceof compat.graphml.xaml.RotatedSliderEdgeLabelModel)) {
          throw new Exception(
            'RotatedSliderEdgeLabelModel.findBestParameter() can only handle RotatedSliderEdgeLabelModel.',
            'argument'
          )
        }

        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/
          sliderModel = /*(compat.graphml.xaml.RotatedSliderEdgeLabelModel)*/ model

        var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner
        var /*yfiles.geometry.Rect*/
          sourceNodeLayout = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getNodeLayout(
            edge.sourcePort
          )
        var /*yfiles.geometry.Rect*/
          targetNodeLayout = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getNodeLayout(
            edge.targetPort
          )

        // get edge path
        var /*yfiles.geometry.GeneralPath*/ generalPath = edge.style.renderer
            .getPathGeometry(edge, edge.style)
            .getPath()
        // get array of path points
        var /*yfiles.geometry.Point[]*/ path = compat.graphml.xaml.RotatedSliderEdgeLabelModel.getPathPoints(
            generalPath
          )

        // if something is wrong with the path, generate one trivial position
        if (
          path.length < 2 ||
          (path.length === 2 &&
            path[0].distanceTo(path[1]) < compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS)
        ) {
          return sliderModel.createDefaultParameter()
        }

        var /*yfiles.geometry.Point*/ labelCenter = labelLayout.orientedRectangleCenter
        var /*number*/ bestQuality = Number.MAX_VALUE
        var /*number*/ bestRatio = 0.0
        var /*number*/ bestIndex = 0
        var /*yfiles.geometry.OrientedRectangle*/ boundsR0 = new OrientedRectangle(
            0,
            0,
            0,
            0,
            0,
            -1
          )
        var /*yfiles.geometry.OrientedRectangle*/ boundsR1 = new OrientedRectangle(
            0,
            0,
            0,
            0,
            0,
            -1
          )

        // iterate over all edge segments
        for (var /*number*/ i = 0; i < path.length - 1; i++) {
          sliderModel.setFirstAndLastBoxOnSegment(
            path[i],
            path[i + 1],
            i === 0,
            i === path.length - 2,
            label,
            sourceNodeLayout,
            targetNodeLayout,
            boundsR0,
            boundsR1
          )

          var /*yfiles.geometry.Point*/ p1 = boundsR0.orientedRectangleCenter
          var /*yfiles.geometry.Point*/ p2 = boundsR1.orientedRectangleCenter

          var /*yfiles.lang.Reference*/ r = {}
          var /*yfiles.lang.Reference*/ distanceToLine = {}
          this.calculateRatioAndDistance(labelCenter, path, i, p1, p2, r, distanceToLine)

          var /*number*/ quality = this.$calculateQuality(r.value, distanceToLine.value)
          if (!(quality < bestQuality)) {
            continue
          }

          bestQuality = quality
          bestRatio = r.value
          // for segments closer to the target create a parameter "from target"
          if (i > (((path.length - 2) / 2) | 0) || (i === 0 && r.value > 1)) {
            bestIndex = i + 1 - path.length
          } else {
            bestIndex = i
          }
        }

        return bestIndex < 0
          ? sliderModel.createParameterFromTarget(-bestIndex - 1, 1 - bestRatio)
          : sliderModel.createParameterFromSource(bestIndex, bestRatio)
      },

      calculateRatioAndDistance: function (
        /*yfiles.geometry.Point*/ lc,
        /*yfiles.geometry.Point[]*/ path,
        /*number*/ i,
        /*yfiles.geometry.Point*/ p1,
        /*yfiles.geometry.Point*/ p2,
        /*yfiles.lang.Reference*/ r,
        /*yfiles.lang.Reference*/ distanceToLine
      ) {
        var /*yfiles.geometry.Point*/ direction = p2.subtract(p1)
        // lx/ly are the absolute coordinates of the projection of the center on the line
        var /*number*/ lx, ly
        if (direction.squaredVectorLength === 0) {
          // we have no direction vector - absolute ratio
          direction = path[i + 1].subtract(path[i]).normalized
          var /*yfiles.geometry.Point*/ project = lc.getProjectionOnLine(p1, direction)
          lx = project.x
          ly = project.y
          distanceToLine.value = lc.subtract(project).squaredVectorLength
          var /*number*/ dx = lx - p1.x
          var /*number*/ edx = direction.x
          var /*number*/ dy = ly - p1.y
          var /*number*/ edy = direction.y
          // can never happen?
          if (edx === 0 && edy === 0) {
            edx = 1
            edy = 0
          }
          if (Math.abs(edy) > Math.abs(edx)) {
            r.value = dy / edy
          } else if (Math.abs(edx) > 0) {
            r.value = dx / edx
          } else {
            r.value = (dx / edx + dy / edy) / 2
          }
          if (r.value > 0) {
            // trigger absolute calculation
            r.value += 1.0
          }
          if (r.value === 0) {
            r.value = -0.00001
          }
        } else {
          var /*yfiles.geometry.Point*/ project = lc.getProjectionOnLine(p1, direction)
          lx = project.x
          ly = project.y
          distanceToLine.value = lc.subtract(project).squaredVectorLength
          var /*number*/ dx = lx - p1.x
          var /*number*/ edx = direction.x
          var /*number*/ dy = ly - p1.y
          var /*number*/ edy = direction.y
          // can never happen?
          if (edx === 0 && edy === 0) {
            edx = 1
            edy = 0
          }

          if (Math.abs(edy) > Math.abs(edx)) {
            r.value = dy / edy
          } else if (Math.abs(edx) > 0) {
            r.value = dx / edx
          } else {
            r.value = (dx / edx + dy / edy) / 2
          }
        }

        r.value = compat.graphml.xaml.RotatedSliderEdgeLabelModel.modifyAbsoluteRatios(
          lx,
          ly,
          p1,
          p2,
          r.value
        )
      },

      $calculateQuality: function (/*number*/ ratio, /*number*/ distanceToLine) {
        var /*number*/ rq = ratio < 0 ? -ratio + 1 : ratio
        return rq < 1
          ? distanceToLine + Math.abs(rq - 0.5)
          : Math.sqrt(distanceToLine * distanceToLine + (rq - 1) * (rq - 1))
      },

      setFirstAndLastBoxOnSegment: function (
        /*yfiles.geometry.Point*/ p1,
        /*yfiles.geometry.Point*/ p2,
        /*boolean*/ isFirst,
        /*boolean*/ isLast,
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.geometry.Rect*/ sourceNodeLayout,
        /*yfiles.geometry.Rect*/ targetNodeLayout,
        /*yfiles.geometry.OrientedRectangle*/ boundsR0,
        /*yfiles.geometry.OrientedRectangle*/ boundsR1
      ) {
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
          segment = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(p1, p2)
        var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner
        if (segment.$getLength() === 0) {
          // something went wrong, fix it
          var /*yfiles.geometry.Point*/ spl = edge.sourcePort.location
          var /*yfiles.geometry.Point*/ tpl = edge.targetPort.location
          var /*number*/ dx = spl.x - tpl.x
          var /*number*/ dy = spl.y - tpl.y
          if (dx === 0 && dy === 0) {
            // something even worse happened, try to fix it!
            p2 = new Point(p1.x + compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS, p1.y)
          } else {
            var /*number*/ dl = Math.sqrt(dx * dx + dy * dy)
            segment.$secondEndPoint = p2 = new Point(
              p1.x + (compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS * dx) / dl,
              p1.y + (compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS * dy) / dl
            )
          }
        }

        // determine rotation angle
        var /*number*/ rotationAngle = this.$angle
        if (this.$autoRotationEnabled) {
          rotationAngle = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calculateRotationAngle(
            segment.$toVector(),
            this.$angle
          )
        }
        // segment index used for the model parameter
        var /*number*/ dist = this.$distance
        boundsR0.size = label.preferredSize
        boundsR1.size = label.preferredSize

        // represents label candidate at ratio 0
        if (rotationAngle !== 0) {
          boundsR0.angle = rotationAngle
        }
        this.$placeAtPoint(boundsR0, segment, p1, dist)
        if (
          isFirst &&
          compat.graphml.xaml.RotatedSliderEdgeLabelModel.doIntersect(sourceNodeLayout, boundsR0)
        ) {
          // placement depends on source node
          this.$placeAtSource(boundsR0, segment, sourceNodeLayout, dist)
        }
        // represents label candidate at ratio 1
        boundsR1.angle = rotationAngle
        this.$placeAtPoint(boundsR1, segment, p2, dist)
        if (
          isLast &&
          compat.graphml.xaml.RotatedSliderEdgeLabelModel.doIntersect(targetNodeLayout, boundsR1)
        ) {
          // placement depends on target node
          this.$placeAtTarget(boundsR1, segment, targetNodeLayout, dist)
        }
      },

      $static: {
        LABEL_NODE_DISTANCE: 5,

        EPS: 0.0001,

        EPS_SEGMENT_END: 0.000001,

        NODE_SIDE_TOP: 0,

        NODE_SIDE_BOTTOM: 1,

        NODE_SIDE_LEFT: 2,

        NODE_SIDE_RIGHT: 3,

        getPathPoints: function (/*yfiles.geometry.GeneralPath*/ path) {
          if (path === null) {
            return []
          }

          var /*yfiles.collections.List<yfiles.geometry.Point>*/ points = new List()

          var /*yfiles.geometry.GeneralPath.GeneralPathCursor*/ pathCursor = path.createCursor()
          var /*number[]*/ coords = [0, 0, 0, 0, 0, 0]
          var /*number*/ moveX = 0,
            moveY = 0
          while (pathCursor.moveNext()) {
            var /*yfiles.geometry.PathType*/ current = pathCursor.getCurrent(coords)
            var /*number*/ lastX
            var /*number*/ lastY
            switch (current) {
              case PathType.MOVE_TO:
                lastX = moveX = coords[0]
                lastY = moveY = coords[1]
                break
              case PathType.LINE_TO:
                lastX = coords[0]
                lastY = coords[1]
                break
              case PathType.QUAD_TO:
                lastX = coords[2]
                lastY = coords[3]
                break
              case PathType.CUBIC_TO:
                lastX = coords[4]
                lastY = coords[5]
                break
              case PathType.CLOSE:
                lastX = moveX
                lastY = moveY
                break
              default:
                throw new Exception('Unknown path type', 'argument')
            }
            points.add(new Point(lastX, lastY))
          }
          return points.toArray()
        },

        getDistance: function (
          /*yfiles.geometry.Rect*/ r,
          /*yfiles.geometry.IOrientedRectangle*/ orientedRect
        ) {
          if (compat.graphml.xaml.RotatedSliderEdgeLabelModel.isParaxial(orientedRect)) {
            return compat.graphml.xaml.RotatedSliderEdgeLabelModel.distanceToRect(
              r,
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.getBounds(orientedRect)
            )
          }
          return r.intersects(orientedRect, compat.graphml.xaml.RotatedSliderEdgeLabelModel.EPS)
            ? 0.0
            : compat.graphml.xaml.RotatedSliderEdgeLabelModel.getDistance1(
                r,
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.getCorners(orientedRect)
              )
        },

        isParaxial: function (/*yfiles.geometry.IOrientedRectangle*/ rect) {
          // ReSharper disable CompareOfFloatsByEqualityOperator
          return (
            (rect.upX === 0 && (rect.upY === -1 || rect.upY === 1)) ||
            (rect.upY === 0 && (rect.upX === -1 || rect.upX === 1))
          )
          // ReSharper restore CompareOfFloatsByEqualityOperator
        },

        distanceToRect: function (/*yfiles.geometry.Rect*/ r1, /*yfiles.geometry.Rect*/ r2) {
          if (r1.intersects(r2)) {
            return 0.0
          }
          var /*number*/ distVertical = compat.graphml.xaml.RotatedSliderEdgeLabelModel.orthogonalDistanceTo(
              r1,
              r2,
              false
            )
          var /*number*/ distHorizontal = compat.graphml.xaml.RotatedSliderEdgeLabelModel.orthogonalDistanceTo(
              r1,
              r2,
              true
            )
          return Math.sqrt(distVertical * distVertical + distHorizontal * distHorizontal)
        },

        orthogonalDistanceTo: function (
          /*yfiles.geometry.Rect*/ rect1,
          /*yfiles.geometry.Rect*/ rect2,
          /*boolean*/ horizontal
        ) {
          var /*number*/ rect1Min = horizontal ? rect1.x : rect1.y
          var /*number*/ rect1Max = horizontal ? rect1.x + rect1.width : rect1.y + rect1.height
          var /*number*/ rect2Min = horizontal ? rect2.x : rect2.y
          var /*number*/ rect2Max = horizontal ? rect2.x + rect2.width : rect2.y + rect2.height
          if (rect2Max < rect1Min) {
            // complete rectangle at lower coordinate
            return rect2Max - rect1Min
          } else if (rect1Max < rect2Min) {
            // complete rectangle at higher coordinate
            return rect2Min - rect1Max
          } else {
            // intersection of elements
            return 0.0
          }
        },

        getBounds: function (/*yfiles.geometry.IOrientedRectangle*/ rect) {
          if (rect.upX === 0 && rect.upY === -1) {
            return new Rect(rect.anchorX, rect.anchorY - rect.height, rect.width, rect.height)
          } else if (rect.upX === 0 && rect.upY === 1) {
            return new Rect(rect.anchorX - rect.width, rect.anchorY, rect.width, rect.height)
          } else if (rect.upX === 1 && rect.upY === 0) {
            return new Rect(rect.anchorX, rect.anchorY, rect.height, rect.width)
          } else if (rect.upX === -1 && rect.upY === 0) {
            return new Rect(
              rect.anchorX - rect.height,
              rect.anchorY - rect.width,
              rect.height,
              rect.width
            )
          } else {
            return rect.bounds
          }
        },

        getDistance1: function (/*yfiles.geometry.Rect*/ r, /*yfiles.geometry.Point[]*/ polygon) {
          var /*yfiles.geometry.Point*/ upperLeft = r.topLeft
          var /*yfiles.geometry.Point*/ lowerLeft = r.bottomLeft
          var /*yfiles.geometry.Point*/ lowerRight = r.bottomRight
          var /*yfiles.geometry.Point*/ upperRight = r.topRight
          var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment[]*/ borderSegments = [
              new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(upperLeft, lowerLeft),
              new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
                upperRight,
                lowerRight
              ),
              new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
                upperLeft,
                upperRight
              ),
              new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(lowerLeft, lowerRight)
            ]
          var /*number*/ dist = Number.MAX_VALUE
          for (var /*number*/ i = 0; i < polygon.length; i++) {
            var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/
              line = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
                polygon[i],
                polygon[(i + 1) % polygon.length]
              )
            for (var /*number*/ j = 0; j < borderSegments.length; j++) {
              dist = Math.min(dist, line.$getDistance(borderSegments[j]))
            }
          }
          return dist
        },

        findLineIntersection: function (
          /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ segment1,
          /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ segment2,
          /*yfiles.lang.Reference<yfiles.geometry.Point>*/ intersectionPoint
        ) {
          return compat.graphml.xaml.RotatedSliderEdgeLabelModel.findLineIntersection1(
            segment1.$firstEndPoint,
            segment1.$secondEndPoint,
            segment2.$firstEndPoint,
            segment2.$secondEndPoint.subtract(segment2.$firstEndPoint),
            intersectionPoint
          )
        },

        findLineIntersection1: function (
          /*yfiles.geometry.Point*/ l1,
          /*yfiles.geometry.Point*/ l2,
          /*yfiles.geometry.Point*/ anchor,
          /*yfiles.geometry.Point*/ rayDirection,
          /*yfiles.lang.Reference<
          yfiles.geometry.Point>*/ intersectionPoint
        ) {
          var /*number*/ lx1 = l1.x
          var /*number*/ ly1 = l1.y
          var /*number*/ lx2 = l2.x
          var /*number*/ ly2 = l2.y
          var /*number*/ anchorX = anchor.x
          var /*number*/ anchorY = anchor.y
          var /*number*/ rayX = rayDirection.x
          var /*number*/ rayY = rayDirection.y

          var /*number*/ dx1 = lx2 - lx1
          var /*number*/ dy1 = ly2 - ly1
          var /*number*/ denominator = rayY * dx1 - rayX * dy1
          if (denominator !== 0) {
            var /*number*/ b = (dx1 * (ly1 - anchorY) - dy1 * (lx1 - anchorX)) / denominator
            var /*number*/ ix = anchorX + rayX * b
            var /*number*/ iy = anchorY + rayY * b
            intersectionPoint.value = new Point(ix, iy)
            return true
          }
          intersectionPoint.value = Point.ORIGIN
          return false
        },

        determineAlternativeNodeSide: function (
          /*yfiles.geometry.Point*/ segmentStartPoint,
          /*yfiles.geometry.Point*/ segmentEndPoint
        ) {
          var /*yfiles.geometry.Point*/ vec = segmentEndPoint.subtract(segmentStartPoint)
          return Math.abs(vec.x) > Math.abs(vec.y)
            ? vec.y > 0
              ? compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_BOTTOM
              : compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_TOP
            : vec.x < 0
            ? compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_LEFT
            : compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_RIGHT
        },

        calcProjDistance: function (
          /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ edgeSegment,
          /*yfiles.geometry.Point*/ alignSegment,
          /*number*/ dist
        ) {
          var /*number*/ segmentAngle = compat.graphml.xaml.RotatedSliderEdgeLabelModel.calculateAngle(
              edgeSegment.$toVector(),
              alignSegment
            )
          if (segmentAngle === Math.PI * 0.5) {
            return dist
          } else {
            if (segmentAngle > Math.PI * 0.5) {
              segmentAngle = Math.PI - segmentAngle
            }
          }
          return dist / Math.sin(segmentAngle)
        },

        determineNodeSide: function (/*yfiles.geometry.Point*/ p1, /*yfiles.geometry.Point*/ p2) {
          var /*yfiles.geometry.Point*/ vec = p2.subtract(p1)
          if (Math.abs(vec.x) > Math.abs(vec.y)) {
            return vec.x > 0
              ? compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_RIGHT
              : compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_LEFT
          } else {
            return vec.y < 0
              ? compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_TOP
              : compat.graphml.xaml.RotatedSliderEdgeLabelModel.NODE_SIDE_BOTTOM
          }
        },

        rightOf: function (/*yfiles.geometry.Point*/ v1, /*yfiles.geometry.Point*/ v2) {
          return v1.x * v2.y - v1.y * v2.x > 0
        },

        ZERO_VECTOR: {
          get: function () {
            return new Point(1, 0)
          }
        },

        calculateRotationAngle: function (/*yfiles.geometry.Point*/ vector, /*number*/ angle) {
          return compat.graphml.xaml.RotatedSliderEdgeLabelModel.normalizeAngle(
            compat.graphml.xaml.RotatedSliderEdgeLabelModel.calculateAngle(
              vector,
              compat.graphml.xaml.RotatedSliderEdgeLabelModel.ZERO_VECTOR
            ) - angle
          )
        },

        calculateAngle: function (/*yfiles.geometry.Point*/ v1, /*yfiles.geometry.Point*/ v2) {
          var /*number*/ cosA = v1.scalarProduct(v2) / (v1.vectorLength * v2.vectorLength)
          // due to rounding errors the above calculated value cosA might be out of
          // the range of theoretically possible (and for Math.acos(double) required)
          // value range [-1, 1]
          var /*number*/ a
          if (cosA > 1) {
            a = Math.acos(1)
          } else {
            if (cosA < -1) {
              a = Math.acos(-1)
            } else {
              a = Math.acos(Math.min(1, cosA))
            }
          }
          if (!compat.graphml.xaml.RotatedSliderEdgeLabelModel.rightOf(v1, v2)) {
            a = 2 * Math.PI - a
          }
          return a
        },

        orthoNormal: function (/*yfiles.geometry.Point*/ vector) {
          var /*number*/ length = vector.vectorLength
          return new Point(-vector.y / length, vector.x / length)
        },

        getCorners: function (/*yfiles.geometry.IOrientedRectangle*/ rect) {
          var /*number*/ w = rect.width
          var /*number*/ h = rect.height
          var /*number*/ x1 = rect.anchorX
          var /*number*/ y1 = rect.anchorY
          var /*number*/ upX = rect.upX
          var /*number*/ upY = rect.upY
          var /*number*/ x2 = x1 + upX * h
          var /*number*/ y2 = y1 + upY * h
          var /*number*/ x3 = x2 - upY * w
          var /*number*/ y3 = y2 + upX * w
          var /*number*/ x4 = x1 - upY * w
          var /*number*/ y4 = y1 + upX * w
          return [new Point(x1, y1), new Point(x2, y2), new Point(x3, y3), new Point(x4, y4)]
        },

        isPositive: function (/*number*/ value) {
          return value > 0
        },

        isNegative: function (/*number*/ value) {
          return value < 0
        },

        normalizeAngle: function (/*number*/ angle) {
          if (angle < 0) {
            angle += 2 * Math.PI
          }
          while (angle > 2 * Math.PI) {
            angle -= 2 * Math.PI
          }
          return angle
        },

        getLineSegment: function (/*yfiles.geometry.Point[]*/ linePoints, /*number*/ index) {
          if (index + 1 >= linePoints.length) {
            index = linePoints.length - 2
          } else if (index < 0) {
            index = 0
          }
          if (index + 1 < linePoints.length) {
            return new compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment(
              linePoints[index],
              linePoints[index + 1]
            )
          }
          return null
        },

        LineSegment: new ClassDefinition(function () {
          return {
            constructor: function (
              /*yfiles.geometry.Point*/ startPoint,
              /*yfiles.geometry.Point*/ endPoint
            ) {
              this.$initLineSegment()
              this.$firstEndPoint = startPoint
              this.$secondEndPoint = endPoint
            },

            $firstEndPoint: null,

            firstEndPoint: {
              get: function () {
                return this.$firstEndPoint
              },
              set: function (/*yfiles.geometry.Point*/ value) {
                this.$firstEndPoint = value
              }
            },

            $secondEndPoint: null,

            secondEndPoint: {
              get: function () {
                return this.$secondEndPoint
              },
              set: function (/*yfiles.geometry.Point*/ value) {
                this.$secondEndPoint = value
              }
            },

            $getLength: function () {
              return this.$firstEndPoint.distanceTo(this.$secondEndPoint)
            },

            $toVector: function () {
              return this.$secondEndPoint.subtract(this.$firstEndPoint)
            },

            $getDistance: function (
              /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ otherSegment
            ) {
              if (this.$intersects(otherSegment)) {
                return 0.0
              }
              var /*number*/ distance = otherSegment.$firstEndPoint.distanceToSegment(
                  this.$firstEndPoint,
                  this.$secondEndPoint
                )
              distance = Math.min(
                distance,
                otherSegment.$secondEndPoint.distanceToSegment(
                  this.$firstEndPoint,
                  this.$secondEndPoint
                )
              )
              distance = Math.min(
                distance,
                this.$firstEndPoint.distanceToSegment(
                  otherSegment.$firstEndPoint,
                  otherSegment.$secondEndPoint
                )
              )
              distance = Math.min(
                distance,
                this.$secondEndPoint.distanceToSegment(
                  otherSegment.$firstEndPoint,
                  otherSegment.$secondEndPoint
                )
              )
              return distance
            },

            $intersects: function (
              /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment*/ otherSegment
            ) {
              return (
                Number.POSITIVE_INFINITY !==
                compat.graphml.xaml.RotatedSliderEdgeLabelModel.LineSegment.findLineSegmentIntersection(
                  this.$firstEndPoint.x,
                  this.$firstEndPoint.y,
                  this.$secondEndPoint.x,
                  this.$secondEndPoint.y,
                  otherSegment.$firstEndPoint.x,
                  otherSegment.$firstEndPoint.y,
                  otherSegment.$secondEndPoint.x,
                  otherSegment.$secondEndPoint.y
                )
              )
            },

            $getClosestPointIndex: function (/*yfiles.geometry.Point[]*/ corners) {
              var /*number*/ minDist = Number.MAX_VALUE
              var /*number*/ bestIndex = -1
              for (var /*number*/ i = 0; i < corners.length; i++) {
                var /*number*/ dist = corners[i].distanceToSegment(
                    this.$firstEndPoint,
                    this.$secondEndPoint
                  )
                if (dist < minDist) {
                  bestIndex = i
                  minDist = dist
                }
              }
              return bestIndex
            },

            $getClosestPoint: function (/*yfiles.geometry.Point[]*/ corners) {
              return corners[this.$getClosestPointIndex(corners)]
            },

            $initLineSegment: function () {
              this.$firstEndPoint = new Point(0, 0)
              this.$secondEndPoint = new Point(0, 0)
            },

            $static: {
              findLineSegmentIntersection: function (
                /*number*/ l1x1,
                /*number*/ l1y1,
                /*number*/ l1x2,
                /*number*/ l1y2,
                /*number*/ l2x1,
                /*number*/ l2y1,
                /*number*/ l2x2,
                /*number*/ l2y2
              ) {
                var /*number*/ dx1 = l1x2 - l1x1
                var /*number*/ dy1 = l1y2 - l1y1
                var /*number*/ dx2 = l2x2 - l2x1
                var /*number*/ dy2 = l2y2 - l2y1
                var /*number*/ denominator = dy2 * dx1 - dx2 * dy1
                if (denominator !== 0) {
                  var /*number*/ a = (dx2 * (l1y1 - l2y1) - dy2 * (l1x1 - l2x1)) / denominator
                  if (a >= 0 && a <= 1) {
                    var /*number*/ b = (dx1 * (l1y1 - l2y1) - dy1 * (l1x1 - l2x1)) / denominator
                    if (b >= 0 && b <= 1) {
                      return b
                    }
                  }
                }
                return Number.POSITIVE_INFINITY
              }
            }
          }
        }),

        RotatedSliderParameter: new ClassDefinition(function () {
          return {
            $with: [ILabelModelParameter, IMarkupExtensionConverter],

            constructor: function (
              /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/ model,
              /*number*/ segment,
              /*number*/ ratio
            ) {
              this.$model = model
              this.$segment = segment
              this.$ratio = ratio
            },

            $model: null,

            $segment: 0,

            $ratio: 0,

            segment: {
              get: function () {
                return this.$segment
              }
            },

            ratio: {
              get: function () {
                return this.$ratio
              }
            },

            model: {
              get: function () {
                return this.$model
              }
            },

            clone: function () {
              return this.memberwiseClone()
            },

            supports: function (/*yfiles.graph.ILabel*/ label) {
              return IEdge.isInstance(label.owner)
            },

            canConvert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              return true
            },

            convert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              if (this.$segment < 0) {
                var /*compat.graphml.xaml.RotatedSliderLabelModelParameterExtension*/
                  newInstance = new compat.graphml.xaml.RotatedSliderLabelModelParameterExtension()
                {
                  newInstance.location = compat.graphml.xaml.SliderParameterLocation.FROM_TARGET
                  newInstance.segmentIndex = -1 - this.$segment
                  newInstance.segmentRatio = 1 - this.$ratio
                  newInstance.model = this.$model
                }
                return newInstance
              } else {
                var /*compat.graphml.xaml.RotatedSliderLabelModelParameterExtension*/
                  newInstance = new compat.graphml.xaml.RotatedSliderLabelModelParameterExtension()
                {
                  newInstance.location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
                  newInstance.segmentIndex = this.$segment
                  newInstance.segmentRatio = this.$ratio
                  newInstance.model = this.$model
                }
                return newInstance
              }
            }
          }
        }),

        getNodeLayout: function (/*yfiles.graph.IPort*/ port) {
          var /*yfiles.graph.IPortOwner*/ tmp
          var /*yfiles.graph.INode*/ sourceNode = INode.isInstance((tmp = port.owner))
              ? /*(yfiles.graph.INode)*/ tmp
              : null
          if (sourceNode !== null) {
            return sourceNode.layout.toRect()
          }
          var /*yfiles.geometry.Point*/ location = port.location
          return new Rect(location.x - 0.5, location.y - 0.5, 1, 1)
        },

        modifyAbsoluteRatios: function (
          /*number*/ lx,
          /*number*/ ly,
          /*yfiles.geometry.Point*/ p1,
          /*yfiles.geometry.Point*/ p2,
          /*number*/ r
        ) {
          if (r < 0) {
            // ratio < 0 is interpreted absolutely:
            var /*number*/ dx = p1.x - lx
            var /*number*/ dy = p1.y - ly
            // but we have to make sure this absolute value is < 0
            r = Math.min(-Math.sqrt(dx * dx + dy * dy), -0.0000001)
          } else if (r > 1) {
            // ratio > 1 is interpreted absolutely:
            var /*number*/ dx = p2.x - lx
            var /*number*/ dy = p2.y - ly
            // but we have to make sure this absolute value is > 1
            r = Math.max(Math.sqrt(dx * dx + dy * dy), 1.0000001)
          }
          return r
        },

        doIntersect: function (
          /*yfiles.geometry.Rect*/ nodeLayout,
          /*yfiles.geometry.IOrientedRectangle*/ labelBox
        ) {
          return nodeLayout.intersects(
            labelBox,
            compat.graphml.xaml.RotatedSliderEdgeLabelModel.LABEL_NODE_DISTANCE
          )
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatedSliderLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$segmentRatio = 0.5
        this.$location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
      },

      $model: null,

      model: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ defaultValue: null }),
            TypeAttribute(ILabelModel.$class)
          ]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      $location: 0,

      location: {
        $meta: function () {
          return [
            GraphMLAttribute().init({
              defaultValue: compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
            }),
            TypeAttribute(compat.graphml.xaml.SliderParameterLocation.$class)
          ]
        },
        get: function () {
          return this.$location
        },
        set: function (/*compat.graphml.xaml.SliderParameterLocation*/ value) {
          this.$location = value
        }
      },

      $segmentIndex: 0,

      segmentIndex: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentIndex
        },
        set: function (/*number*/ value) {
          this.$segmentIndex = value
        }
      },

      $segmentRatio: 0,

      segmentRatio: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.5 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentRatio
        },
        set: function (/*number*/ value) {
          this.$segmentRatio = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/ exModel =
            this.$model instanceof compat.graphml.xaml.RotatedSliderEdgeLabelModel
              ? /*(compat.graphml.xaml.RotatedSliderEdgeLabelModel)*/ this.$model
              : new compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderEdgeLabelModel()

        var /*boolean*/ fromSource =
            (this.$location & compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE) ===
            compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
        if (fromSource) {
          return exModel.createParameterFromSource(this.$segmentIndex, this.$segmentRatio)
        } else {
          return exModel.createParameterFromTarget(this.$segmentIndex, this.$segmentRatio)
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatedSideSliderLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$segmentRatio = 0.5
        this.$location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
      },

      $model: null,

      model: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ defaultValue: null }),
            TypeAttribute(ILabelModel.$class)
          ]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      $location: 0,

      location: {
        $meta: function () {
          return [
            GraphMLAttribute().init({
              defaultValue: compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
            }),
            TypeAttribute(compat.graphml.xaml.SliderParameterLocation.$class)
          ]
        },
        get: function () {
          return this.$location
        },
        set: function (/*compat.graphml.xaml.SliderParameterLocation*/ value) {
          this.$location = value
        }
      },

      $segmentIndex: 0,

      segmentIndex: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentIndex
        },
        set: function (/*number*/ value) {
          this.$segmentIndex = value
        }
      },

      $segmentRatio: 0,

      segmentRatio: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.5 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentRatio
        },
        set: function (/*number*/ value) {
          this.$segmentRatio = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*compat.graphml.xaml.RotatedSideSliderEdgeLabelModel*/ exModel =
            this.$model instanceof compat.graphml.xaml.RotatedSideSliderEdgeLabelModel
              ? /*(compat.graphml.xaml.RotatedSideSliderEdgeLabelModel)*/ this.$model
              : new compat.graphml.xaml.RotatedSideSliderEdgeLabelModel()

        var /*boolean*/ rightOfEdge =
            (this.$location & compat.graphml.xaml.SliderParameterLocation.RIGHT) ===
            compat.graphml.xaml.SliderParameterLocation.RIGHT
        var /*boolean*/ fromSource =
            (this.$location & compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE) ===
            compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
        if (fromSource) {
          return exModel.createParameterFromSource(
            this.$segmentIndex,
            this.$segmentRatio,
            rightOfEdge
          )
        } else {
          return exModel.createParameterFromTarget(
            this.$segmentIndex,
            this.$segmentRatio,
            rightOfEdge
          )
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatedSideSliderParameter = new ClassDefinition(function () {
    return {
      $with: [ILabelModelParameter, IMarkupExtensionConverter],

      constructor: function (
        /*yfiles.graph.ILabelModelParameter*/ innerParameter,
        /*compat.graphml.xaml.RotatedSideSliderEdgeLabelModel*/ labelModel
      ) {
        this.$innerParameter = innerParameter
        this.$labelModel = labelModel
      },

      $labelModel: null,

      $innerParameter: null,

      innerParameter: {
        get: function () {
          return this.$innerParameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$innerParameter = value
        }
      },

      model: {
        get: function () {
          return this.$labelModel
        }
      },

      supports: function (/*yfiles.graph.ILabel*/ label) {
        return this.$innerParameter.supports(label)
      },

      clone: function () {
        return this
      },

      canConvert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
        return true
      },

      convert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter*/
          parameter = /*(compat.graphml.xaml.RotatedSliderEdgeLabelModel.RotatedSliderParameter)*/ this
            .$innerParameter
        var /*compat.graphml.xaml.SliderParameterLocation*/ side =
            this.$labelModel.distance ===
            /*(compat.graphml.xaml.RotatedSliderEdgeLabelModel)*/ parameter.$model.$distance
              ? compat.graphml.xaml.SliderParameterLocation.RIGHT
              : compat.graphml.xaml.SliderParameterLocation.LEFT
        if (parameter.$segment < 0) {
          var /*compat.graphml.xaml.RotatedSideSliderLabelModelParameterExtension*/
            newInstance = new compat.graphml.xaml.RotatedSideSliderLabelModelParameterExtension()
          {
            newInstance.location = compat.graphml.xaml.SliderParameterLocation.FROM_TARGET | side
            newInstance.segmentIndex = -1 - parameter.$segment
            newInstance.segmentRatio = 1 - parameter.$ratio
            newInstance.model = this.$labelModel
          }
          return newInstance
        } else {
          var /*compat.graphml.xaml.RotatedSideSliderLabelModelParameterExtension*/
            newInstance = new compat.graphml.xaml.RotatedSideSliderLabelModelParameterExtension()
          {
            newInstance.location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE | side
            newInstance.segmentIndex = parameter.$segment
            newInstance.segmentRatio = parameter.$ratio
            newInstance.model = this.$labelModel
          }
          return newInstance
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RotatedSideSliderEdgeLabelModel = new ClassDefinition(function () {
    return {
      $with: [ILabelModel, ILabelModelParameterProvider, ILabelModelParameterFinder],

      constructor: {
        default: function () {
          compat.graphml.xaml.RotatedSideSliderEdgeLabelModel.RotatedSideSliderEdgeLabelModel.call(
            this,
            0,
            0,
            true,
            true
          )
        },

        RotatedSideSliderEdgeLabelModel: function (
          /*number*/ distance,
          /*number*/ angle,
          /*boolean*/ distanceRelativeToEdge,
          /*boolean*/ autoRotationEnabled
        ) {
          var /*number*/ dist = distance
          if (distance === 0.0) {
            dist += Number.MIN_VALUE
          }
          this.$leftModel = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.FromDistanceAngleDistanceRelativeToEdgeAndAutoRotationEnabled(
            -dist,
            angle,
            distanceRelativeToEdge,
            autoRotationEnabled
          )
          this.$rightModel = new compat.graphml.xaml.RotatedSliderEdgeLabelModel.FromDistanceAngleDistanceRelativeToEdgeAndAutoRotationEnabled(
            dist,
            angle,
            distanceRelativeToEdge,
            autoRotationEnabled
          )
        }
      },

      $leftModel: null,

      $rightModel: null,

      distance: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$rightModel.$distance
        },
        set: function (/*number*/ value) {
          var /*number*/ distance = value
          if (distance === 0.0) {
            distance += Number.MIN_VALUE
          }
          this.$leftModel.$distance = -distance
          this.$rightModel.$distance = distance
        }
      },

      angle: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$rightModel.$angle
        },
        set: function (/*number*/ value) {
          this.$leftModel.$angle = value
          this.$rightModel.$angle = value
        }
      },

      distanceRelativeToEdge: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$rightModel.$distanceRelativeToEdge
        },
        set: function (/*boolean*/ value) {
          this.$leftModel.$distanceRelativeToEdge = value
          this.$rightModel.$distanceRelativeToEdge = value
        }
      },

      autoRotationEnabled: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$rightModel.$autoRotationEnabled
        },
        set: function (/*boolean*/ value) {
          this.$leftModel.$autoRotationEnabled = value
          this.$rightModel.$autoRotationEnabled = value
        }
      },

      lookup: function (/*yfiles.lang.Class*/ type) {
        if (type.isInstance(this)) {
          return this
        } else {
          return null
        }
      },

      getGeometry: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        var /*compat.graphml.xaml.RotatedSideSliderParameter*/
          modelParameter = /*(compat.graphml.xaml.RotatedSideSliderParameter)*/ parameter
        return modelParameter.$innerParameter.model.getGeometry(
          label,
          modelParameter.$innerParameter
        )
      },

      createDefaultParameter: function () {
        return new compat.graphml.xaml.RotatedSideSliderParameter(
          this.$rightModel.createDefaultParameter(),
          this
        )
      },

      getContext: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        return yfiles.graph.Lookups.EMPTY
      },

      getParameters: function (/*yfiles.graph.ILabel*/ label, /*yfiles.graph.ILabelModel*/ model) {
        var /*yfiles.collections.List<yfiles.graph.ILabelModelParameter>*/ parameters = new List()
        var /*compat.graphml.xaml.RotatedSideSliderEdgeLabelModel*/ rotatedModel
        var /*compat.graphml.xaml.RotatedSideSliderEdgeLabelModel*/ rotatedSideSliderEdgeLabelModel =
            model instanceof compat.graphml.xaml.RotatedSideSliderEdgeLabelModel
              ? /*(compat.graphml.xaml.RotatedSideSliderEdgeLabelModel)*/ model
              : null
        if (rotatedSideSliderEdgeLabelModel !== null) {
          rotatedModel = rotatedSideSliderEdgeLabelModel
        } else {
          rotatedModel = this
        }
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/ rightModel =
            rotatedModel.$rightModel
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/ leftModel = rotatedModel.$leftModel
        if (rightModel !== null) {
          var /*yfiles.graph.ILabelModelParameterProvider*/
            parameterProvider = /*(yfiles.graph.ILabelModelParameterProvider)*/ rightModel.lookup(
              ILabelModelParameterProvider.$class
            )
          if (parameterProvider !== null) {
            var /*yfiles.collections.IEnumerable<yfiles.graph.ILabelModelParameter>*/
              innerParameters = parameterProvider.getParameters(label, rightModel)
            var /*yfiles.collections.IEnumerator*/ tmpEnumerator
            for (tmpEnumerator = innerParameters.getEnumerator(); tmpEnumerator.moveNext(); ) {
              var /*yfiles.graph.ILabelModelParameter*/ innerParameter = tmpEnumerator.current
              {
                parameters.add(
                  new compat.graphml.xaml.RotatedSideSliderParameter(innerParameter, rotatedModel)
                )
              }
            }
          }
        }
        if (leftModel !== null) {
          var /*yfiles.graph.ILabelModelParameterProvider*/
            parameterProvider = /*(yfiles.graph.ILabelModelParameterProvider)*/ leftModel.lookup(
              ILabelModelParameterProvider.$class
            )
          if (parameterProvider !== null) {
            var /*yfiles.collections.IEnumerable<yfiles.graph.ILabelModelParameter>*/
              innerParameters = parameterProvider.getParameters(label, leftModel)
            var /*yfiles.collections.IEnumerator*/ tmpEnumerator
            for (tmpEnumerator = innerParameters.getEnumerator(); tmpEnumerator.moveNext(); ) {
              var /*yfiles.graph.ILabelModelParameter*/ innerParameter = tmpEnumerator.current
              {
                parameters.add(
                  new compat.graphml.xaml.RotatedSideSliderParameter(innerParameter, rotatedModel)
                )
              }
            }
          }
        }
        return parameters
      },

      createParameterFromSource: function (
        /*number*/ segmentIndex,
        /*number*/ segmentRatio,
        /*boolean*/ rightOfEdge
      ) {
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/ model = rightOfEdge
            ? this.$rightModel
            : this.$leftModel
        return new compat.graphml.xaml.RotatedSideSliderParameter(
          model.createParameterFromSource(segmentIndex, segmentRatio),
          this
        )
      },

      createParameterFromTarget: function (
        /*number*/ segmentIndex,
        /*number*/ segmentRatio,
        /*boolean*/ rightOfEdge
      ) {
        var /*compat.graphml.xaml.RotatedSliderEdgeLabelModel*/ model = rightOfEdge
            ? this.$rightModel
            : this.$leftModel
        return new compat.graphml.xaml.RotatedSideSliderParameter(
          model.createParameterFromTarget(segmentIndex, segmentRatio),
          this
        )
      },

      findBestParameter: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModel*/ model,
        /*yfiles.geometry.IOrientedRectangle*/ labelLayout
      ) {
        var /*yfiles.graph.ILabelModelParameter*/
          leftParam = this /*(yfiles.graph.ILabelModelParameterFinder)*/.$leftModel
            .findBestParameter(label, this.$leftModel, labelLayout)
        var /*yfiles.graph.ILabelModelParameter*/
          rightParam = this /*(yfiles.graph.ILabelModelParameterFinder)*/.$rightModel
            .findBestParameter(label, this.$rightModel, labelLayout)
        var /*yfiles.geometry.IOrientedRectangle*/ leftGeom = this /*(yfiles.graph.ILabelModel)*/.$leftModel
            .getGeometry(label, leftParam)
        var /*yfiles.geometry.IOrientedRectangle*/ rightGeom = this /*(yfiles.graph.ILabelModel)*/.$rightModel
            .getGeometry(label, rightParam)
        var /*yfiles.geometry.Point*/ layoutCenter = labelLayout.orientedRectangleCenter
        var /*number*/ leftDist = leftGeom.orientedRectangleCenter.distanceTo(layoutCenter)
        var /*number*/ rightDist = rightGeom.orientedRectangleCenter.distanceTo(layoutCenter)
        return leftDist < rightDist
          ? new compat.graphml.xaml.RotatedSideSliderParameter(leftParam, this)
          : new compat.graphml.xaml.RotatedSideSliderParameter(rightParam, this)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StringTemplatePortStyleExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.xaml.ControlStyleBaseExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'svgContent' })],

      constructor: function () {
        compat.graphml.xaml.ControlStyleBaseExtension.call(this)
        this.$initStringPortControlPortStyleExtension()
        this.$renderSize = new Size(5, 5)
      },

      $svgContent: null,

      svgContent: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$svgContent
        },
        set: function (/*string*/ value) {
          this.$svgContent = value
        }
      },

      $renderSize: null,

      renderSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$renderSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$renderSize = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.StringTemplatePortStyle*/ newInstance = new StringTemplatePortStyle()
        {
          newInstance.styleTag = this.$styleTag
          newInstance.renderSize = this.$renderSize
          newInstance.normalizedOutline = this.$outlineShape
          newInstance.svgContent = this.$svgContent
          newInstance.contextLookup = this.$contextLookup
        }
        return newInstance
      },

      $initStringPortControlPortStyleExtension: function () {
        this.$renderSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.TemplatePortStyleExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.xaml.ControlStyleBaseExtension,

      constructor: function () {
        compat.graphml.xaml.ControlStyleBaseExtension.call(this)
        this.$initPortControlPortStyleExtension()
        this.$renderSize = new Size(5, 5)
      },

      $styleResourceKey: null,

      styleResourceKey: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$styleResourceKey
        },
        set: function (/*string*/ value) {
          this.$styleResourceKey = value
        }
      },

      $renderSize: null,

      renderSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$renderSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$renderSize = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.TemplatePortStyle*/ newInstance = new TemplatePortStyle()
        {
          newInstance.styleTag = this.$styleTag
          newInstance.normalizedOutline = this.$outlineShape
          newInstance.styleResourceKey = this.$styleResourceKey
          newInstance.renderSize = this.$renderSize
          newInstance.contextLookup = this.$contextLookup
        }
        return newInstance
      },

      $initPortControlPortStyleExtension: function () {
        this.$renderSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.PolylineEdgeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$sourceArrow = IArrow.NONE
        this.$targetArrow = IArrow.NONE
        this.$pen = Stroke.BLACK
      },

      $pen: null,

      pen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$pen
        },
        set: function (/*Stroke*/ value) {
          this.$pen = value
        }
      },

      $smoothing: 0,

      smoothing: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$smoothing
        },
        set: function (/*number*/ value) {
          this.$smoothing = value
        }
      },

      $targetArrow: null,

      targetArrow: {
        $meta: function () {
          return [TypeAttribute(IArrow.$class)]
        },
        get: function () {
          return this.$targetArrow
        },
        set: function (/*yfiles.styles.IArrow*/ value) {
          this.$targetArrow = value
        }
      },

      $sourceArrow: null,

      sourceArrow: {
        $meta: function () {
          return [TypeAttribute(IArrow.$class)]
        },
        get: function () {
          return this.$sourceArrow
        },
        set: function (/*yfiles.styles.IArrow*/ value) {
          this.$sourceArrow = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.PolylineEdgeStyle*/ newInstance = new PolylineEdgeStyle()
        {
          newInstance.stroke = this.$pen
          newInstance.sourceArrow = this.$sourceArrow
          newInstance.targetArrow = this.$targetArrow
          newInstance.smoothingLength = this.$smoothing
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SegmentRatioParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(IPortLocationModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.IPortLocationModel*/ value) {
          this.$model = value
        }
      },

      $index: 0,

      index: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$index
        },
        set: function (/*number*/ value) {
          this.$index = value
        }
      },

      $ratio: 0,

      ratio: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$ratio
        },
        set: function (/*number*/ value) {
          this.$ratio = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.SegmentRatioParameterExtension*/
          newInstance = new yfiles.graphml.SegmentRatioParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.index = this.$index
          newInstance.ratio = this.$ratio
        }
        var /*yfiles.graphml.SegmentRatioParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SegmentRatioPortLocationModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new SegmentRatioPortLocationModel()
      },

      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(SegmentRatioPortLocationModel.$class)]
          },
          get: function () {
            return SegmentRatioPortLocationModel.INSTANCE
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ShinyPlateNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initShinyPlateNodeStyleExtension()
        this.$radius = 5
        this.$drawShadow = true
        this.$insets = new Insets(5)
      },

      $brush: null,

      brush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$brush
        },
        set: function (/*Fill*/ value) {
          this.$brush = value
        }
      },

      $pen: null,

      pen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$pen
        },
        set: function (/*yfiles.view.Stroke*/ value) {
          this.$pen = value
        }
      },

      $radius: 0,

      radius: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$radius
        },
        set: function (/*number*/ value) {
          this.$radius = value
        }
      },

      $drawShadow: false,

      drawShadow: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$drawShadow
        },
        set: function (/*boolean*/ value) {
          this.$drawShadow = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.ShinyPlateNodeStyle*/ newInstance = new ShinyPlateNodeStyle()
        {
          newInstance.fill = this.$brush
          newInstance.radius = this.$radius
          newInstance.drawShadow = this.$drawShadow
          newInstance.stroke = this.$pen
        }
        return newInstance
      },

      $initShinyPlateNodeStyleExtension: function () {
        this.$insets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ShapeNodeShape = new EnumDefinition(function () {
    return {
      RECTANGLE: 0,
      ROUND_RECTANGLE: 1,
      ELLIPSE: 2,
      TRIANGLE: 3,
      TRIANGLE2: 4,
      SHEARED_RECTANGLE: 5,
      SHEARED_RECTANGLE2: 6,
      TRAPEZ: 7,
      TRAPEZ2: 8,
      STAR5: 9,
      STAR6: 10,
      STAR8: 11,
      FAT_ARROW: 12,
      FAT_ARROW2: 13,
      DIAMOND: 14,
      OCTAGON: 15,
      HEXAGON: 16
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StripeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$ratio = 0.5
      },

      $useActualInsets: false,

      useActualInsets: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$useActualInsets
        },
        set: function (/*boolean*/ value) {
          this.$useActualInsets = value
        }
      },

      $ratio: 0,

      ratio: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$ratio
        },
        set: function (/*number*/ value) {
          this.$ratio = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.StripeLabelModel*/ newInstance = new StripeLabelModel()
        {
          newInstance.ratio = this.$ratio
          newInstance.useActualInsets = this.$useActualInsets
        }
        return newInstance
      },

      $static: {
        NORTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StripeLabelModel.NORTH
          }
        },

        SOUTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StripeLabelModel.SOUTH
          }
        },

        EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StripeLabelModel.EAST
          }
        },

        WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StripeLabelModel.WEST
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StripeLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initStripeLabelModelParameterExtension()
        this.$position = compat.graphml.xaml.StripeLabelModelPosition.NORTH
      },

      $position: null,

      position: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.StripeLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*compat.graphml.xaml.StripeLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.StripeLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.StripeLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.position = /*(yfiles.graph.StripeLabelModel.StripeLabelModelPosition)*/ this.$position
        }
        var /*yfiles.graphml.StripeLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initStripeLabelModelParameterExtension: function () {
        this.$position = compat.graphml.xaml.StripeLabelModelPosition.NORTH
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StretchStripeLabelModelPosition = new EnumDefinition(function () {
    return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StretchStripeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initStretchStripeLabelModelExtension()
        this.$insets = new Insets(0)
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      $useActualInsets: false,

      useActualInsets: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$useActualInsets
        },
        set: function (/*boolean*/ value) {
          this.$useActualInsets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.StretchStripeLabelModel*/ newInstance = new StretchStripeLabelModel()
        {
          newInstance.insets = this.$insets
          newInstance.useActualInsets = this.$useActualInsets
        }
        return newInstance
      },

      $initStretchStripeLabelModelExtension: function () {
        this.$insets = new Insets(0)
      },

      $static: {
        NORTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StretchStripeLabelModel.NORTH
          }
        },

        SOUTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StretchStripeLabelModel.SOUTH
          }
        },

        EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StretchStripeLabelModel.EAST
          }
        },

        WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return StretchStripeLabelModel.WEST
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StretchStripeLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initStretchStripeLabelModelParameterExtension()
        this.$position = compat.graphml.xaml.StretchStripeLabelModelPosition.NORTH
      },

      $position: null,

      position: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.StretchStripeLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*compat.graphml.xaml.StretchStripeLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.StretchStripeLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.StretchStripeLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.position = /*(yfiles.graph.StretchStripeLabelModel.StretchStripeLabelModelPosition)*/ this.$position
        }
        var /*yfiles.graphml.StretchStripeLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initStretchStripeLabelModelParameterExtension: function () {
        this.$position = compat.graphml.xaml.StretchStripeLabelModelPosition.NORTH
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SmartEdgeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$autoRotation = true
      },

      $autoRotation: false,

      autoRotation: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoRotation
        },
        set: function (/*boolean*/ value) {
          this.$autoRotation = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.SmartEdgeLabelModel*/ newInstance = new SmartEdgeLabelModel()
        {
          newInstance.angle = this.$angle
          newInstance.autoRotation = this.$autoRotation
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SmartEdgeLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$segmentRatio = 0.5
        this.$location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      $location: 0,

      location: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.SliderParameterLocation.$class)]
        },
        get: function () {
          return this.$location
        },
        set: function (/*compat.graphml.xaml.SliderParameterLocation*/ value) {
          this.$location = value
        }
      },

      $segmentIndex: 0,

      segmentIndex: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentIndex
        },
        set: function (/*number*/ value) {
          this.$segmentIndex = value
        }
      },

      $segmentRatio: 0,

      segmentRatio: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentRatio
        },
        set: function (/*number*/ value) {
          this.$segmentRatio = value
        }
      },

      $distance: 0,

      distance: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$distance
        },
        set: function (/*number*/ value) {
          this.$distance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.SmartEdgeLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.SmartEdgeLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.location = /*(yfiles.graphml.SliderParameterLocation)*/ this.$location
          newInstance.distance = this.$distance
          newInstance.segmentIndex = this.$segmentIndex
          newInstance.segmentRatio = this.$segmentRatio
        }
        var /*yfiles.graphml.SmartEdgeLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SliderEdgeLabelModel = new ClassDefinition(function () {
    return {
      $with: [ILabelModel, ILabelModelParameterProvider],

      constructor: {
        SliderEdgeLabelModel: function () {
          compat.graphml.xaml.SliderEdgeLabelModel.FromDistanceAngleAndEdgeRelativeDistance.call(
            this,
            0,
            0,
            true
          )
        },

        FromDistanceAngleAndEdgeRelativeDistance: function (
          /*number*/ distance,
          /*number*/ angle,
          /*boolean*/ edgeRelativeDistance
        ) {
          this.$distance = distance
          this.angle = angle
          this.$edgeRelativeDistance = edgeRelativeDistance
        }
      },

      $upX: 0,

      $upY: 0,

      angle: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return Math.atan2(this.$upX, -this.$upY)
        },
        set: function (/*number*/ value) {
          this.$upX = Math.sin(value)
          this.$upY = -Math.cos(value)
        }
      },

      $edgeRelativeDistance: false,

      edgeRelativeDistance: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$edgeRelativeDistance
        },
        set: function (/*boolean*/ value) {
          this.$edgeRelativeDistance = value
        }
      },

      getGeometry: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        var /*yfiles.geometry.OrientedRectangle*/ geometry = new OrientedRectangle(
            0,
            0,
            10,
            10,
            0,
            -1
          )
        var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner

        if (edge === null) {
          geometry.width = -1
          geometry.height = -1
          return geometry
        }

        var /*compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter*/
          sliderParameter = /*(compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter)*/ parameter
        var /*yfiles.geometry.Size*/ preferredSize = label.preferredSize
        geometry.width = preferredSize.width
        geometry.height = preferredSize.height
        geometry.setUpVector(this.$upX, this.$upY)

        sliderParameter.setAnchor(this, edge, geometry)

        return geometry
      },

      $distance: 0,

      distance: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$distance
        },
        set: function (/*number*/ value) {
          this.$distance = value
        }
      },

      createDefaultParameter: function () {
        return new compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter(this, 0, 0.5)
      },

      getContext: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        return yfiles.graph.Lookups.EMPTY
      },

      createParameterFromSource: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter(
          this,
          segmentIndex,
          segmentRatio
        )
      },

      createParameterFromTarget: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter(
          this,
          -1 - segmentIndex,
          1 - segmentRatio
        )
      },

      lookup: function (/*yfiles.lang.Class*/ type) {
        if (type === ILabelModelParameterProvider.$class) {
          return this
        }
        if (type === ILabelModelParameterFinder.$class) {
          return DefaultLabelModelParameterFinder.INSTANCE
        }
        return null
      },

      getParameters: function (/*yfiles.graph.ILabel*/ label, /*yfiles.graph.ILabelModel*/ model) {
        var /*compat.graphml.xaml.SliderEdgeLabelModel*/
          sliderEdgeLabelModel = /*(compat.graphml.xaml.SliderEdgeLabelModel)*/ model
        var /*yfiles.collections.List<yfiles.graph.ILabelModelParameter>*/ result = new List()
        var /*yfiles.graph.IEdge*/ edge = /*(yfiles.graph.IEdge)*/ label.owner
        var /*yfiles.styles.IPathGeometry*/ geometry = compat.graphml.xaml.SliderEdgeLabelModel.getPathGeometry(
            edge
          )
        if (geometry !== null) {
          var /*number*/ count = geometry.getSegmentCount()
          for (var /*number*/ i = 0; i < count; i++) {
            result.add(sliderEdgeLabelModel.createParameterFromSource(i, 0))
            result.add(sliderEdgeLabelModel.createParameterFromSource(i, 0.5))
            result.add(sliderEdgeLabelModel.createParameterFromSource(i, 1))
          }
        }
        return result
      },

      $static: {
        getPathGeometry: function (/*yfiles.graph.IEdge*/ edge) {
          var /*yfiles.styles.IEdgeStyle*/ style = edge.style
          return style.renderer.getPathGeometry(edge, style)
        },

        anchorGeometry: function (
          /*yfiles.geometry.OrientedRectangle*/ geometry,
          /*boolean*/ edgeRelativeDistance,
          /*number*/ labelModelDistance,
          /*number*/ x,
          /*number*/ y,
          /*number*/ thisRatio,
          /*number*/ tx,
          /*number*/ ty
        ) {
          var /*yfiles.lang.Reference*/ __yReference = {
              value: y
            }
          var /*yfiles.lang.Reference*/ __xReference = {
              value: x
            }
          // sanitize tangent
          if (tx === 0 && ty === 0) {
            tx = 1
          }
          // apply edge relative logic
          var /*number*/ distance
          if (!edgeRelativeDistance && tx < 0) {
            distance = -labelModelDistance
          } else {
            distance = labelModelDistance
          }

          // transformation matrix
          var /*number*/ m11 = -geometry.upY
          var /*number*/ m12 = geometry.upX
          var /*number*/ m21 = -m12
          var /*number*/ m22 = m11

          // transform to make labels aligned with x-y axes
          // transform point
          var /*number*/ nx = __xReference.value * m11 + __yReference.value * m12
          var /*number*/ ny = __xReference.value * m21 + __yReference.value * m22

          // transform tangent
          var /*number*/ ntx = tx * m11 + ty * m12
          var /*number*/ nty = tx * m21 + ty * m22

          __xReference.value = nx
          __yReference.value = ny
          tx = ntx
          ty = nty

          var /*number*/ width = geometry.width
          var /*number*/ height = geometry.height

          // see if we should stack vertically or horizontally
          var /*boolean*/ verticalStacking
          if (distance !== 0) {
            var /*number*/ atx = Math.abs(tx)
            var /*number*/ aty = Math.abs(ty)
            if (atx > 2 * aty) {
              verticalStacking = true
            } else if (aty > 2 * atx) {
              verticalStacking = false
            } else {
              if (tx * ty > 0) {
                verticalStacking = distance > 0
              } else {
                verticalStacking = distance < 0
              }
              if (thisRatio > 0.5) {
                verticalStacking = !verticalStacking
              }
            }
          } else {
            verticalStacking = Math.abs(tx) > Math.abs(ty)
          }

          // calculate the center position using the ratio
          if (verticalStacking) {
            __yReference.value = -__yReference.value
            compat.graphml.xaml.SliderEdgeLabelModel.updatePosition(
              distance,
              height,
              width,
              thisRatio,
              -ty,
              tx,
              __yReference,
              __xReference
            )
            __yReference.value = -__yReference.value
          } else {
            compat.graphml.xaml.SliderEdgeLabelModel.updatePosition(
              distance,
              width,
              height,
              thisRatio,
              tx,
              ty,
              __xReference,
              __yReference
            )
          }

          // go to the anchor
          __xReference.value -= width * 0.5
          __yReference.value += height * 0.5

          // retransform to original coordinate system and assign as anchor
          geometry.anchorX = __xReference.value * m11 + __yReference.value * m21
          geometry.anchorY = __xReference.value * m12 + __yReference.value * m22
        },

        updatePosition: function (
          /*number*/ distance,
          /*number*/ width,
          /*number*/ height,
          /*number*/ ratio,
          /*number*/ tx,
          /*number*/ ty,
          /*yfiles.lang.Reference*/ x,
          /*yfiles.lang.Reference*/ y
        ) {
          var /*number*/ iratio = 1 - ratio
          if (distance === 0) {
            // centered on edge
            if (ty > 0) {
              y.value += height * (iratio - 0.5)
              x.value += ((iratio - 0.5) * height * tx) / ty
            } else {
              // swap ratio
              y.value += height * (ratio - 0.5)
              x.value += ((ratio - 0.5) * height * tx) / ty
            }
          } else {
            if (ty > 0) {
              // ty > 0
              //
              // ----------------
              // [IIIII]/[IIIII]
              //       /
              //      /
              //
              y.value += height * (iratio - 0.5)
              var /*number*/ factor = (height * tx) / ty
              if (distance > 0) {
                if (tx > 0) {
                  x.value += iratio * factor
                } else {
                  x.value += -ratio * factor
                }
                x.value += width * 0.5 + distance
              } else {
                if (tx > 0) {
                  x.value += -ratio * factor
                } else {
                  x.value += iratio * factor
                }
                x.value -= width * 0.5 - distance
              }
            } else if (ty < 0) {
              // ty < 0
              //
              //          /
              //         /
              // [IIIII]/[IIIII]
              // ----------------
              //

              // swap ratio
              var /*number*/ t = ratio
              ratio = iratio
              iratio = t

              y.value += height * (iratio - 0.5)
              var /*number*/ factor = (height * tx) / ty
              if (distance > 0) {
                if (tx > 0) {
                  x.value += iratio * factor
                } else {
                  x.value += -ratio * factor
                }
                x.value -= width * 0.5 + distance
              } else {
                if (tx > 0) {
                  x.value += -ratio * factor
                } else {
                  x.value += iratio * factor
                }
                x.value += width * 0.5 - distance
              }
            }
          }
        },

        SliderParameter: new ClassDefinition(function () {
          return {
            $with: [ILabelModelParameter, IMarkupExtensionConverter],

            constructor: function (
              /*compat.graphml.xaml.SliderEdgeLabelModel*/ model,
              /*number*/ segmentIndex,
              /*number*/ ratio
            ) {
              this.$model = model
              this.$segmentIndex = segmentIndex
              this.$ratio = ratio
            },

            $model: null,

            $segmentIndex: 0,

            $ratio: 0,

            setAnchor: function (
              /*compat.graphml.xaml.SliderEdgeLabelModel*/ labelModel,
              /*yfiles.graph.IEdge*/ edge,
              /*yfiles.geometry.OrientedRectangle*/ geometry
            ) {
              var /*yfiles.styles.IPathGeometry*/
                pathGeometry = compat.graphml.xaml.SliderEdgeLabelModel.getPathGeometry(edge)
              if (pathGeometry !== null) {
                var /*number*/ count = pathGeometry.getSegmentCount()
                var /*number*/ index = this.$segmentIndex
                if (index >= count) {
                  index = count - 1
                }
                if (index < 0) {
                  index = count + index
                }

                if (index < 0) {
                  index = 0
                } else if (index >= count) {
                  index = count - 1
                }

                var /*number*/ thisRatio = this.$ratio
                var /*yfiles.geometry.Tangent*/ validTangent = pathGeometry.getTangentForSegment(
                    index,
                    thisRatio
                  )
                if (validTangent !== null) {
                  var /*yfiles.geometry.Point*/ p = validTangent.point
                  var /*yfiles.geometry.Point*/ t = validTangent.vector
                  compat.graphml.xaml.SliderEdgeLabelModel.anchorGeometry(
                    geometry,
                    labelModel.$edgeRelativeDistance,
                    labelModel.$distance,
                    p.x,
                    p.y,
                    thisRatio,
                    t.x,
                    t.y
                  )
                  return
                }
              }
              geometry.width = -1
              geometry.height = -1
            },

            model: {
              get: function () {
                return this.$model
              }
            },

            supports: function (/*yfiles.graph.ILabel*/ label) {
              return IEdge.isInstance(label.owner)
            },

            clone: function () {
              return this.memberwiseClone()
            },

            canConvert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              return true
            },

            convert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              if (this.$segmentIndex < 0) {
                var /*compat.graphml.xaml.SliderLabelModelParameterExtension*/
                  newInstance = new compat.graphml.xaml.SliderLabelModelParameterExtension()
                {
                  newInstance.location = compat.graphml.xaml.SliderParameterLocation.FROM_TARGET
                  newInstance.segmentIndex = -1 - this.$segmentIndex
                  newInstance.segmentRatio = 1 - this.$ratio
                  newInstance.model = this.$model
                }
                return newInstance
              } else {
                var /*compat.graphml.xaml.SliderLabelModelParameterExtension*/
                  newInstance = new compat.graphml.xaml.SliderLabelModelParameterExtension()
                {
                  newInstance.location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
                  newInstance.segmentIndex = this.$segmentIndex
                  newInstance.segmentRatio = this.$ratio
                  newInstance.model = this.$model
                }
                return newInstance
              }
            }
          }
        })
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SliderLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$segmentRatio = 0.5
        this.$location = compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      $location: 0,

      location: {
        $meta: function () {
          return [
            GraphMLAttribute().init({
              defaultValue: compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
            }),
            TypeAttribute(compat.graphml.xaml.SliderParameterLocation.$class)
          ]
        },
        get: function () {
          return this.$location
        },
        set: function (/*compat.graphml.xaml.SliderParameterLocation*/ value) {
          this.$location = value
        }
      },

      $segmentIndex: 0,

      segmentIndex: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentIndex
        },
        set: function (/*number*/ value) {
          this.$segmentIndex = value
        }
      },

      $segmentRatio: 0,

      segmentRatio: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.5 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentRatio
        },
        set: function (/*number*/ value) {
          this.$segmentRatio = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*compat.graphml.xaml.SliderEdgeLabelModel*/ exModel =
            this.$model instanceof compat.graphml.xaml.SliderEdgeLabelModel
              ? /*(compat.graphml.xaml.SliderEdgeLabelModel)*/ this.$model
              : null
        if (exModel === null) {
          exModel = new compat.graphml.xaml.SliderEdgeLabelModel.SliderEdgeLabelModel()
        }

        var /*boolean*/ fromSource =
            (this.$location & compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE) ===
            compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
        if (fromSource) {
          return exModel.createParameterFromSource(this.$segmentIndex, this.$segmentRatio)
        } else {
          return exModel.createParameterFromTarget(this.$segmentIndex, this.$segmentRatio)
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ShadowNodeStyleDecoratorExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'wrapped' })],

      constructor: function () {
        MarkupExtension.call(this)
      },

      $wrapped: null,

      wrapped: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$wrapped
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$wrapped = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new ShadowNodeStyleDecorator(this.$wrapped)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.TableRenderingOrder = new EnumDefinition(function () {
    return {
      COLUMNS_FIRST: 0,
      ROWS_FIRST: 1
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StringTrimming = new EnumDefinition(function () {
    return {
      CHARACTER: 1,
      ELLIPSIS_CHARACTER: 2,
      ELLIPSIS_WORD: 4,
      NONE: 0,
      WORD: 3
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.TableNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initTableNodeStyleExtension()
        this.$tableRenderingOrder = compat.graphml.xaml.TableRenderingOrder.COLUMNS_FIRST
      },

      $table: null,

      table: {
        $meta: function () {
          return [TypeAttribute(ITable.$class)]
        },
        get: function () {
          return this.$table
        },
        set: function (/*yfiles.graph.ITable*/ value) {
          this.$table = value
        }
      },

      $backgroundStyle: null,

      $backgroundStyleSet: false,

      $tableRenderingOrder: null,

      tableRenderingOrder: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.TableRenderingOrder.$class)]
        },
        get: function () {
          return this.$tableRenderingOrder
        },
        set: function (/*compat.graphml.xaml.TableRenderingOrder*/ value) {
          this.$tableRenderingOrder = value
        }
      },

      backgroundStyle: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$backgroundStyle
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$backgroundStyleSet = true
          this.$backgroundStyle = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.TableNodeStyle*/ newInstance = new TableNodeStyle()
        {
          newInstance.tableRenderingOrder = /*(yfiles.styles.TableRenderingOrder)*/ this.$tableRenderingOrder
          newInstance.table = this.$table
        }
        var /*yfiles.styles.TableNodeStyle*/ tableNodeStyle = newInstance
        if (this.$backgroundStyleSet) {
          tableNodeStyle.backgroundStyle = this.$backgroundStyle
        }
        return tableNodeStyle
      },

      $initTableNodeStyleExtension: function () {
        this.$tableRenderingOrder = compat.graphml.xaml.TableRenderingOrder.COLUMNS_FIRST
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.TextAlignment = new EnumDefinition(function () {
    return {
      CENTER: 0,
      LEFT: 1,
      RIGHT: 2
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.VerticalAlignment = new EnumDefinition(function () {
    return {
      CENTER: 0,
      TOP: 1,
      BOTTOM: 2
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.DynamicTableNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initDynamicTableNodeStyleExtension()
      },

      $backgroundStyle: null,

      $backgroundStyleSet: false,

      $tableRenderingOrder: null,

      tableRenderingOrder: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.TableRenderingOrder.$class)]
        },
        get: function () {
          return this.$tableRenderingOrder
        },
        set: function (/*compat.graphml.xaml.TableRenderingOrder*/ value) {
          this.$tableRenderingOrder = value
        }
      },

      backgroundStyle: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$backgroundStyle
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$backgroundStyleSet = true
          this.$backgroundStyle = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.TableNodeStyle*/ newInstance = new TableNodeStyle(
            null,
            new compat.graphml.xaml.DynamicTableNodeStyleExtension.DynamicTableNodeStyleRenderer()
          )
        {
          newInstance.tableRenderingOrder = /*(yfiles.styles.TableRenderingOrder)*/ this.$tableRenderingOrder
        }
        var /*yfiles.styles.TableNodeStyle*/ tableNodeStyle = newInstance
        if (this.$backgroundStyleSet) {
          tableNodeStyle.backgroundStyle = this.$backgroundStyle
        }
        return tableNodeStyle
      },

      $initDynamicTableNodeStyleExtension: function () {
        this.$tableRenderingOrder = compat.graphml.xaml.TableRenderingOrder.COLUMNS_FIRST
      },

      $static: {
        DynamicTableNodeStyleRenderer: new ClassDefinition(function () {
          return {
            $extends: TableNodeStyleRenderer,

            constructor: function () {
              TableNodeStyleRenderer.call(this)
            },

            getTable: function () {
              var /*Object*/ tmp
              return ITable.isInstance((tmp = this.$node.tag))
                ? /*(yfiles.graph.ITable)*/ tmp
                : null
            }
          }
        })
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SliderParameterLocation = new EnumDefinition(function () {
    return {
      $flags: true,
      LEFT: 1,
      RIGHT: 2,
      FROM_SOURCE: 4,
      FROM_TARGET: 8
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SideSliderEdgeLabelModel = new ClassDefinition(function () {
    return {
      $with: [ILabelModel, ILabelModelParameterProvider],

      constructor: function () {
        this.$initSideSliderEdgeLabelModel()
      },

      $leftSlider: null,

      $rightSlider: null,

      distance: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$leftSlider.$distance - 0.01
        },
        set: function (/*number*/ value) {
          if (value < 0) {
            throw new Exception('Value must be non-negative!', 'argument')
          }
          this.$leftSlider.$distance = value + 0.01
          this.$rightSlider.$distance = -(value + 0.01)
        }
      },

      edgeRelativePosition: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$leftSlider.$edgeRelativeDistance
        },
        set: function (/*boolean*/ value) {
          this.$leftSlider.$edgeRelativeDistance = value
          this.$rightSlider.$edgeRelativeDistance = value
        }
      },

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$leftSlider.angle
        },
        set: function (/*number*/ value) {
          this.$leftSlider.angle = value
          this.$rightSlider.angle = value
        }
      },

      getGeometry: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        var /*compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter*/ param =
            parameter instanceof compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter
              ? /*(compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter)*/ parameter
              : null
        if (param !== null) {
          return param.$parameter.model.getGeometry(label, param.$parameter)
        } else {
          return OrientedRectangle.EMPTY
        }
      },

      createDefaultParameter: function () {
        return new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
          this,
          compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE |
            compat.graphml.xaml.SliderParameterLocation.LEFT,
          this.$leftSlider.createDefaultParameter()
        )
      },

      getContext: function (
        /*yfiles.graph.ILabel*/ label,
        /*yfiles.graph.ILabelModelParameter*/ parameter
      ) {
        return yfiles.graph.Lookups.EMPTY
      },

      createParameterLeftFromSource: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
          this,
          compat.graphml.xaml.SliderParameterLocation.LEFT |
            compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE,
          this.$leftSlider.createParameterFromSource(segmentIndex, segmentRatio)
        )
      },

      createParameterRightFromSource: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
          this,
          compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE |
            compat.graphml.xaml.SliderParameterLocation.RIGHT,
          this.$rightSlider.createParameterFromSource(segmentIndex, segmentRatio)
        )
      },

      createParameterLeftFromTarget: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
          this,
          compat.graphml.xaml.SliderParameterLocation.FROM_TARGET |
            compat.graphml.xaml.SliderParameterLocation.LEFT,
          this.$leftSlider.createParameterFromTarget(segmentIndex, segmentRatio)
        )
      },

      createParameterRightFromTarget: function (/*number*/ segmentIndex, /*number*/ segmentRatio) {
        return new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
          this,
          compat.graphml.xaml.SliderParameterLocation.FROM_TARGET |
            compat.graphml.xaml.SliderParameterLocation.RIGHT,
          this.$rightSlider.createParameterFromTarget(segmentIndex, segmentRatio)
        )
      },

      lookup: function (/*yfiles.lang.Class*/ type) {
        if (type === ILabelModelParameterProvider.$class) {
          return this
        }
        if (type === ILabelModelParameterFinder.$class) {
          return DefaultLabelModelParameterFinder.INSTANCE
        }
        return null
      },

      getParameters: function (/*yfiles.graph.ILabel*/ label, /*yfiles.graph.ILabelModel*/ model) {
        var /*compat.graphml.xaml.SideSliderEdgeLabelModel*/
          mmodel = /*(compat.graphml.xaml.SideSliderEdgeLabelModel)*/ model
        var /*yfiles.collections.List<yfiles.graph.ILabelModelParameter>*/ list = new List()
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (
          tmpEnumerator = mmodel.$leftSlider
            .getParameters(label, mmodel.$leftSlider)
            .getEnumerator();
          tmpEnumerator.moveNext();

        ) {
          var /*compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter*/ parameter =
              tmpEnumerator.current
          {
            list.add(
              new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
                this,
                compat.graphml.xaml.SliderParameterLocation.LEFT |
                  (parameter.$segmentIndex >= 0
                    ? compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
                    : compat.graphml.xaml.SliderParameterLocation.FROM_TARGET),
                parameter
              )
            )
          }
        }
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator2
        for (
          tmpEnumerator2 = mmodel.$rightSlider
            .getParameters(label, mmodel.$rightSlider)
            .getEnumerator();
          tmpEnumerator2.moveNext();

        ) {
          var /*compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter*/ parameter =
              tmpEnumerator2.current
          {
            list.add(
              new compat.graphml.xaml.SideSliderEdgeLabelModel.SideSliderParameter(
                this,
                compat.graphml.xaml.SliderParameterLocation.RIGHT |
                  (parameter.$segmentIndex >= 0
                    ? compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
                    : compat.graphml.xaml.SliderParameterLocation.FROM_TARGET),
                parameter
              )
            )
          }
        }
        return list
      },

      $initSideSliderEdgeLabelModel: function () {
        this.$leftSlider = new compat.graphml.xaml.SliderEdgeLabelModel.FromDistanceAngleAndEdgeRelativeDistance(
          1,
          0,
          true
        )
        this.$rightSlider = new compat.graphml.xaml.SliderEdgeLabelModel.FromDistanceAngleAndEdgeRelativeDistance(
          -1,
          0,
          true
        )
      },

      $static: {
        SideSliderParameter: new ClassDefinition(function () {
          return {
            $with: [ILabelModelParameter, IMarkupExtensionConverter],

            constructor: function (
              /*compat.graphml.xaml.SideSliderEdgeLabelModel*/ model,
              /*compat.graphml.xaml.SliderParameterLocation*/ location,
              /*yfiles.graph.ILabelModelParameter*/ parameter
            ) {
              this.$model = model
              this.$location = location
              this.$parameter = parameter
            },

            $model: null,

            $location: 0,

            $parameter: null,

            model: {
              get: function () {
                return this.$model
              }
            },

            supports: function (/*yfiles.graph.ILabel*/ label) {
              return this.$parameter.supports(label)
            },

            clone: function () {
              return this
            },

            canConvert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              return true
            },

            convert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              var /*compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter*/
                parameter = /*(compat.graphml.xaml.SliderEdgeLabelModel.SliderParameter)*/ this
                  .$parameter
              if (
                (this.$location & compat.graphml.xaml.SliderParameterLocation.FROM_TARGET) ===
                compat.graphml.xaml.SliderParameterLocation.FROM_TARGET
              ) {
                var /*compat.graphml.xaml.SideSliderLabelModelParameterExtension*/
                  newInstance = new compat.graphml.xaml.SideSliderLabelModelParameterExtension()
                {
                  newInstance.location = this.$location
                  newInstance.segmentIndex = -1 - parameter.$segmentIndex
                  newInstance.segmentRatio = 1 - parameter.$ratio
                  newInstance.model = this.$model
                }
                return newInstance
              } else {
                var /*compat.graphml.xaml.SideSliderLabelModelParameterExtension*/
                  newInstance = new compat.graphml.xaml.SideSliderLabelModelParameterExtension()
                {
                  newInstance.location = this.$location
                  newInstance.segmentIndex = parameter.$segmentIndex
                  newInstance.segmentRatio = parameter.$ratio
                  newInstance.model = this.$model
                }
                return newInstance
              }
            }
          }
        })
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SideSliderLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$segmentRatio = 0.5
        this.$location =
          compat.graphml.xaml.SliderParameterLocation.LEFT |
          compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
      },

      $model: null,

      model: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ defaultValue: null }),
            TypeAttribute(ILabelModel.$class)
          ]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      $location: 0,

      location: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.SliderParameterLocation.$class)]
        },
        get: function () {
          return this.$location
        },
        set: function (/*compat.graphml.xaml.SliderParameterLocation*/ value) {
          this.$location = value
        }
      },

      $segmentIndex: 0,

      segmentIndex: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentIndex
        },
        set: function (/*number*/ value) {
          this.$segmentIndex = value
        }
      },

      $segmentRatio: 0,

      segmentRatio: {
        $meta: function () {
          return [GraphMLAttribute().init({ defaultValue: 0.5 }), TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$segmentRatio
        },
        set: function (/*number*/ value) {
          this.$segmentRatio = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*compat.graphml.xaml.SideSliderEdgeLabelModel*/ exModel =
            this.$model instanceof compat.graphml.xaml.SideSliderEdgeLabelModel
              ? /*(compat.graphml.xaml.SideSliderEdgeLabelModel)*/ this.$model
              : null
        if (exModel === null) {
          exModel = new compat.graphml.xaml.SideSliderEdgeLabelModel()
        }

        var /*boolean*/ fromSource =
            (this.$location & compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE) ===
            compat.graphml.xaml.SliderParameterLocation.FROM_SOURCE
        var /*boolean*/ left =
            (this.$location & compat.graphml.xaml.SliderParameterLocation.LEFT) ===
            compat.graphml.xaml.SliderParameterLocation.LEFT
        if (fromSource) {
          if (left) {
            return exModel.createParameterLeftFromSource(this.$segmentIndex, this.$segmentRatio)
          } else {
            return exModel.createParameterRightFromSource(this.$segmentIndex, this.$segmentRatio)
          }
        } else {
          if (left) {
            return exModel.createParameterLeftFromTarget(this.$segmentIndex, this.$segmentRatio)
          } else {
            return exModel.createParameterRightFromTarget(this.$segmentIndex, this.$segmentRatio)
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ShapeNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initShapeNodeStyleExtension()
        this.$shape = compat.graphml.xaml.ShapeNodeShape.RECTANGLE
        this.$brush = Fill.WHITE
        this.$pen = Stroke.BLACK
      },

      $pen: null,

      pen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$pen
        },
        set: function (/*yfiles.view.Stroke*/ value) {
          this.$pen = value
        }
      },

      $brush: null,

      brush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$brush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$brush = value
        }
      },

      $shape: null,

      shape: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.ShapeNodeShape.$class)]
        },
        get: function () {
          return this.$shape
        },
        set: function (/*compat.graphml.xaml.ShapeNodeShape*/ value) {
          this.$shape = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.ShapeNodeStyle*/ newInstance = new ShapeNodeStyle()
        {
          newInstance.fill = this.$brush
          newInstance.stroke = this.$pen
          newInstance.shape = /*(yfiles.styles.ShapeNodeShape)*/ this.$shape | 0
        }
        return newInstance
      },

      $initShapeNodeStyleExtension: function () {
        this.$shape = compat.graphml.xaml.ShapeNodeShape.RECTANGLE
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SimpleLabelStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initSimpleLabelStyleExtension()
        this.$textBrush = Fill.BLACK
        this.$autoFlip = true
        this.$trimming = compat.graphml.xaml.StringTrimming.NONE
        this.$clipText = true
        this.$textAlignment = compat.graphml.xaml.TextAlignment.LEFT
        this.$verticalTextAlignment = compat.graphml.xaml.VerticalAlignment.TOP
      },

      $backgroundBrush: null,

      backgroundBrush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$backgroundBrush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$backgroundBrush = value
        }
      },

      $verticalTextAlignment: null,

      verticalTextAlignment: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.VerticalAlignment.$class)]
        },
        get: function () {
          return this.$verticalTextAlignment
        },
        set: function (/*compat.graphml.xaml.VerticalAlignment*/ value) {
          this.$verticalTextAlignment = value
        }
      },

      $textAlignment: null,

      textAlignment: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.TextAlignment.$class)]
        },
        get: function () {
          return this.$textAlignment
        },
        set: function (/*compat.graphml.xaml.TextAlignment*/ value) {
          this.$textAlignment = value
        }
      },

      $clipText: false,

      clipText: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$clipText
        },
        set: function (/*boolean*/ value) {
          this.$clipText = value
        }
      },

      $trimming: null,

      trimming: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.StringTrimming.$class)]
        },
        get: function () {
          return this.$trimming
        },
        set: function (/*compat.graphml.xaml.StringTrimming*/ value) {
          this.$trimming = value
        }
      },

      $backgroundPen: null,

      backgroundPen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$backgroundPen
        },
        set: function (/*yfiles.view.Stroke*/ value) {
          this.$backgroundPen = value
        }
      },

      $typeface: null,

      typeface: {
        $meta: function () {
          return [TypeAttribute(Font.$class)]
        },
        get: function () {
          return this.$typeface
        },
        set: function (/*yfiles.view.Font*/ value) {
          this.$typeface = value
        }
      },

      $autoFlip: false,

      autoFlip: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoFlip
        },
        set: function (/*boolean*/ value) {
          this.$autoFlip = value
        }
      },

      $textBrush: null,

      textBrush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$textBrush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$textBrush = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.DefaultLabelStyle*/ newInstance = new DefaultLabelStyle()
        {
          newInstance.autoFlip = this.$autoFlip
          newInstance.backgroundFill = this.$backgroundBrush
          newInstance.backgroundStroke = this.$backgroundPen
          newInstance.clipText = this.$clipText
          newInstance.textFill = this.$textBrush
          newInstance.font = this.$typeface
          newInstance.horizontalTextAlignment = /*(yfiles.view.HorizontalTextAlignment)*/ this.$textAlignment
          newInstance.verticalTextAlignment = /*(yfiles.view.HorizontalTextAlignment)*/ this.$verticalTextAlignment
          newInstance.wrapping = /*(yfiles.view.TextWrapping)*/ this.$trimming
        }
        return newInstance
      },

      $initSimpleLabelStyleExtension: function () {
        this.$verticalTextAlignment = compat.graphml.xaml.VerticalAlignment.CENTER
        this.$textAlignment = compat.graphml.xaml.TextAlignment.CENTER
        this.$trimming = compat.graphml.xaml.StringTrimming.CHARACTER
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.SimplePortStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $brush: null,

      brush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$brush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$brush = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.NodeStylePortStyleAdapter*/ newInstance = new NodeStylePortStyleAdapter()
        {
          newInstance.renderSize = new Size(4, 4)
          var /*yfiles.styles.ShapeNodeStyle*/ newInstance2 = new ShapeNodeStyle()
          {
            newInstance2.shape = ShapeNodeShape.ELLIPSE
            newInstance2.fill = this.$brush
            newInstance2.stroke = Stroke.TRANSPARENT
          }
          newInstance.nodeStyle = newInstance2
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.LineToExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initLineToExtension()
      },

      $point: null,

      point: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$point
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$point = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.LineTo*/ newInstance = new yfiles.graphml.LineTo()
        {
          newInstance.point = this.$point
        }
        return newInstance
      },

      $initLineToExtension: function () {
        this.$point = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NodeStylePortStyleAdapterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initNodeStylePortStyleAdapterExtension()
        this.$renderSize = new Size(5, 5)
      },

      $nodeStyle: null,

      nodeStyle: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$nodeStyle
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$nodeStyle = value
        }
      },

      $renderSize: null,

      renderSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$renderSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$renderSize = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.NodeStylePortStyleAdapter*/ newInstance = new NodeStylePortStyleAdapter()
        {
          newInstance.nodeStyle = this.$nodeStyle
          newInstance.renderSize = this.$renderSize
        }
        return newInstance
      },

      $initNodeStylePortStyleAdapterExtension: function () {
        this.$renderSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.GeneralPathNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$pen = Stroke.BLACK
        this.$brush = Fill.WHITE
      },

      $path: null,

      path: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$path
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$path = value
        }
      },

      $brush: null,

      brush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$brush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$brush = value
        }
      },

      $pen: null,

      pen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$pen
        },
        set: function (/*yfiles.view.Stroke*/ value) {
          this.$pen = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.GeneralPathNodeStyle*/ newInstance = new GeneralPathNodeStyle()
        {
          newInstance.path = this.$path
          newInstance.fill = this.$brush
          newInstance.stroke = this.$pen
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.FreeNodeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new FreeNodeLabelModel()
      },

      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(FreeNodeLabelModel.$class)]
          },
          get: function () {
            return FreeNodeLabelModel.INSTANCE
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.RatioAnchoredLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initRatioAnchoredLabelModelParameterExtension()
        this.$labelOffset = new Point(0, 0)
        this.$labelRatio = new Point(0, 0)
        this.$layoutOffset = new Point(0, 0)
        this.$layoutRatio = new Point(0, 0)
      },

      $layoutRatio: null,

      layoutRatio: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$layoutRatio
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$layoutRatio = value
        }
      },

      $layoutOffset: null,

      layoutOffset: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$layoutOffset
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$layoutOffset = value
        }
      },

      $labelRatio: null,

      labelRatio: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$labelRatio
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$labelRatio = value
        }
      },

      $labelOffset: null,

      labelOffset: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$labelOffset
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$labelOffset = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.RatioAnchoredLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.RatioAnchoredLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.angle = this.$angle
          newInstance.labelOffset = this.$labelOffset
          newInstance.labelRatio = this.$labelRatio
          newInstance.layoutOffset = this.$layoutOffset
          newInstance.layoutRatio = this.$layoutRatio
        }
        var /*yfiles.graphml.RatioAnchoredLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initRatioAnchoredLabelModelParameterExtension: function () {
        this.$layoutRatio = new Point(0, 0)
        this.$layoutOffset = new Point(0, 0)
        this.$labelRatio = new Point(0, 0)
        this.$labelOffset = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.LayoutAnchoredLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initLayoutAnchoredLabelModelParameterExtension()
        this.$offset = new Point(0, 0)
      },

      $offset: null,

      offset: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$offset
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$offset = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.RatioAnchoredLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.RatioAnchoredLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.angle = this.$angle
          newInstance.labelOffset = Point.ORIGIN
          newInstance.labelRatio = Point.ORIGIN
          newInstance.layoutOffset = this.$offset
          newInstance.layoutRatio = Point.ORIGIN
        }
        var /*yfiles.graphml.RatioAnchoredLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initLayoutAnchoredLabelModelParameterExtension: function () {
        this.$offset = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.CenterAnchoredLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initCenterAnchoredLabelModelParameterExtension()
        this.$offset = new Point(0, 0)
      },

      $offset: null,

      offset: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$offset
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$offset = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.RatioAnchoredLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.RatioAnchoredLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.angle = this.$angle
          newInstance.labelOffset = Point.ORIGIN
          newInstance.labelRatio = Point.ORIGIN
          newInstance.layoutOffset = this.$offset
          newInstance.layoutRatio = new Point(0.5, 0.5)
        }
        var /*yfiles.graphml.RatioAnchoredLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initCenterAnchoredLabelModelParameterExtension: function () {
        this.$offset = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.FreeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new FreeLabelModel()
      },

      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(FreeLabelModel.$class)]
          },
          get: function () {
            return FreeLabelModel.INSTANCE
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.FixedLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initFixedLabelModelParameterExtension()
        this.$anchorLocation = new Point(0, 0)
      },

      $anchorLocation: null,

      anchorLocation: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$anchorLocation
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$anchorLocation = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.FixedLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.FixedLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.angle = this.$angle
          newInstance.anchorLocation = this.$anchorLocation
        }
        var /*yfiles.graphml.FixedLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initFixedLabelModelParameterExtension: function () {
        this.$anchorLocation = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.AnchoredLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $anchorLocation: null,

      anchorLocation: {
        $meta: function () {
          return [TypeAttribute(IPoint.$class)]
        },
        get: function () {
          return this.$anchorLocation
        },
        set: function (/*yfiles.geometry.IPoint*/ value) {
          this.$anchorLocation = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.AnchoredLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.AnchoredLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.angle = this.$angle
          newInstance.anchorLocation = this.$anchorLocation
        }
        var /*yfiles.graphml.AnchoredLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.FreeEdgeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $edgeRelativeAngle: false,

      edgeRelativeAngle: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$edgeRelativeAngle
        },
        set: function (/*boolean*/ value) {
          this.$edgeRelativeAngle = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.FreeEdgeLabelModel*/ newInstance = new FreeEdgeLabelModel()
        {
          newInstance.edgeRelativeAngle = this.$edgeRelativeAngle
        }
        return newInstance
      },

      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(FreeEdgeLabelModel.$class)]
          },
          get: function () {
            return FreeEdgeLabelModel.INSTANCE
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.FreeEdgeLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$ratio = 0.5
      },

      $ratio: 0,

      ratio: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$ratio
        },
        set: function (/*number*/ value) {
          this.$ratio = value
        }
      },

      $distance: 0,

      distance: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$distance
        },
        set: function (/*number*/ value) {
          this.$distance = value
        }
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.FreeEdgeLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.FreeEdgeLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.ratio = this.$ratio
          newInstance.angle = this.$angle
          newInstance.distance = this.$distance
        }
        var /*yfiles.graphml.FreeEdgeLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ExteriorLabelModelPosition = new EnumDefinition(function () {
    return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3,
      NORTH_EAST: 4,
      SOUTH_EAST: 5,
      NORTH_WEST: 6,
      SOUTH_WEST: 7
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ExteriorLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initExteriorLabelModelExtension()
        this.$insets = new Insets(0)
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.ExteriorLabelModel*/ newInstance = new ExteriorLabelModel()
        {
          newInstance.insets = this.$insets
        }
        return newInstance
      },

      $initExteriorLabelModelExtension: function () {
        this.$insets = new Insets(0)
      },

      $static: {
        NORTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.NORTH
          }
        },

        EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.EAST
          }
        },

        SOUTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.SOUTH
          }
        },

        SOUTH_EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.SOUTH_EAST
          }
        },

        SOUTH_WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.SOUTH_WEST
          }
        },

        WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.WEST
          }
        },

        NORTH_EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.NORTH_EAST
          }
        },

        NORTH_WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return ExteriorLabelModel.NORTH_WEST
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ExteriorLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initExteriorLabelModelParameterExtension()
        this.$position = compat.graphml.xaml.ExteriorLabelModelPosition.NORTH
      },

      $position: null,

      position: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.ExteriorLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*compat.graphml.xaml.ExteriorLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.ExteriorLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.ExteriorLabelModelParameterExtension()
        {
          newInstance.position = /*(yfiles.graph.ExteriorLabelModel.ExteriorLabelModelPosition)*/ this.$position
          newInstance.model = this.$model
        }
        var /*yfiles.graphml.ExteriorLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initExteriorLabelModelParameterExtension: function () {
        this.$position = compat.graphml.xaml.ExteriorLabelModelPosition.NORTH
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.DescriptorWrapperLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'innerModel' })],

      constructor: function () {
        MarkupExtension.call(this)
      },

      $descriptor: null,

      descriptor: {
        $meta: function () {
          return [TypeAttribute(ILabelCandidateDescriptor.$class)]
        },
        get: function () {
          return this.$descriptor
        },
        set: function (/*yfiles.graph.ILabelCandidateDescriptor*/ value) {
          this.$descriptor = value
        }
      },

      $innerModel: null,

      innerModel: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$innerModel
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$innerModel = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.DescriptorWrapperLabelModel*/
          newInstance = new DescriptorWrapperLabelModel()
        {
          newInstance.descriptor = this.$descriptor
          newInstance.innerModel = this.$innerModel
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.DescriptorWrapperLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $parameter: null,

      parameter: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$parameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$parameter = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(DescriptorWrapperLabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.DescriptorWrapperLabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new yfiles.graphml.DescriptorWrapperLabelModelParameterExtension(
          this.$parameter,
          this.$model
        ).provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.DefaultArrowExtension = new ClassDefinition(function () {
    return {
      $static: {
        NONE: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.NONE
          }
        },

        SIMPLE: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.SIMPLE
          }
        },

        DEFAULT: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.DEFAULT
          }
        },

        SHORT: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.SHORT
          }
        },

        DIAMOND: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.DIAMOND
          }
        },

        CROSS: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.CROSS
          }
        },

        CIRCLE: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.CIRCLE
          }
        },

        TRIANGLE: {
          $meta: function () {
            return [TypeAttribute(IArrow.$class)]
          },
          get: function () {
            return IArrow.TRIANGLE
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ArrowExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$scale = 1.0
        this.$brush = Fill.BLACK
        this.$pen = Stroke.BLACK
        this.$type = ArrowType.DEFAULT
      },

      $pen: null,

      pen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$pen
        },
        set: function (/*yfiles.view.Stroke*/ value) {
          this.$pen = value
        }
      },

      $brush: null,

      brush: {
        $meta: function () {
          return [TypeAttribute(Fill.$class)]
        },
        get: function () {
          return this.$brush
        },
        set: function (/*yfiles.view.Fill*/ value) {
          this.$brush = value
        }
      },

      $cropLength: 0,

      cropLength: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$cropLength
        },
        set: function (/*number*/ value) {
          this.$cropLength = value
        }
      },

      $scale: 0,

      scale: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$scale
        },
        set: function (/*number*/ value) {
          this.$scale = value
        }
      },

      $type: 0,

      type: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.ArrowType.$class)]
        },
        get: function () {
          return this.$type
        },
        set: function (/*compat.graphml.xaml.ArrowType*/ value) {
          this.$type = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.Arrow*/ newInstance = new Arrow()
        {
          newInstance.stroke = this.$pen
          newInstance.fill = this.$brush
          newInstance.type = /*(yfiles.styles.ArrowType)*/ this.$type
          newInstance.cropLength = this.$cropLength
          newInstance.scale = this.$scale
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ControlStyleBaseExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,
      $abstract: true,

      constructor: function () {
        MarkupExtension.call(this)
        this.$contextLookup = IContextLookup.EMPTY_CONTEXT_LOOKUP
      },

      $styleTag: null,

      styleTag: {
        $meta: function () {
          return [TypeAttribute(YObject.$class)]
        },
        get: function () {
          return this.$styleTag
        },
        set: function (/*Object*/ value) {
          this.$styleTag = value
        }
      },

      $contextLookup: null,

      contextLookup: {
        $meta: function () {
          return [TypeAttribute(IContextLookup.$class)]
        },
        get: function () {
          return this.$contextLookup
        },
        set: function (/*yfiles.graph.IContextLookup*/ value) {
          this.$contextLookup = value
        }
      },

      $userTagProvider: null,

      userTagProvider: {
        $meta: function () {
          return [
            GraphMLAttribute().init({
              valueSerializer:
                compat.graphml.xaml.ControlStyleBaseExtension.NullValueSerializer.$class
            }),
            TypeAttribute(YObject.$class)
          ]
        },
        get: function () {
          return this.$userTagProvider
        },
        set: function (/*Object*/ value) {
          this.$userTagProvider = value
        }
      },

      $static: {
        NullValueSerializer: new ClassDefinition(function () {
          return {
            $extends: ValueSerializer,

            constructor: function () {
              ValueSerializer.call(this)
            },

            convertFromString: function (
              /*string*/ value,
              /*yfiles.graphml.IValueSerializerContext*/ context
            ) {
              return value
            },

            canConvertFromString: function (
              /*string*/ value,
              /*yfiles.graphml.IValueSerializerContext*/ context
            ) {
              return true
            }
          }
        }),

        EmptyLookup: new ClassDefinition(function () {
          return {
            $with: [IContextLookup],

            contextLookup: function (/*Object*/ item, /*yfiles.lang.Class*/ type) {
              return null
            },

            $static: {
              INSTANCE: null,

              $clinit: function () {
                compat.graphml.xaml.ControlStyleBaseExtension.EmptyLookup.INSTANCE = new compat.graphml.xaml.ControlStyleBaseExtension.EmptyLookup()
              }
            }
          }
        })
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.CompositeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'labelModels' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initCompositeLabelModelExtension()
      },

      $labelModels: null,

      labelModels: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$labelModels
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.CompositeLabelModel*/ coreModel = new CompositeLabelModel()
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$labelModels.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*yfiles.graph.ILabelModel*/ labelModel = tmpEnumerator.current
          {
            coreModel.labelModels.add(labelModel)
          }
        }
        return coreModel
      },

      $initCompositeLabelModelExtension: function () {
        this.$labelModels = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.CompositeLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $parameter: null,

      parameter: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$parameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$parameter = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.CompositeLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.CompositeLabelModelParameterExtension()
        {
          newInstance.parameter = this.$parameter
          newInstance.model = this.$model
        }
        var /*yfiles.graphml.CompositeLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.BendAnchoredPortLocationModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new BendAnchoredPortLocationModel()
      },

      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(BendAnchoredPortLocationModel.$class)]
          },
          get: function () {
            return BendAnchoredPortLocationModel.INSTANCE
          }
        },

        FIRST_BEND: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return BendAnchoredPortLocationModel.FIRST_BEND
          }
        },

        LAST_BEND: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return BendAnchoredPortLocationModel.LAST_BEND
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.BendAnchoredParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $index: 0,

      index: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$index
        },
        set: function (/*number*/ value) {
          this.$index = value
        }
      },

      $fromSource: false,

      fromSource: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$fromSource
        },
        set: function (/*boolean*/ value) {
          this.$fromSource = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.BendAnchoredParameterExtension*/
          newInstance = new yfiles.graphml.BendAnchoredParameterExtension()
        {
          newInstance.index = this.$index
          newInstance.fromSource = this.$fromSource
        }
        var /*yfiles.graphml.BendAnchoredParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ArrowType = new EnumDefinition(function () {
    return {
      DEFAULT: 1,
      SIMPLE: 2,
      SHORT: 3,
      DIAMOND: 4,
      NONE: 5,
      CIRCLE: 6,
      CROSS: 7,
      TRIANGLE: 8
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ArcEdgeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$sourceArrow = IArrow.NONE
        this.$targetArrow = IArrow.NONE
        this.$pen = Stroke.BLACK
      },

      $pen: null,

      pen: {
        $meta: function () {
          return [TypeAttribute(Stroke.$class)]
        },
        get: function () {
          return this.$pen
        },
        set: function (/*yfiles.view.Stroke*/ value) {
          this.$pen = value
        }
      },

      $height: 0,

      height: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$height
        },
        set: function (/*number*/ value) {
          this.$height = value
        }
      },

      $ratio: false,

      ratio: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$ratio
        },
        set: function (/*boolean*/ value) {
          this.$ratio = value
        }
      },

      $provideHeightHandle: false,

      provideHeightHandle: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$provideHeightHandle
        },
        set: function (/*boolean*/ value) {
          this.$provideHeightHandle = value
        }
      },

      $targetArrow: null,

      targetArrow: {
        $meta: function () {
          return [TypeAttribute(IArrow.$class)]
        },
        get: function () {
          return this.$targetArrow
        },
        set: function (/*yfiles.styles.IArrow*/ value) {
          this.$targetArrow = value
        }
      },

      $sourceArrow: null,

      sourceArrow: {
        $meta: function () {
          return [TypeAttribute(IArrow.$class)]
        },
        get: function () {
          return this.$sourceArrow
        },
        set: function (/*yfiles.styles.IArrow*/ value) {
          this.$sourceArrow = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.ArcEdgeStyle*/ newInstance = new ArcEdgeStyle()
        {
          newInstance.fixedHeight = !this.$ratio
          newInstance.height = this.$height
          newInstance.provideHeightHandle = this.$provideHeightHandle
          newInstance.sourceArrow = this.$sourceArrow
          newInstance.targetArrow = this.$targetArrow
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.DynamicAnchoredParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$anchor = new Point(0, 0)
      },

      $anchor: null,

      anchor: {
        $meta: function () {
          return [TypeAttribute(IPoint.$class)]
        },
        get: function () {
          return this.$anchor
        },
        set: function (/*yfiles.geometry.IPoint*/ value) {
          this.$anchor = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new yfiles.graphml.DynamicAnchoredParameterExtension(this.$anchor).provideValue(
          serviceProvider
        )
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.GenericLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $index: 0,

      index: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$index
        },
        set: function (/*number*/ value) {
          this.$index = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(GenericLabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.GenericLabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.GenericLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.GenericLabelModelParameterExtension()
        {
          newInstance.index = this.$index
          newInstance.model = this.$model
        }
        var /*yfiles.graphml.GenericLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.PanelNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initPanelNodeStyleExtension()
        this.$insets = new Insets(5)
        this.$labelInsetsColor = Color.LIGHT_GRAY
        this.$color = Color.BLACK
      },

      $color: null,

      color: {
        $meta: function () {
          return [TypeAttribute(Color.$class)]
        },
        get: function () {
          return this.$color
        },
        set: function (/*yfiles.view.Color*/ value) {
          this.$color = value
        }
      },

      $labelInsetsColor: null,

      labelInsetsColor: {
        $meta: function () {
          return [TypeAttribute(Color.$class)]
        },
        get: function () {
          return this.$labelInsetsColor
        },
        set: function (/*yfiles.view.Color*/ value) {
          this.$labelInsetsColor = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.PanelNodeStyle*/ newInstance = new PanelNodeStyle()
        {
          newInstance.color = this.$color
          newInstance.insets = this.$insets
          newInstance.labelInsetsColor = this.$labelInsetsColor
        }
        return newInstance
      },

      $initPanelNodeStyleExtension: function () {
        this.$insets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.GenericModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'parameters' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initGenericModelExtension()
      },

      $parameters: null,

      parameters: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(List.$class)
          ]
        },
        get: function () {
          return this.$parameters
        }
      },

      $default: 0,

      default: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$default
        },
        set: function (/*number*/ value) {
          this.$default = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.GenericLabelModelExtension*/
          newInstance = new yfiles.graphml.GenericLabelModelExtension()
        {
          newInstance.default = this.$default
        }
        var /*yfiles.graphml.GenericLabelModelExtension*/ coreExtension = newInstance
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$parameters.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*Object*/ parameter = tmpEnumerator.current
          {
            coreExtension.parameters.add(parameter)
          }
        }
        return coreExtension.provideValue(serviceProvider)
      },

      $initGenericModelExtension: function () {
        this.$parameters = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.BevelNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$color = Color.BLACK
      },

      $inset: 0,

      inset: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$inset
        },
        set: function (/*number*/ value) {
          this.$inset = value
        }
      },

      $radius: 0,

      radius: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$radius
        },
        set: function (/*number*/ value) {
          this.$radius = value
        }
      },

      $color: null,

      color: {
        $meta: function () {
          return [TypeAttribute(Color.$class)]
        },
        get: function () {
          return this.$color
        },
        set: function (/*yfiles.view.Color*/ value) {
          this.$color = value
        }
      },

      $drawShadow: false,

      drawShadow: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$drawShadow
        },
        set: function (/*boolean*/ value) {
          this.$drawShadow = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.BevelNodeStyle*/ newInstance = new BevelNodeStyle()
        {
          newInstance.inset = this.$inset
          newInstance.color = this.$color
          newInstance.radius = this.$radius
          newInstance.drawShadow = this.$drawShadow
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NodeStyleLabelStyleAdapterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initNodeStyleLabelStyleAdapterExtension()
        this.$labelStyleInsets = new Insets(0)
        this.$autoFlip = true
      },

      $nodeStyle: null,

      nodeStyle: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$nodeStyle
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$nodeStyle = value
        }
      },

      $labelStyle: null,

      labelStyle: {
        $meta: function () {
          return [TypeAttribute(ILabelStyle.$class)]
        },
        get: function () {
          return this.$labelStyle
        },
        set: function (/*yfiles.styles.ILabelStyle*/ value) {
          this.$labelStyle = value
        }
      },

      $autoFlip: false,

      autoFlip: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoFlip
        },
        set: function (/*boolean*/ value) {
          this.$autoFlip = value
        }
      },

      $labelStyleInsets: null,

      labelStyleInsets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$labelStyleInsets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$labelStyleInsets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.NodeStyleLabelStyleAdapter*/
          newInstance = new NodeStyleLabelStyleAdapter()
        {
          newInstance.autoFlip = this.$autoFlip
          newInstance.labelStyle = this.$labelStyle
          newInstance.labelStyleInsets = this.$labelStyleInsets
          newInstance.nodeStyle = this.$nodeStyle
        }
        return newInstance
      },

      $initNodeStyleLabelStyleAdapterExtension: function () {
        this.$labelStyleInsets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NodeScaledPortLocationModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new FreeNodePortLocationModel()
      },

      $static: {
        INSTANCE: {
          $meta: function () {
            return [TypeAttribute(FreeNodePortLocationModel.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.INSTANCE
          }
        },

        NODE_CENTER_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_CENTER_ANCHORED
          }
        },

        NODE_LEFT_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_LEFT_ANCHORED
          }
        },

        NODE_RIGHT_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
          }
        },

        NODE_TOP_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_TOP_ANCHORED
          }
        },

        NODE_BOTTOM_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
          }
        },

        NODE_TOP_LEFT_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_TOP_LEFT_ANCHORED
          }
        },

        NODE_TOP_RIGHT_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_TOP_RIGHT_ANCHORED
          }
        },

        NODE_BOTTOM_RIGHT_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_BOTTOM_RIGHT_ANCHORED
          }
        },

        NODE_BOTTOM_LEFT_ANCHORED: {
          $meta: function () {
            return [TypeAttribute(IPortLocationModelParameter.$class)]
          },
          get: function () {
            return FreeNodePortLocationModel.NODE_BOTTOM_LEFT_ANCHORED
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NodeScaledParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initNodeScaledParameterExtension()
      },

      $offset: null,

      offset: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$offset
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$offset = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.FreeNodePortLocationModelParameterExtension*/
          newInstance = new yfiles.graphml.FreeNodePortLocationModelParameterExtension()
        {
          newInstance.ratio = new Point(0.5, 0.5).add(this.$offset)
          newInstance.offset = Point.ORIGIN
        }
        var /*yfiles.graphml.FreeNodePortLocationModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initNodeScaledParameterExtension: function () {
        this.$offset = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StringTemplateNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.xaml.ControlStyleBaseExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'svgContent' })],

      constructor: function () {
        compat.graphml.xaml.ControlStyleBaseExtension.call(this)
        this.$initStringNodeControlNodeStyleExtension()
        this.$minimumSize = Size.EMPTY
        this.$insets = new Insets(5)
      },

      $svgContent: null,

      svgContent: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$svgContent
        },
        set: function (/*string*/ value) {
          this.$svgContent = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      $minimumSize: null,

      minimumSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$minimumSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$minimumSize = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.StringTemplateNodeStyle*/ newInstance = new StringTemplateNodeStyle()
        {
          newInstance.insets = this.$insets
          newInstance.styleTag = this.$styleTag
          newInstance.normalizedOutline = this.$outlineShape
          newInstance.minimumSize = this.$minimumSize
          newInstance.svgContent = this.$svgContent
          newInstance.contextLookup = this.$contextLookup
        }
        return newInstance
      },

      $initStringNodeControlNodeStyleExtension: function () {
        this.$insets = new Insets(0)
        this.$minimumSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.TemplateNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.xaml.ControlStyleBaseExtension,

      constructor: function () {
        compat.graphml.xaml.ControlStyleBaseExtension.call(this)
        this.$initNodeControlNodeStyleExtension()
        this.$minimumSize = Size.EMPTY
        this.$insets = new Insets(5)
      },

      $styleResourceKey: null,

      styleResourceKey: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$styleResourceKey
        },
        set: function (/*string*/ value) {
          this.$styleResourceKey = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      $minimumSize: null,

      minimumSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$minimumSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$minimumSize = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.TemplateNodeStyle*/ newInstance = new TemplateNodeStyle()
        {
          newInstance.insets = this.$insets
          newInstance.styleTag = this.$styleTag
          newInstance.normalizedOutline = this.$outlineShape
          newInstance.styleResourceKey = this.$styleResourceKey
          newInstance.minimumSize = this.$minimumSize
          newInstance.contextLookup = this.$contextLookup
        }
        return newInstance
      },

      $initNodeControlNodeStyleExtension: function () {
        this.$insets = new Insets(0)
        this.$minimumSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NinePositionsEdgeLabelModelPosition = new EnumDefinition(function () {
    return {
      $flags: true,
      SOURCE_ABOVE: 17,
      CENTER_ABOVE: 20,
      TARGET_ABOVE: 18,
      SOURCE_CENTERED: 65,
      CENTER_CENTERED: 68,
      TARGET_CENTERED: 66,
      SOURCE_BELOW: 33,
      CENTER_BELOW: 36,
      TARGET_BELOW: 34,
      ABOVE_CENTERED_BELOW_MASK: 112,
      SOURCE_CENTER_TARGET_MASK: 7,
      SOURCE: 1,
      CENTER: 4,
      TARGET: 2,
      ABOVE: 16,
      CENTERED: 64,
      BELOW: 32
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NinePositionsEdgeLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$distance = 10
      },

      $angle: 0,

      angle: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$angle
        },
        set: function (/*number*/ value) {
          this.$angle = value
        }
      },

      $distance: 0,

      distance: {
        $meta: function () {
          return [TypeAttribute(YNumber.$class)]
        },
        get: function () {
          return this.$distance
        },
        set: function (/*number*/ value) {
          this.$distance = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.NinePositionsEdgeLabelModel*/
          newInstance = new NinePositionsEdgeLabelModel()
        {
          newInstance.angle = this.$angle
          newInstance.distance = this.$distance
        }
        return newInstance
      },

      $static: {
        SOURCE_ABOVE: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.SOURCE_ABOVE
          }
        },

        CENTER_ABOVE: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.CENTER_ABOVE
          }
        },

        TARGET_ABOVE: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.TARGET_ABOVE
          }
        },

        SOURCE_CENTERED: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.SOURCE_CENTERED
          }
        },

        CENTER_CENTERED: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.CENTER_CENTERED
          }
        },

        TARGET_CENTERED: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.TARGET_CENTERED
          }
        },

        SOURCE_BELOW: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.SOURCE_BELOW
          }
        },

        CENTER_BELOW: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.CENTER_BELOW
          }
        },

        TARGET_BELOW: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return NinePositionsEdgeLabelModel.TARGET_BELOW
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.NinePositionsEdgeLabelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$position = compat.graphml.xaml.NinePositionsEdgeLabelModelPosition.CENTER_CENTERED
      },

      $position: 0,

      position: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.NinePositionsEdgeLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*compat.graphml.xaml.NinePositionsEdgeLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.NinePositionsEdgeLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.NinePositionsEdgeLabelModelParameterExtension()
        {
          newInstance.model = this.$model
          newInstance.position = /*(yfiles.graph.NinePositionsEdgeLabelModel.NinePositionsEdgeLabelModelPosition)*/ this.$position
        }
        var /*yfiles.graphml.NinePositionsEdgeLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.CloseExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return new yfiles.graphml.Close()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.QuadToExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initQuadToExtension()
      },

      $point: null,

      point: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$point
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$point = value
        }
      },

      $controlPoint: null,

      controlPoint: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$controlPoint
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$controlPoint = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.QuadTo*/ newInstance = new yfiles.graphml.QuadTo()
        {
          newInstance.point = this.$point
          newInstance.controlPoint = this.$controlPoint
        }
        return newInstance
      },

      $initQuadToExtension: function () {
        this.$point = new Point(0, 0)
        this.$controlPoint = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.CubicToExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initCubicToExtension()
      },

      $point: null,

      point: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$point
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$point = value
        }
      },

      $controlPoint2: null,

      controlPoint2: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$controlPoint2
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$controlPoint2 = value
        }
      },

      $controlPoint1: null,

      controlPoint1: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$controlPoint1
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$controlPoint1 = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.CubicTo*/ newInstance = new yfiles.graphml.CubicTo()
        {
          newInstance.point = this.$point
          newInstance.controlPoint1 = this.$controlPoint1
          newInstance.controlPoint2 = this.$controlPoint2
        }
        return newInstance
      },

      $initCubicToExtension: function () {
        this.$point = new Point(0, 0)
        this.$controlPoint2 = new Point(0, 0)
        this.$controlPoint1 = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.MoveToExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initMoveToExtension()
      },

      $point: null,

      point: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$point
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$point = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.MoveTo*/ newInstance = new yfiles.graphml.MoveTo()
        {
          newInstance.point = this.$point
        }
        return newInstance
      },

      $initMoveToExtension: function () {
        this.$point = new Point(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.GeneralPathMarkupExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'items' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initGeneralPathMarkupExtension()
      },

      $items: null,

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.GeneralPathExtension*/ generalPathExtension = new yfiles.graphml.GeneralPathExtension()
        var /*yfiles.collections.IEnumerator*/ tmpEnumerator
        for (tmpEnumerator = this.$items.getEnumerator(); tmpEnumerator.moveNext(); ) {
          var /*Object*/ item = tmpEnumerator.current
          {
            generalPathExtension.items.add(item)
          }
        }
        return generalPathExtension.provideValue(serviceProvider)
      },

      items: {
        $meta: function () {
          return [
            GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
            TypeAttribute(IList.$class)
          ]
        },
        get: function () {
          return this.$items
        }
      },

      $initGeneralPathMarkupExtension: function () {
        this.$items = new List()
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.StringTemplateLabelStyleExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.xaml.ControlStyleBaseExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'svgContent' })],

      constructor: function () {
        compat.graphml.xaml.ControlStyleBaseExtension.call(this)
        this.$initStringLabelControlLabelStyleExtension()
        this.$preferredSize = new Size(0, 0)
        this.$autoFlip = true
      },

      $svgContent: null,

      svgContent: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$svgContent
        },
        set: function (/*string*/ value) {
          this.$svgContent = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      $autoFlip: false,

      autoFlip: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoFlip
        },
        set: function (/*boolean*/ value) {
          this.$autoFlip = value
        }
      },

      $preferredSize: null,

      preferredSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$preferredSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$preferredSize = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.StringTemplateLabelStyle*/ newInstance = new StringTemplateLabelStyle()
        {
          newInstance.autoFlip = this.$autoFlip
          newInstance.normalizedOutline = this.$outlineShape
          newInstance.preferredSize = this.$preferredSize
          newInstance.styleTag = this.$styleTag
          newInstance.contextLookup = this.$contextLookup
          newInstance.svgContent = this.$svgContent
        }
        return newInstance
      },

      $initStringLabelControlLabelStyleExtension: function () {
        this.$preferredSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.TemplateLabelStyleExtension = new ClassDefinition(function () {
    return {
      $extends: compat.graphml.xaml.ControlStyleBaseExtension,

      constructor: function () {
        compat.graphml.xaml.ControlStyleBaseExtension.call(this)
        this.$initLabelControlLabelStyleExtension()
        this.$preferredSize = new Size(0, 0)
        this.$autoFlip = true
      },

      $styleResourceKey: null,

      styleResourceKey: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$styleResourceKey
        },
        set: function (/*string*/ value) {
          this.$styleResourceKey = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      $autoFlip: false,

      autoFlip: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoFlip
        },
        set: function (/*boolean*/ value) {
          this.$autoFlip = value
        }
      },

      $preferredSize: null,

      preferredSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$preferredSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$preferredSize = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.TemplateLabelStyle*/ newInstance = new TemplateLabelStyle()
        {
          newInstance.autoFlip = this.$autoFlip
          newInstance.normalizedOutline = this.$outlineShape
          newInstance.preferredSize = this.$preferredSize
          newInstance.styleResourceKey = this.$styleResourceKey
          newInstance.styleTag = this.$styleTag
          newInstance.contextLookup = this.$contextLookup
        }
        return newInstance
      },

      $initLabelControlLabelStyleExtension: function () {
        this.$preferredSize = new Size(0, 0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.InteriorLabelModelPosition = new EnumDefinition(function () {
    return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3,
      NORTH_EAST: 4,
      SOUTH_EAST: 5,
      NORTH_WEST: 6,
      SOUTH_WEST: 7,
      CENTER: 8
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.InteriorLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initInteriorLabelModelExtension()
        this.$insets = new Insets(0)
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.InteriorLabelModel*/ newInstance = new InteriorLabelModel()
        {
          newInstance.insets = this.$insets
        }
        return newInstance
      },

      $initInteriorLabelModelExtension: function () {
        this.$insets = new Insets(0)
      },

      $static: {
        NORTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.NORTH
          }
        },

        EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.EAST
          }
        },

        SOUTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.SOUTH
          }
        },

        SOUTH_EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.SOUTH_EAST
          }
        },

        SOUTH_WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.SOUTH_WEST
          }
        },

        WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.WEST
          }
        },

        NORTH_EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.NORTH_EAST
          }
        },

        NORTH_WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.NORTH_WEST
          }
        },

        CENTER: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorLabelModel.CENTER
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.InteriorLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initInteriorLabelModelParameterExtension()
        this.$position = compat.graphml.xaml.InteriorLabelModelPosition.NORTH
      },

      $position: null,

      position: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.InteriorLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*compat.graphml.xaml.InteriorLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.InteriorLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.InteriorLabelModelParameterExtension()
        {
          newInstance.position = /*(yfiles.graph.InteriorLabelModel.InteriorLabelModelPosition)*/ this.$position
          newInstance.model = this.$model
        }
        var /*yfiles.graphml.InteriorLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initInteriorLabelModelParameterExtension: function () {
        this.$position = compat.graphml.xaml.InteriorLabelModelPosition.NORTH
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.InteriorStretchLabelModelPosition = new EnumDefinition(function () {
    return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3,
      CENTER: 4
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.InteriorStretchLabelModelExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initInteriorStretchLabelModelExtension()
        this.$insets = new Insets(0)
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graph.InteriorStretchLabelModel*/ newInstance = new InteriorStretchLabelModel()
        {
          newInstance.insets = this.$insets
        }
        return newInstance
      },

      $initInteriorStretchLabelModelExtension: function () {
        this.$insets = new Insets(0)
      },

      $static: {
        NORTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorStretchLabelModel.NORTH
          }
        },

        EAST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorStretchLabelModel.EAST
          }
        },

        SOUTH: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorStretchLabelModel.SOUTH
          }
        },

        WEST: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorStretchLabelModel.WEST
          }
        },

        CENTER: {
          $meta: function () {
            return [TypeAttribute(ILabelModelParameter.$class)]
          },
          get: function () {
            return InteriorStretchLabelModel.CENTER
          }
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.InteriorStretchLabelModelParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initInteriorStretchLabelModelParameterExtension()
        this.$position = compat.graphml.xaml.InteriorStretchLabelModelPosition.NORTH
      },

      $position: null,

      position: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.InteriorStretchLabelModelPosition.$class)]
        },
        get: function () {
          return this.$position
        },
        set: function (/*compat.graphml.xaml.InteriorStretchLabelModelPosition*/ value) {
          this.$position = value
        }
      },

      $model: null,

      model: {
        $meta: function () {
          return [TypeAttribute(ILabelModel.$class)]
        },
        get: function () {
          return this.$model
        },
        set: function (/*yfiles.graph.ILabelModel*/ value) {
          this.$model = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.InteriorStretchLabelModelParameterExtension*/
          newInstance = new yfiles.graphml.InteriorStretchLabelModelParameterExtension()
        {
          newInstance.position = /*(yfiles.graph.InteriorStretchLabelModel.InteriorStretchLabelModelPosition)*/ this.$position
          newInstance.model = this.$model
        }
        var /*yfiles.graphml.InteriorStretchLabelModelParameterExtension*/ coreExtension = newInstance
        return coreExtension.provideValue(serviceProvider)
      },

      $initInteriorStretchLabelModelParameterExtension: function () {
        this.$position = compat.graphml.xaml.InteriorStretchLabelModelPosition.NORTH
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ImageNodeStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'image' })],

      constructor: function () {
        MarkupExtension.call(this)
      },

      $image: null,

      image: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.ImageSource.$class)]
        },
        get: function () {
          return this.$image
        },
        set: function (/*compat.graphml.xaml.ImageSource*/ value) {
          this.$image = value
        }
      },

      $fallbackImage: null,

      fallbackImage: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.ImageSource.$class)]
        },
        get: function () {
          return this.$fallbackImage
        },
        set: function (/*compat.graphml.xaml.ImageSource*/ value) {
          this.$fallbackImage = value
        }
      },

      $outlineShape: null,

      outlineShape: {
        $meta: function () {
          return [TypeAttribute(GeneralPath.$class)]
        },
        get: function () {
          return this.$outlineShape
        },
        set: function (/*yfiles.geometry.GeneralPath*/ value) {
          this.$outlineShape = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.ImageNodeStyle*/ newInstance = new ImageNodeStyle()
        {
          newInstance.fallbackImage = this.fallbackImage.$path
          newInstance.image = this.image.$path
          newInstance.normalizedOutline = this.$outlineShape
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.ImageSource = new ClassDefinition(function () {
    return {
      $path: null,

      path: {
        $meta: function () {
          return [TypeAttribute(YString.$class)]
        },
        get: function () {
          return this.$path
        },
        set: function (/*string*/ value) {
          this.$path = value
        }
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.IconLabelStyleExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'innerStyle' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initIconLabelStyleExtension()
        this.$autoFlip = true
        this.$innerStyleInsets = new Insets(0)
      },

      $icon: null,

      icon: {
        $meta: function () {
          return [TypeAttribute(compat.graphml.xaml.ImageSource.$class)]
        },
        get: function () {
          return this.$icon
        },
        set: function (/*compat.graphml.xaml.ImageSource*/ value) {
          this.$icon = value
        }
      },

      $iconSize: null,

      iconSize: {
        $meta: function () {
          return [TypeAttribute(Size.$class)]
        },
        get: function () {
          return this.$iconSize
        },
        set: function (/*yfiles.geometry.Size*/ value) {
          this.$iconSize = value
        }
      },

      $iconPlacement: null,

      iconPlacement: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$iconPlacement
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$iconPlacement = value
        }
      },

      $innerStyle: null,

      innerStyle: {
        $meta: function () {
          return [TypeAttribute(ILabelStyle.$class)]
        },
        get: function () {
          return this.$innerStyle
        },
        set: function (/*yfiles.styles.ILabelStyle*/ value) {
          this.$innerStyle = value
        }
      },

      $innerStyleInsets: null,

      innerStyleInsets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$innerStyleInsets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$innerStyleInsets = value
        }
      },

      $autoFlip: false,

      autoFlip: {
        $meta: function () {
          return [TypeAttribute(YBoolean.$class)]
        },
        get: function () {
          return this.$autoFlip
        },
        set: function (/*boolean*/ value) {
          this.$autoFlip = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.IconLabelStyle*/ newInstance = new IconLabelStyle()
        {
          newInstance.autoFlip = this.$autoFlip
          newInstance.icon = this.$icon.$path
          newInstance.iconPlacement = this.$iconPlacement
          newInstance.iconSize = this.$iconSize
          newInstance.wrapped = this.$innerStyle
          newInstance.wrappedInsets = this.$innerStyleInsets
        }
        return newInstance
      },

      $initIconLabelStyleExtension: function () {
        this.$iconSize = new Size(0, 0)
        this.$innerStyleInsets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.CollapsibleNodeStyleDecoratorExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      $meta: [GraphMLAttribute().init({ contentProperty: 'wrapped' })],

      constructor: function () {
        MarkupExtension.call(this)
        this.$initCollapsibleNodeStyleDecoratorExtension()
        this.$buttonLocationParameter = InteriorLabelModel.NORTH_WEST
        this.$insets = new Insets(5, 16, 5, 5)
      },

      $buttonLocationParameter: null,

      buttonLocationParameter: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$buttonLocationParameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$buttonLocationParameter = value
        }
      },

      $insets: null,

      insets: {
        $meta: function () {
          return [TypeAttribute(Insets.$class)]
        },
        get: function () {
          return this.$insets
        },
        set: function (/*yfiles.geometry.Insets*/ value) {
          this.$insets = value
        }
      },

      $wrapped: null,

      wrapped: {
        $meta: function () {
          return [TypeAttribute(INodeStyle.$class)]
        },
        get: function () {
          return this.$wrapped
        },
        set: function (/*yfiles.styles.INodeStyle*/ value) {
          this.$wrapped = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.styles.CollapsibleNodeStyleDecorator*/
          newInstance = new CollapsibleNodeStyleDecorator()
        {
          newInstance.insets = this.$insets
          newInstance.wrapped = this.$wrapped
          newInstance.buttonPlacement = this.$buttonLocationParameter
        }
        return newInstance
      },

      $initCollapsibleNodeStyleDecoratorExtension: function () {
        this.$insets = new Insets(0)
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.GenericLabelModelParameterPairExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
      },

      $parameter: null,

      parameter: {
        $meta: function () {
          return [TypeAttribute(ILabelModelParameter.$class)]
        },
        get: function () {
          return this.$parameter
        },
        set: function (/*yfiles.graph.ILabelModelParameter*/ value) {
          this.$parameter = value
        }
      },

      $descriptor: null,

      descriptor: {
        $meta: function () {
          return [TypeAttribute(ILabelCandidateDescriptor.$class)]
        },
        get: function () {
          return this.$descriptor
        },
        set: function (/*yfiles.graph.ILabelCandidateDescriptor*/ value) {
          this.$descriptor = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        var /*yfiles.graphml.GenericLabelModelParameterPair*/
          newInstance = new yfiles.graphml.GenericLabelModelParameterPair()
        {
          newInstance.parameter = this.$parameter
          newInstance.descriptor = this.$descriptor
        }
        return newInstance
      }
    }
  })
})
yfiles.lang.module('compat.graphml.xaml', function (exports) {
  exports.AnchoredPortLocationModel = new ClassDefinition(function () {
    return {
      $final: true,

      $with: [IPortLocationModel],

      lookup: function (/*yfiles.lang.Class*/ type) {
        return null
      },

      getLocation: function (port, locationParameter) {
        if (
          locationParameter instanceof compat.graphml.xaml.AnchoredPortLocationModel.AnchorParameter
        ) {
          return locationParameter.$anchor.toPoint()
        } else if (
          locationParameter instanceof
          compat.graphml.xaml.AnchoredPortLocationModel.PointAnchorParameter
        ) {
          return /*(compat.graphml.xaml.AnchoredPortLocationModel.PointAnchorParameter)*/ locationParameter.$anchor
        } else {
          return Point.ORIGIN
        }
      },

      createParameter: function (owner, location) {
        return new compat.graphml.xaml.AnchoredPortLocationModel.PointAnchorParameter(
          this,
          location
        )
      },

      getContext: function (port, locationParameter) {
        return ILookup.EMPTY
      },

      $static: {
        INSTANCE: null,

        AnchorParameter: new ClassDefinition(function () {
          return {
            $final: true,

            $with: [IPortLocationModelParameter],

            constructor: function (model, anchor) {
              this.$model = model
              this.$anchor = anchor
            },

            $model: null,

            $anchor: null,

            clone: function () {
              return this
            },

            model: {
              get: function () {
                return this.$model
              }
            },

            supports: function (owner) {
              return true
            }
          }
        }),

        PointAnchorParameter: new ClassDefinition(function () {
          return {
            $final: true,

            $with: [IPortLocationModelParameter, IMarkupExtensionConverter],

            constructor: function (model, anchor) {
              this.$anchor = Point.ORIGIN
              this.$model = model
              this.$anchor = anchor
            },

            $model: null,

            $anchor: null,

            clone: function () {
              return this
            },

            model: {
              get: function () {
                return this.$model
              }
            },

            supports: function (owner) {
              return true
            },

            canConvert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              return true
            },

            convert: function (/*yfiles.graphml.IWriteContext*/ context, /*Object*/ value) {
              var anchoredParameter = new compat.graphml.xaml.AnchoredParameterExtension()
              anchoredParameter.anchor = this.$anchor
              return anchoredParameter
            }
          }
        }),

        $clinit: function () {
          compat.graphml.xaml.AnchoredPortLocationModel.INSTANCE = new compat.graphml.xaml.AnchoredPortLocationModel()
        }
      }
    }
  })

  exports.AnchoredParameterExtension = new ClassDefinition(function () {
    return {
      $extends: MarkupExtension,

      constructor: function () {
        MarkupExtension.call(this)
        this.$initAnchoredParameterExtension()
      },

      $anchor: null,

      anchor: {
        $meta: function () {
          return [TypeAttribute(Point.$class)]
        },
        get: function () {
          return this.$anchor
        },
        set: function (/*yfiles.geometry.Point*/ value) {
          this.$anchor = value
        }
      },

      provideValue: function (/*yfiles.graph.ILookup*/ serviceProvider) {
        return compat.graphml.xaml.AnchoredPortLocationModel.INSTANCE.createParameter(
          null,
          this.$anchor
        )
      },

      $initAnchoredParameterExtension: function () {
        this.$anchor = new Point(0, 0)
      }
    }
  })
})
