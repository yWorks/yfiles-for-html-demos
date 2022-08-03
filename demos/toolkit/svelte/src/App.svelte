<script lang="ts">
  import { EDGE_DATA, NODE_DATA } from './data'
  import PropertiesView from './PropertiesView.svelte'
  import type { Person } from './types'
  import OrgChart from './OrgChart.svelte'

  let graphData = { nodes: NODE_DATA, edges: EDGE_DATA }
  let graphComponentMethods: {
    zoomIn: () => void
    zoomOut: () => void
    setZoom: (zoom: number) => void
    fitContent: () => void
  }
  let search: string = ''
  let selectedEmployee: Person | null
</script>

<div class="app">
  <aside class="demo-sidebar demo-left">
      <h1 class="demo-sidebar-header">
        <a href="https://www.yworks.com/products/yfiles" class="demo-left-logo">&nbsp;</a>
      </h1>
      <div class="demo-sidebar-content">
        <h1>Svelte Integration Demo</h1>
      <p>
        This demo shows how to integrate yFiles for HTML with the <a
          href="https://svelte.dev/"
          rel="noopener"
          target="_blank">Svelte</a
        > framework, using Vite for development and deployment.
      </p>
      <p>The main features shown here are</p>
      <ul>
        <li>
          A component wrapper around GraphComponent that represents an organization chart and gets
          its data passed in. All handling of the graph and the yFiles GraphComponent is contained
          within.
        </li>
        <li>
          A custom SVG-based node style with the help of a <a
            href="https://svelte.dev/docs#component-format"
            rel="noopener"
            target="_blank">Svelte single file component</a
          >
          that supports hot-reloading during development.
        </li>
        <li>
          A layout algorithm in a Web Worker without blocking the UI is loaded using <a
            href="https://vitejs.dev/guide/features.html#web-workers"
            rel="noopener"
            target="_blank">Vite's support for Web Workers</a
          >.  Vite's development build relies on native browser support for
          <a href="https://web.dev/module-workers/" target="_blank">module workers</a>
          and therefore currently only works in some browsers (e.g. Chrome).
          For unsupported browsers, client-sided layout calculation is used as fallback.
        </li>
      </ul>
      <h2>Things to try</h2>
      <p>
        Zoom into the chart to see more details. Level-of-detail rendering ensures that even at low
        zoom levels important information remains readable.
      </p>
      <p>
        Select employees in the chart and change their details in the panel on the right side. Those
        changes are immediately reflected in the visualization.
      </p>
      <p>See the sources for details.</p>
    </div>
  </aside>

  <div class="demo-content">
    <div class="demo-header">
      <a href="https://www.yworks.com" target="_blank">
        <img src="ylogo.svg" alt="yFiles Logo" class="demo-y-logo" />
      </a>
      <a href="https://www.yworks.com/products/yfiles" target="_blank">yFiles for HTML</a>
      <a href="https://live.yworks.com" style="cursor: pointer;" target="_blank" class="demo-title">Demos</a>
      <span class="demo-title">Svelte Integration Demo [yFiles for HTML]</span>
    </div>
    <div class="demo-toolbar">
      <button
        title="Zoom in"
        class="demo-icon-yIconZoomIn demo-toolbar-button"
        on:click={graphComponentMethods.zoomIn}></button>
      <button
        title="Zoom to original size"
        class="demo-icon-yIconZoomOriginal demo-toolbar-button"
        on:click={() => graphComponentMethods.setZoom(1)}></button>
      <button
        title="Zoom out"
        class="demo-icon-yIconZoomOut demo-toolbar-button"
        on:click={graphComponentMethods.zoomOut}></button>
      <button
        title="Fit content"
        class="demo-icon-yIconZoomFit demo-toolbar-button"
        on:click={graphComponentMethods.fitContent}></button>
      <span class="demo-separator"></span>
      <input class="search" bind:value={search} placeholder="Search names" />
    </div>
    <div class="main-panel">
      <div class="graph-component-container">
        <OrgChart
          data={graphData}
          bind:methods={graphComponentMethods}
          {search}
          bind:selectedEmployee
        />
      </div>
      <div class="demo-sidebar demo-right">
        <PropertiesView person={selectedEmployee} />
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Tahoma, Verdana, sans-serif;
  }

  :global(.demo-sidebar.demo-right) {
    top: 0;
  }

  .main-panel {
    top: 100px;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
  }

  .graph-component-container {
    position: absolute;
    right: 320px;
    left: 0;
    top: 0;
    bottom: 0;
  }

  .search {
    line-height: 20px;
    padding: 4px 8px;
    font-size: 14px;
    letter-spacing: normal;
    width: 300px;
  }

  .search:focus {
    outline: none;
  }
</style>
