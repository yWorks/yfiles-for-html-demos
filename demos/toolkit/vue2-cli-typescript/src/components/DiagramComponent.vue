<template>
  <div>
    <demo-toolbar
      class="toolbar"
      @reload-graph="createDefaultGraph()"
      @toggle-editable="toggleEditable"
      @layout="runLayout"
      @search-query-change="onSearchQueryChange"
    ></demo-toolbar>
    <div class="graph-component-container" ref="graphComponentElement">
      <ContextMenu @populate-context-menu="onPopulateContextMenu" ref="contextMenu">
        <button
          v-for="action in contextMenuActions"
          :key="action.title"
          @click="
            () => {
              action.action()
              $refs.contextMenu.hide()
            }
          "
          v-text="action.title"
        ></button>
      </ContextMenu>
    </div>
  </div>
</template>

<script lang="ts">
import licenseData from '../../../../../lib/license.json'
import {
  Arrow,
  DefaultLabelStyle,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IModelItem,
  INode,
  Insets,
  InteriorLabelModel,
  LayoutExecutorAsync,
  License,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  QueryItemToolTipEventArgs,
  Rect,
  ShapeNodeStyle,
  Stroke,
  StyleDecorationZoomPolicy,
  TimeSpan
} from 'yfiles'
import DemoToolbar from './DemoToolbar.vue'
import ContextMenu from './ContextMenu.vue'
import Tooltip from './Tooltip.vue'
import GraphSearch from '../utils/GraphSearch'
import { Component, Inject, Ref, Vue } from 'vue-property-decorator'
// @ts-ignore
import LayoutWorker from './layout.worker'

License.value = licenseData

const layoutWorker = new LayoutWorker()

type MenuItem = { title: string; action: () => void }

@Component({
  components: {
    DemoToolbar,
    ContextMenu
  }
})
export default class DiagramComponent extends Vue {
  // since we don't want the graphComponent be reactive we set its initial value to undefined
  public graphComponent: GraphComponent | undefined = undefined

  private graphSearch!: GraphSearch
  private $query!: string
  private contextMenuActions: MenuItem[] = []

  @Inject() readonly yFilesAPI!: { getGC: () => GraphComponent }

  @Ref() readonly graphComponentElement!: HTMLDivElement
  @Ref() readonly contextMenu!: ContextMenu

  beforeMount(): void {
    this.yFilesAPI.getGC = () => this.graphComponent!
  }

  mounted(): void {
    this.$query = ''
    this.graphComponent = new GraphComponent(this.graphComponentElement)
    this.graphComponent.inputMode = new GraphViewerInputMode()
    this.registerContextMenu()
    this.initializeDefaultStyles()
    this.initializeTooltips()
    this.createDefaultGraph()
    this.initializeGraphSearch()
  }

  /**
   * Enables/disables interactive editing of the graph.
   */
  toggleEditable(editable: boolean): void {
    this.graphComponent!.inputMode = editable
      ? new GraphEditorInputMode()
      : new GraphViewerInputMode()
    this.registerContextMenu()
    this.initializeTooltips()
  }

