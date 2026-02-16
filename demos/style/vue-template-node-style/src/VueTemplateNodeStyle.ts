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
// @ts-nocheck
import {
  Font,
  FontStyle,
  GraphComponent,
  type GraphMLIOHandler,
  INode,
  IRenderContext,
  NodeStyleBase,
  Size,
  SvgDefsManager,
  SvgVisual,
  type TaggedSvgVisual,
  TextDecorations,
  TextRenderSupport,
  TextWrapping
} from '@yfiles/yfiles'

import '@yfiles/demo-app/demo.css'
import type { App, Component, ComponentPublicInstance } from 'vue'
import { createApp, customRef, defineComponent, markRaw, type Ref } from 'vue'

export function addVueTemplateNodeStyleInformation(graphmlHandler: GraphMLIOHandler) {
  // enable serialization of the Vue template node style - without a namespace mapping, serialization will fail
  graphmlHandler.addNamespace(
    'http://www.yworks.com/demos/yfiles-vue-node-style/3.0',
    'VueTemplateNodeStyle'
  )

  graphmlHandler.addTypeInformation(VueTemplateNodeStyle, {
    name: 'VueTemplateNodeStyle',
    xmlNamespace: 'http://www.yworks.com/demos/yfiles-vue-node-style/3.0',
    contentProperty: 'template',
    properties: {
      template: { type: String, default: '' },
      styleTag: { type: Object, default: null }
    }
  })
}

type State<TTag = any> = {
  layout: NodeLayout
  zoom: number
  tag: TTag
  selected: boolean
  highlighted: boolean
  focused: boolean
}

type ComponentProps<TTag> = State<TTag> & { observedContext: ObservedContext<TTag> }

type NodeLayout = { x: number; y: number; width: number; height: number }

type RenderCache<TTag = unknown> = {
  app: App<SVGGElement>
  instance: ComponentPublicInstance<ComponentProps<TTag>>
}

type VueVisual<TTag = unknown> = TaggedSvgVisual<SVGGElement, RenderCache<TTag>>

/**
 * A context object that helps to enhance performance. There are some properties that are provided for binding
 * but do not necessarily have to be used. We will only check those properties if they were changed.
 */
class ObservedContext<TTag> {
  private defsSupport: SvgDefsManager = null!
  store = new CustomRefStore<keyof State>()

  constructor() {}

  init(renderContext: IRenderContext, node: INode): void {
    this.defsSupport = renderContext.svgDefsManager
    const graphComponent = renderContext.canvasComponent as GraphComponent
    const store = this.store
    store.set('zoom', renderContext.zoom)
    store.set('tag', node.tag)
    store.set(
      'highlighted',
      graphComponent.highlightIndicatorManager.items?.includes(node) ?? false
    )
    store.set('focused', graphComponent.focusIndicatorManager.focusedItem === node)
    store.set('selected', graphComponent.selectionIndicatorManager.items?.includes(node) ?? false)
    const { x, y, width, height } = node.layout
    store.set('layout', { x, y, width, height })
  }

  update(renderContext: IRenderContext, node: INode): void {
    this.store.set('zoom', renderContext.zoom)
    const graphComponent = renderContext.canvasComponent as GraphComponent
    const store = this.store
    if (store.isTracking('layout')) {
      const layout = node.layout
      const newValue: NodeLayout = {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height
      }
      const oldLayout = store.getValue('layout') as NodeLayout
      if (
        newValue.x !== oldLayout.x ||
        newValue.y !== oldLayout.y ||
        newValue.width !== oldLayout.width ||
        newValue.height !== oldLayout.height
      ) {
        store.set('layout', newValue)
      }
    }
    if (store.isTracking('tag')) {
      const newValue = node.tag
      if (newValue !== store.getValue('tag')) {
        store.set('tag', newValue)
      }
    }
    if (store.isTracking('selected')) {
      const newValue = graphComponent.selection.nodes.includes(node)
      if (newValue !== store.getValue('selected')) {
        store.set('selected', newValue)
      }
    }
    if (store.isTracking('highlighted')) {
      const newValue = graphComponent.highlights.includes(node)
      if (newValue !== store.getValue('highlighted')) {
        store.set('highlighted', newValue)
      }
    }
    if (store.isTracking('focused')) {
      const newValue = graphComponent.focusIndicatorManager.focusedItem === node
      if (newValue !== store.getValue('focused')) {
        store.set('focused', newValue)
      }
    }
  }

