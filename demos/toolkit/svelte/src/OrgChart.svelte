<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayoutDescriptor } from 'yfiles'
  import {
    EventRecognizers,
    GraphBuilder,
    GraphComponent,
    GraphViewerInputMode,
    HierarchicLayout,
    HierarchicLayoutEdgeLayoutDescriptor,
    HierarchicLayoutRoutingStyle,
    ICommand,
    LayoutExecutor,
    LayoutExecutorAsync,
    License,
    PolylineEdgeStyle,
    Rect
  } from 'yfiles'
  import licenseValue from '../../../../lib/license.json'
  import SvelteComponentNodeStyle from './SvelteComponentNodeStyle'
  import SvgNodeComponent from './SvgNodeComponent.svelte'
  import type { Person } from './types'
  import { getLayoutExecutorAsyncMessageHandler } from './web-worker-client-message-handler'
  import { isModuleSupportedInWorker } from '../../../utils/Workarounds'

  License.value = licenseValue

  // Vite supports Web Worker out-of-the-box but relies on the browser's native Web Worker support when served in DEV mode.
  // Thus, during development, fall back to client-sided layout calculation if module workers are not supported.
  // In the production build, Web Workers are supported because the build creates cross-browser compatible workers.
  const useWorkerLayout = isModuleSupportedInWorker() || import.meta.env.PROD
  const messageHandlerPromise = useWorkerLayout ? getLayoutExecutorAsyncMessageHandler(licenseValue) : Promise.resolve(null)

  export let width = '100%'
  export let height = '100%'
  export let data: { nodes: Person[]; edges: { from: string; to: string }[] }
  export let search = ''
  export let selectedEmployee: Person | null = null

  export const methods = {
    zoomIn: () => ICommand.INCREASE_ZOOM.execute(null, graphComponent),
    zoomOut: () => ICommand.DECREASE_ZOOM.execute(null, graphComponent),
    setZoom: (zoom: number) => ICommand.ZOOM.execute(zoom, graphComponent),
    fitContent: () => ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  }

  let graphComponentDiv: HTMLDivElement
  let graphComponent: GraphComponent
  let layoutRunning = false

  $: if (graphComponent) {
    highlightNodes(search)
  }

  const layoutDescriptor: LayoutDescriptor = {
    name: 'HierarchicLayout',
    properties: {
      automaticEdgeGrouping: true,
      minimumLayerDistance: 50,
      edgeLayoutDescriptor: new HierarchicLayoutEdgeLayoutDescriptor({
        routingStyle: new HierarchicLayoutRoutingStyle({ defaultEdgeRoutingStyle: 'orthogonal' }),
        minimumFirstSegmentLength: 25,
        minimumLastSegmentLength: 25
      })
    }
  }

  onMount(() => {
    graphComponent = new GraphComponent(graphComponentDiv)
    const inputMode = new GraphViewerInputMode()
    // Disable multi-selection
    inputMode.availableCommands.remove(ICommand.SELECT_ALL)
    inputMode.multiSelectionRecognizer = EventRecognizers.NEVER
    // Expose the currently selected node to users of the component
    inputMode.addMultiSelectionFinishedListener(() => {
      // Get the selected node's tag
      let current = graphComponent.selection.selectedNodes.at(0)?.tag
      if (current) {
        // Create a proxy that updates the view whenever something in the Person object changes
        current = new Proxy<Person>(current, {
          set: (obj, prop: keyof Person, value) => {
            obj[prop] = value
            if (prop === 'name') {
              highlightNodes(search)
            }
            graphComponent.invalidate()
            return true
          }
        })
      }
      selectedEmployee = current
    })

    graphComponent.inputMode = inputMode

    // Set default node and edge styles
    graphComponent.graph.nodeDefaults.style = new SvelteComponentNodeStyle(SvgNodeComponent)
    graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '1.5px solid #AAAAAA'
    })

    // Hide the default selection, highlight, and focus decoration. The node style handles those for us.
    graphComponent.selectionIndicatorManager.enabled = false
    graphComponent.focusIndicatorManager.enabled = false
    graphComponent.highlightIndicatorManager.enabled = false

    // Initialize the graph builder and create the initial graph
    const graphBuilder = new GraphBuilder(graphComponent.graph)
    graphBuilder.createNodesSource({
      data: data.nodes,
      id: 'name',
      layout: () => new Rect(0, 0, 285, 100),
      tag: d => d
    })
    graphBuilder.createEdgesSource(data.edges, 'from', 'to')
    graphBuilder.buildGraph()

    // Ensure that the layout animates from the center, instead of the top left
    graphComponent.fitGraphBounds()

    // Calculate an initial layout
    applyLayout()

    // Clean up the GraphComponent after the Svelte component is destroyed
    return () => {
      graphComponent.cleanUp()
    }
  })

  async function applyLayout() {
    if (!layoutRunning) {
      layoutRunning = true
      try {
        if (useWorkerLayout) {
          // create an asynchronous layout executor that calculates a layout on the worker
          const messageHandler = await messageHandlerPromise
          await new LayoutExecutorAsync({
            graphComponent,
            messageHandler,
            layoutDescriptor,
            duration: '0.5s',
            animateViewport: true,
            easedAnimation: true
          }).start()
        } else {
          // client-sided fallback
          await new LayoutExecutor({
            graphComponent,
            layout: new HierarchicLayout(layoutDescriptor.properties),
            duration: '0.5s',
            animateViewport: true,
            easedAnimation: true
          }).start()
        }
      } finally {
        layoutRunning = false
      }
    }
  }

  function highlightNodes(filter: string) {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    if (filter) {
      graphComponent.graph.nodes
        .filter(n => (n.tag as Person).name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(n => highlightManager.addHighlight(n))
    }
  }
</script>

<div
  class="graphComponent"
  bind:this={graphComponentDiv}
  style="width: {width ?? '100%'}; height: {height ?? '100%'}"
>
  <slot />
</div>

<style>
  .graphComponent {
    min-width: 300px;
    min-height: 300px;
  }
</style>