  /**
   * Registers the context menu on the current input mode.
   */
  registerContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.register(this.graphComponent!)
    }
  }

  /**
   * Populates the context menu depending on the given graph item.
   */
  onPopulateContextMenu(item: IModelItem): void {
    function getBounds(item: INode | IEdge) {
      return item instanceof INode
        ? item.layout.toRect()
        : Rect.add(item.sourceNode!.layout.toRect(), item.targetNode!.layout.toRect())
    }

    const contextMenuItems: MenuItem[] = []
    if (item instanceof INode || item instanceof IEdge) {
      contextMenuItems.push({
        title: 'Zoom to item',
        action: () => {
          // center the item in the viewport
          let targetBounds = getBounds(item)
          targetBounds = targetBounds.getEnlarged(50 / this.graphComponent!.zoom)
          ICommand.ZOOM.execute(targetBounds, this.graphComponent!)
        }
      })
    }
    this.contextMenuActions = contextMenuItems
  }

  /**
   * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
   * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
   * GraphEditorInputMode using the
   * {@link ToolTipQueryEventArgs} parameter.
   * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
   * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
   * whether the tooltip was already set by one of possibly several tooltip providers. The
   * QueryLocation property contains the mouse position for the query in world coordinates.
   * The tooltip is set by setting the ToolTip property.
   */
  initializeTooltips(): void {
    const inputMode = this.graphComponent!.inputMode as GraphEditorInputMode | GraphViewerInputMode
    // show tooltips only for nodes and edges
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener(
      (
        src: GraphEditorInputMode | GraphViewerInputMode,
        eventArgs: QueryItemToolTipEventArgs<IModelItem>
      ) => {
        if (eventArgs.handled) {
          // Tooltip content has already been assigned -> nothing to do.
          return
        }

        // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
        eventArgs.toolTip = this.createTooltipContent(eventArgs.item!)

        // Indicate that the tooltip content has been set.
        eventArgs.handled = true
      }
    )
  }

  /**
   * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
   * show the latter by using a dynamically compiled Vue component.
   */
  createTooltipContent(item: IModelItem): HTMLElement {
    const vueTooltipComponent = Vue.extend(Tooltip)

    const title = item instanceof INode ? 'Node Tooltip' : 'Edge Tooltip'
    let content = ''
    if (item instanceof INode) {
      const label = item.labels.at(0)
      content = label ? `Label: "${label.text}"` : 'Label: Unlabeled'
    } else if (item instanceof IEdge) {
      // there should be only nodes and edges due to inputMode.tooltipItems
      const sourceLabel = item.sourceNode!.labels.at(0)
      const targetLabel = item.targetNode!.labels.at(0)
      content = `Connecting ${(sourceLabel && sourceLabel.text) || 'Unlabeled'} with ${
        (targetLabel && targetLabel.text) || 'Unlabeled'
      }`
    }

    const vueTooltip = new vueTooltipComponent({
      data: {
        title,
        content
      }
    })

    vueTooltip.$mount()

    return vueTooltip.$el as HTMLElement
  }

  /**
   * Initializes the node search input.
   */
  initializeGraphSearch(): void {
    const graphSearch = new GraphSearch(this.graphComponent!)
    graphSearch.highlightDecoration = new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        stroke: new Stroke(0x03, 0xa9, 0xf4, 220, 3),
        fill: null
      }),
      margins: 3,
      zoomPolicy: StyleDecorationZoomPolicy.MIXED
    })
    this.graphSearch = graphSearch
    this.graphComponent!.graph.addNodeCreatedListener(this.updateSearch.bind(this))
    this.graphComponent!.graph.addNodeRemovedListener(this.updateSearch.bind(this))
    this.graphComponent!.graph.addLabelAddedListener(this.updateSearch.bind(this))
    this.graphComponent!.graph.addLabelRemovedListener(this.updateSearch.bind(this))
    this.graphComponent!.graph.addLabelTextChangedListener(this.updateSearch.bind(this))
  }

  /**
   * Updates the search highlights.
   */
  updateSearch(): void {
    this.graphSearch.updateSearch(this.$query)
  }

  /**
   * Called when the search query changes.
   */
  onSearchQueryChange(query: string): void {
    this.$query = query
    this.updateSearch()
  }

  /**
   * Runs a layout in a web worker.
   */
  runLayout(): Promise<void> {
    // helper function that performs the actual message passing to the web worker
    function webWorkerMessageHandler(data: unknown): Promise<any> {
      return new Promise(resolve => {
        layoutWorker.onmessage = (e: any) => resolve(e.data)
        layoutWorker.postMessage(data)
      })
    }

    // create an asynchronous layout executor that calculates a layout on the worker
    const executor = new LayoutExecutorAsync({
      messageHandler: webWorkerMessageHandler,
      graphComponent: this.graphComponent!,
      duration: '1s',
      animateViewport: true,
      easedAnimation: true
    })

    return executor.start()
  }

  /**
   * Sets default styles for the graph.
   */
  initializeDefaultStyles(): void {
    const graph = this.graphComponent!.graph
    // configure the styles of the nodes and their labels
    graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: '#FF6C00',
      stroke: '#662F01',
      shape: 'round-rectangle'
    })
    graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textSize: 12,
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center',
      wrapping: 'word',
      textFill: '#662F01',
      backgroundFill: '#FFC398',
      insets: new Insets(2)
    })
    graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

    // configure the style of the edges
    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '#662F01',
      targetArrow: new Arrow({
        type: 'triangle',
        stroke: '#662F01',
        fill: '#662F01'
      })
    })
  }

  /**
   * Creates the default graph.
   */
  createDefaultGraph(): void {
    const graph = this.graphComponent!.graph
    graph.clear()
    const node1 = graph.createNode({
      layout: new Rect(241, 273, 130, 70),
      labels: ['Hobbies']
    })
    const node2 = graph.createNode({
      layout: new Rect(309, 126, 70, 40),
      labels: ['Games']
    })
    const node3 = graph.createNode({
      layout: new Rect(435, 318, 70, 40),
      labels: ['Sport']
    })
    const node4 = graph.createNode({
      layout: new Rect(249, 451, 70, 40),
      labels: ['Books']
    })
    const node5 = graph.createNode({
      layout: new Rect(116, 323, 70, 40),
      labels: ['Diy']
    })
    const node6 = graph.createNode({
      layout: new Rect(157, 187, 70, 40),
      labels: ['Collecting']
    })
    const node7 = graph.createNode({
      layout: new Rect(232, 579, 70, 40),
      labels: ['Fantasy']
    })
    const node8 = graph.createNode({
      layout: new Rect(343, 530, 130, 40),
      labels: ['Science Fiction']
    })
    const node9 = graph.createNode({
      layout: new Rect(137, 503, 70, 40),
      labels: ['Thriller']
    })
    const node10 = graph.createNode({
      layout: new Rect(201, 30, 130, 40),
      labels: ['Cops and Robbers']
    })
    const node11 = graph.createNode({
      layout: new Rect(422, 85, 130, 40),
      labels: ['The Settlers of Catan']
    })
    const node12 = graph.createNode({
      layout: new Rect(341, 0, 70, 40),
      labels: ['Computer']
    })
    const node13 = graph.createNode({
      layout: new Rect(61, 109, 70, 40),
      labels: ['Stamps']
    })
    const node14 = graph.createNode({
      layout: new Rect(463, 435, 70, 40),
      labels: ['Dancing']
    })
    const node15 = graph.createNode({
      layout: new Rect(568, 349, 70, 40),
      labels: ['Climbing']
    })
    const node16 = graph.createNode({
      layout: new Rect(508, 222, 70, 40),
      labels: ['Soccer']
    })
    const node17 = graph.createNode({
      layout: new Rect(654, 442, 70, 40),
      labels: ['Rock']
    })
    const node18 = graph.createNode({
      layout: new Rect(679, 294, 70, 40),
      labels: ['Ice']
    })
    const node19 = graph.createNode({
      layout: new Rect(0, 272, 70, 40),
      labels: ['Planes']
    })
    const node20 = graph.createNode({
      layout: new Rect(16, 403, 70, 40),
      labels: ['Cars']
    })

    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)
    graph.createEdge(node1, node4)
    graph.createEdge(node1, node5)
    graph.createEdge(node1, node6)
    graph.createEdge(node2, node10)
    graph.createEdge(node2, node11)
    graph.createEdge(node2, node12)
    graph.createEdge(node3, node14)
    graph.createEdge(node3, node15)
    graph.createEdge(node3, node16)
    graph.createEdge(node4, node7)
    graph.createEdge(node4, node8)
    graph.createEdge(node4, node9)
    graph.createEdge(node5, node19)
    graph.createEdge(node5, node20)
    graph.createEdge(node6, node13)
    graph.createEdge(node15, node17)
    graph.createEdge(node15, node18)

    this.graphComponent!.fitGraphBounds()
  }
}
</script>

<style scoped>
.toolbar {
  position: absolute;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  top: 60px;
  left: 0;
  right: 0;
  height: 40px;
  line-height: 40px;
  padding: 0 5px;
  box-sizing: border-box;
  user-select: none;
  background-color: #f7f7f7;
  z-index: 10;
}

.graph-component-container {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
}

.graph-component-container ::v-deep .yfiles-tooltip {
  border: initial;
  padding: initial;
}

@media screen and (max-height: 500px) {
  .graph-component-container {
    top: 60px;
  }
}
</style>