  /**
   * Generates an id for use in SVG defs elements that is unique for the current rendering context.
   */
  generateDefsId(): string {
    return this.defsSupport.generateUniqueDefsId()
  }
}

/**
 * A node style which uses a Vue component to display a node.
 */
export class VueTemplateNodeStyle<TTag = any> extends NodeStyleBase<VueVisual<TTag>> {
  private _template = ''
  private _styleTag = null
  protected component: Component<ComponentProps<TTag>> = null!

  constructor(template: string) {
    super()
    this.template = template
  }

  get styleTag(): any {
    return this._styleTag
  }

  set styleTag(val: any) {
    this._styleTag = val
  }

  /**
   * Returns the Vue template string.
   */
  get template(): string {
    return this._template
  }

  /**
   * Sets the Vue template string.
   */
  set template(value: string) {
    if (value !== this._template) {
      this._template = value
      this.component = defineComponent<ComponentProps<TTag>>({
        props: {
          observedContext: Object,
          zoom: Number,
          layout: Object,
          tag: Object,
          selected: Boolean,
          highlighted: Boolean,
          focused: Boolean
        },
        setup(props: ComponentProps<TTag>) {
          const context = props.observedContext
          const store = context.store
          return {
            zoom: store.getRef('zoom'),
            layout: store.getRef('layout'),
            tag: store.getRef('tag'),
            selected: store.getRef('selected'),
            highlighted: store.getRef('highlighted'),
            focused: store.getRef('focused'),
            observedContext: context
          }
        },
        data(): { idMap: Map<string, string>; urlMap: Map<string, string> } {
          return { idMap: new Map<string, string>(), urlMap: new Map<string, string>() }
        },
        methods: {
          localId(this: ComponentPublicInstance<ComponentProps<TTag>>, id: string): string {
            let localId = this.idMap[id]
            if (typeof localId === 'undefined') {
              localId = this.observedContext.generateDefsId()
              this.idMap[id] = localId
            }
            return localId
          },
          localUrl(this: ComponentPublicInstance<ComponentProps<TTag>>, id: string): string {
            let localUrl = this.urlMap[id]
            if (typeof localUrl === 'undefined') {
              const localId = this.localId(id)
              localUrl = `url(#${localId})`
              this.urlMap[id] = localUrl
            }
            return localUrl
          }
        },
        template: value
      })
    }
  }

  /**
   * Creates a visual that uses a Vue component to display a node.
   */
  createVisual(context: IRenderContext, node: INode): VueVisual<TTag> {
    const observedContext = markRaw(new ObservedContext())
    observedContext.init(context, node)
    const app = createApp(this.component, { observedContext }) as App<SVGGElement>
    initializeDesignerVueComponents(app)

    const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    SvgVisual.setTranslate(svgGroup, node.layout.x, node.layout.y)

    const instance = app.mount(svgGroup, false, true) as ComponentPublicInstance<
      ComponentProps<TTag>
    >
    const renderCache = { app, instance }
    const svgVisual = SvgVisual.from(svgGroup, renderCache)

    context.setDisposeCallback(svgVisual, (context, visual) => {
      // clean up vue component instance after the visual is disposed
      visual.tag.app.unmount()
      return null
    })
    return svgVisual
  }

