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

<aside class='demo-page__description'>
  <div class='demo-description__header'>
    <a href='https://www.yworks.com/products/yfiles' class='demo-description__logo'></a>
  </div>
  <div class='demo-description__content'>
    <h1>Svelte Integration Demo</h1>
    <p>
      This demo shows how to integrate yFiles for HTML with the <a
      href='https://svelte.dev/'
      rel='noopener'
      target='_blank'>Svelte</a
    > framework, using Vite for development and deployment.
    </p>
    <p>The main features shown here are:</p>
    <ul>
      <li>
        A component wrapper around GraphComponent that represents an organization chart and gets its data passed in. All
        handling of the graph and the yFiles GraphComponent is contained within.
      </li>
      <li>
        A custom SVG-based node style with the help of a <a
        href='https://svelte.dev/docs#component-format'
        rel='noopener'
        target='_blank'>Svelte single file component</a
      > that supports hot-reloading during development.
      </li>
      <li>
        A layout algorithm in a Web Worker without blocking the UI is loaded using <a
        href='https://vitejs.dev/guide/features.html#web-workers'
        rel='noopener'
        target='_blank'>Vite's support for Web Workers</a
      >. Vite's development build relies on native browser support for <a href='https://web.dev/module-workers/'
        target='_blank'>module workers</a> and therefore currently only works in some browsers (e.g. Chrome). For
        unsupported browsers, client-sided layout calculation is used as fallback.
      </li>
    </ul>
    <h2>Things to try</h2>
    <p>
      Zoom into the chart to see more details. Level-of-detail rendering ensures that even at low zoom levels important
      information remains readable.
    </p>
    <p>
      Select employees in the chart and change their details in the panel on the right side. Those changes are
      immediately reflected in the visualization.
    </p>
    <p>See the sources for details.</p>
  </div>
</aside>

<div class='demo-page-header'>
  <div class='demo-header'>
    <a href='https://www.yworks.com/products/yfiles' target='_blank'> <img src='ylogo.svg'
      class='demo-header__y-logo' /> </a>
    <div class='demo-header__breadcrumb-wrapper'>
      <a href='https://www.yworks.com/products/yfiles'
        class='demo-header__breadcrumb demo-header__breadcrumb--link'
        target='_blank'>yFiles for HTML</a>

      <a href='https://live.yworks.com'
        style='cursor: pointer;' target='_blank'
        class='demo-header__breadcrumb demo-header__breadcrumb--link'>Demos</a> <span class='demo-header__breadcrumb'>Svelte Integration Demo [yFiles for HTML]</span>
    </div>
  </div>
</div>

<div class="demo-page__toolbar">
  <button
    title="Zoom in"
    class="demo-icon-yIconZoomIn"
    on:click={graphComponentMethods.zoomIn}></button>
  <button
    title="Zoom to original size"
    class="demo-icon-yIconZoomOriginal"
    on:click={() => graphComponentMethods.setZoom(1)}></button>
  <button
    title="Zoom out"
    class="demo-icon-yIconZoomOut"
    on:click={graphComponentMethods.zoomOut}></button>
  <button
    title="Fit content"
    class="demo-icon-yIconZoomFit"
    on:click={graphComponentMethods.fitContent}></button>
  <span class="demo-separator"></span>
  <input class="search" bind:value={search} placeholder="Search names" />
</div>

<div class="demo-page__main">
  <div class="demo-main__graph-component">
    <OrgChart
      data={graphData}
      bind:methods={graphComponentMethods}
      {search}
      bind:selectedEmployee
    />
  </div>
  <aside class="demo-main__sidebar">
    <PropertiesView person={selectedEmployee} />
  </aside>
</div>

<style>
  :global(body) {
    font-family: Tahoma, Verdana, sans-serif;
  }

  .demo-page-header {
    grid-area: header;
    background: linear-gradient(to right, #29323c 0%, #38434f 100%);
  }
</style>