  /**
   * Updates the visual by returning the old visual, as Vue handles updating the component.
   * @see Overrides {@link NodeStyleBase.updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: VueVisual<TTag>, node: INode): VueVisual<TTag> {
    SvgVisual.setTranslate(oldVisual.svgElement, node.layout.x, node.layout.y)
    const component = oldVisual.tag.instance
    component.observedContext.update(context, node)
    return oldVisual
  }
}

function hasText(el: Element) {
  return el && el.querySelector && el.querySelector('text')
}

/**
 * Initializes the Vue components that are used in the 'Node Template Designer'.
 * @yjs:keep = visible,Node
 */
export function initializeDesignerVueComponents(app: App): void {
  app.config.warnHandler = (err: string, vm: any, info: string) => {
    console.error(err)
    // throw new Error(`${err}\n${info}`)
  }

  function addText(
    value: string | number | boolean,
    w: string | number,
    h: string | number,
    fontFamily: string,
    fontSize: string | number,
    fontWeight: string | number,
    fontStyle: string | number,
    textDecoration: string | number,
    lineSpacing: string | number,
    wrapping: string | number,
    textElement: SVGTextElement | null
  ): SVGTextElement | null {
    if (
      !textElement ||
      textElement.nodeType !== Node.ELEMENT_NODE ||
      textElement.nodeName !== 'text'
    ) {
      return null
    }

    const text = String(value)
    // create the font which determines the visual text properties
    const fontSettings: {
      fontFamily?: string
      fontSize?: number
      fontWeight?: string | number
      fontStyle?: FontStyle
      textDecoration?: TextDecorations
      lineSpacing?: number
    } = {}
    if (typeof fontFamily !== 'undefined') {
      fontSettings.fontFamily = fontFamily
    }
    if (typeof fontSize !== 'undefined') {
      fontSettings.fontSize = Number(fontSize)
    }
    if (typeof fontStyle !== 'undefined') {
      fontSettings.fontStyle = Number(fontStyle)
    }
    if (typeof fontWeight !== 'undefined') {
      fontSettings.fontWeight = String(fontWeight)
    }
    if (typeof textDecoration !== 'undefined') {
      fontSettings.textDecoration = Number(textDecoration)
    }
    if (typeof lineSpacing !== 'undefined') {
      fontSettings.lineSpacing = Number(lineSpacing)
    }
    const font = new Font(fontSettings)
    let textWrapping: TextWrapping = TextWrapping.WRAP_CHARACTER_ELLIPSIS

    if (typeof wrapping !== 'undefined' && wrapping !== null) {
      switch (Number(wrapping)) {
        case TextWrapping.NONE:
        case TextWrapping.TRIM_CHARACTER_ELLIPSIS:
        case TextWrapping.TRIM_CHARACTER:
        case TextWrapping.TRIM_WORD:
        case TextWrapping.TRIM_WORD_ELLIPSIS:
        case TextWrapping.WRAP_CHARACTER_ELLIPSIS:
        case TextWrapping.WRAP_CHARACTER:
        case TextWrapping.WRAP_WORD:
        case TextWrapping.WRAP_WORD_ELLIPSIS:
          textWrapping = Number(wrapping)
          break
        default:
          // in case of faulty input
          textWrapping = TextWrapping.NONE
      }
    }

    if (typeof w === 'undefined' || w === null) {
      w = Number.POSITIVE_INFINITY
    }
    if (typeof h === 'undefined' || h === null) {
      h = Number.POSITIVE_INFINITY
    }

    // do the text wrapping
    // This sample uses the strategy WRAP_CHARACTER_ELLIPSIS. You can use any other setting.
    TextRenderSupport.addText(textElement, text, font, new Size(Number(w), Number(h)), textWrapping)

    return textElement
  }

  function updateText(
    value: string | number | boolean,
    w: string | number,
    h: string | number,
    fontFamily: string,
    fontSize: string | number,
    fontWeight: string | number,
    fontStyle: string | number,
    textDecoration: string | number,
    lineSpacing: string | number,
    wrapping: string | number,
    textElement: SVGTextElement | null
  ) {
    while (textElement?.lastChild) {
      textElement.removeChild(textElement.lastChild)
    }
    addText(
      value,
      w,
      h,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textDecoration,
      lineSpacing,
      wrapping,
      textElement
    )
  }

  type TextDataType = {
    content: string | number | boolean
    width: string | number
    height: string | number
    fontFamily: string
    fontSize: string | number
    fontWeight: string | number
    fontStyle: string | number
    textDecoration: string | number
    lineSpacing: string | number
    wrapping: string | number
    $el: SVGElement
  }

  type TextPropsType = {
    x: string | number
    y: string | number
    width: string | number
    height: string | number
    clipped: boolean
    align: string
    fill: string
    content: string | number | boolean
    opacity: string | number
    visible: string | boolean
    wrapping: string | number
    transform: string
    fontFamily: string
    fontSize: string | number
    fontWeight: string | number
    fontStyle: string | number
    textDecoration: string | number
    lineSpacing: string | number
  }

  app.component('SvgText', {
    props: {
      x: { type: [String, Number], required: false, default: undefined },
      y: { type: [String, Number], required: false, default: undefined },
      width: { type: [String, Number], required: false, default: undefined },
      height: { type: [String, Number], required: false, default: undefined },
      clipped: { type: Boolean, required: false, default: false },
      align: { type: String, required: false, default: 'start' },
      fill: { type: String, required: false, default: undefined },
      content: { type: [String, Number, Boolean], required: false, default: undefined },
      opacity: { type: [String, Number], default: undefined, required: false },
      visible: { type: [String, Boolean], default: true, required: false },
      wrapping: {
        type: [String, Number],
        default: TextWrapping.WRAP_CHARACTER_ELLIPSIS,
        required: false
      },
      transform: { type: String, default: '', required: false },
      fontFamily: { type: String, default: undefined, required: false },
      fontSize: { type: [String, Number], default: undefined, required: false },
      fontWeight: { type: [String, Number], default: undefined, required: false },
      fontStyle: { type: [String, Number], default: undefined, required: false },
      textDecoration: { type: [String, Number], default: undefined, required: false },
      lineSpacing: { type: [String, Number], default: 0.5, required: false }
    },
    data(): { refId: string } {
      return { refId: `svg-text-${Date.now() + Math.random()}` }
    },
    computed: {
      $dx(this: TextPropsType): number {
        return this.align === 'end'
          ? Number(this.width)
          : this.align === 'middle'
            ? Number(this.width) * 0.5
            : 0
      },
      $textAnchor(this: TextPropsType): string | boolean {
        return this.align === 'end' || this.align === 'middle' ? this.align : false
      },
      $transform(this: TextPropsType): string | boolean {
        return this.transform || ''
      }
    },
    watch: {
      width(this: TextDataType): void {
        if (!hasText(this.$el)) {
          return
        }
        updateText(
          this.content,
          this.width,
          this.height,
          this.fontFamily,
          this.fontSize,
          this.fontWeight,
          this.fontStyle,
          this.textDecoration,
          this.lineSpacing,
          this.wrapping,
          this.$el.querySelector('text')
        )
      },
      height(this: TextDataType): void {
        if (!hasText(this.$el)) {
          return
        }
        updateText(
          this.content,
          this.width,
          this.height,
          this.fontFamily,
          this.fontSize,
          this.fontWeight,
          this.fontStyle,
          this.textDecoration,
          this.lineSpacing,
          this.wrapping,
          this.$el.querySelector('text')
        )
      },
      content(this: TextDataType): void {
        if (!hasText(this.$el)) {
          return
        }
        updateText(
          this.content,
          this.width,
          this.height,
          this.fontFamily,
          this.fontSize,
          this.fontWeight,
          this.fontStyle,
          this.textDecoration,
          this.lineSpacing,
          this.wrapping,
          this.$el.querySelector('text')
        )
      }
    },
    mounted() {
      if (!hasText(this.$el)) {
        return
      }
      addText(
        this.content,
        this.width,
        this.height,
        this.fontFamily,
        this.fontSize,
        this.fontWeight,
        this.fontStyle,
        this.textDecoration,
        this.lineSpacing,
        this.wrapping,
        this.$el.querySelector('text')
      )
    },
    template: `
      <g v-if="visible" :transform="$transform">
      <g v-if="clipped" :transform="'translate('+x+' '+y+')'">
        <text dy="1em" :transform="'translate('+$dx+' 0)'" :text-anchor="$textAnchor"
          :clip-path="'url(#'+refId+')'" :fill="fill" :opacity="opacity">
        </text>
        <clipPath :id="refId">
          <rect :width="width" :height="height" :x="-$dx"></rect>
        </clipPath>
      </g>
      <g v-else :transform="'translate('+x+' '+y+')'">
        <text dy="1em" :transform="'translate('+$dx+' 0)'" :text-anchor="$textAnchor" :fill="fill"
          :opacity="opacity">
        </text>
      </g>
      </g>`
  })

  type ShapePropsType = {
    x: string | number
    y: string | number
    width: string | number
    height: string | number
    cornerRadius: string | number
    fill: string
    stroke: string
    strokewidth: string | number
    strokeDasharray: string
    opacity: string | number
    visible: string | boolean
    transform: string | boolean
  }

  app.component('SvgRect', {
    props: {
      x: { type: [String, Number], default: 0, required: false },
      y: { type: [String, Number], default: 0, required: false },
      width: { type: [String, Number], default: 50, required: false },
      height: { type: [String, Number], default: 50, required: false },
      cornerRadius: { type: [String, Number], default: 0, required: false },
      fill: { type: String, required: false, default: 'orange' },
      stroke: { type: String, required: false, default: 'orange' },
      strokeWidth: { type: [String, Number], default: 1, required: false },
      strokeDasharray: { type: String, default: '', required: false },
      opacity: { type: [String, Number], default: 1, required: false },
      visible: { type: [String, Boolean], default: true, required: false },
      transform: { type: String, default: '', required: false }
    },
    computed: {
      $transform(this: ShapePropsType): string | boolean {
        return this.transform || ''
      }
    },
    template:
      '<rect :transform="$transform" :x="x" :y="y" :width="width" :height="height" :rx="cornerRadius" :fill="fill" :stroke="stroke" :stroke-width="strokeWidth" :stroke-dasharray="strokeDasharray" :opacity="opacity" v-if="visible"></rect>'
  })

  app.component('SvgEllipse', {
    props: {
      x: { type: [String, Number], default: 0, required: false },
      y: { type: [String, Number], default: 0, required: false },
      width: { type: [String, Number], default: 50, required: false },
      height: { type: [String, Number], default: 50, required: false },
      fill: { type: String, required: false, default: 'orange' },
      stroke: { type: String, required: false, default: 'orange' },
      strokeWidth: { type: [String, Number], default: 1, required: false },
      strokeDasharray: { type: String, default: '', required: false },
      opacity: { type: [String, Number], default: 1, required: false },
      visible: { type: [String, Boolean], default: true, required: false },
      transform: { type: String, default: '', required: false }
    },
    computed: {
      $cx(this: ShapePropsType): number {
        return Number(this.x) + Number(this.width) * 0.5
      },
      $cy(this: ShapePropsType): number {
        return Number(this.y) + Number(this.height) * 0.5
      },
      $rx(this: ShapePropsType): number {
        return Number(this.width) * 0.5
      },
      $ry(this: ShapePropsType): number {
        return Number(this.height) * 0.5
      },
      $transform(this: ShapePropsType): string | boolean {
        return this.transform || ''
      }
    },
    template:
      '<ellipse :transform="$transform" :cx="$cx" :cy="$cy" :rx="$rx" :ry="$ry" :fill="fill" :stroke="stroke" :stroke-width="strokeWidth" :stroke-dasharray="strokeDasharray" :opacity="opacity" v-if="visible"></ellipse>'
  })

  app.component('SvgImage', {
    props: {
      x: { type: [String, Number], default: undefined, required: false },
      y: { type: [String, Number], default: undefined, required: false },
      width: { type: [String, Number], default: undefined, required: false },
      height: { type: [String, Number], default: undefined, required: false },
      src: { type: String, default: undefined, required: false },
      opacity: { type: [String, Number], default: undefined, required: false },
      visible: { type: [String, Boolean], default: true, required: false },
      transform: { type: String, default: '', required: false }
    },
    computed: {
      $transform(this: ShapePropsType): string | boolean {
        return this.transform || ''
      }
    },
    template:
      '<image :transform="$transform" :x="x" :y="y" :width="width" :height="height" v-bind="{\'xlink:href\':src}" :opacity="opacity" v-if="visible"></image>'
  })
}

type RefStoreEntry<T> = { value: T; ref: Ref<T>; tracked: boolean }

export class CustomRefStore<TKey extends string> {
  private refs = new Map<TKey, RefStoreEntry<unknown>>()

  constructor() {}

  isTracking(key: TKey) {
    return this.refs.get(key)?.tracked ?? false
  }

  getValue(key: TKey): any {
    return this.refs.get(key)?.value
  }

  getRef<V = unknown>(key: TKey): Ref<V> {
    return this.refs.get(key).ref
  }

  set<V>(key: TKey, v: V): Ref<V> {
    const entry = this.refs.get(key) as RefStoreEntry<V> | undefined
    if (entry) {
      entry.ref.value = v
      return entry.ref
    } else {
      const holder: RefStoreEntry<V> = {
        value: v,
        tracked: false,
        ref: customRef<V>((track, trigger) => ({
          set(v) {
            if (holder.value !== v) {
              holder.value = v
              trigger()
            }
          },
          get(): V {
            holder.tracked = true
            track()
            return holder.value
          }
        }))
      }
      this.refs.set(key, holder)
      return holder.ref
    }
  }
}
