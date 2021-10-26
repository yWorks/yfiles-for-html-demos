<template>
  <div id="app">
    <aside class="demo-sidebar demo-description">
      <demo-sidebar></demo-sidebar>
    </aside>

    <div class="demo-content">
      <div class="demo-header">
        <a href="https://www.yworks.com" target="_blank">
          <img src="../../../resources/icons/ylogo.svg" class="demo-y-logo" />
        </a>
        <a href="../../../README.html" target="_blank">yFiles for HTML</a>
        <span class="demo-title">Vue CLI (Vue 3) TypeScript Demo [yFiles for HTML]</span>
      </div>

      <diagram-component></diagram-component>
      <diagram-overview-component class="graph-overview-component"></diagram-overview-component>
    </div>
  </div>
</template>

<script lang="ts">
import DiagramComponent from './components/DiagramComponent.vue'
import DemoSidebar from './components/DemoSidebar.vue'
import DiagramOverviewComponent from './components/DiagramOverviewComponent.vue'
import { defineComponent, provide } from 'vue'

export default defineComponent({
  name: 'App',
  components: {
    DemoSidebar,
    DiagramComponent,
    DiagramOverviewComponent
  },
  setup() {
    // We need to provide a GraphComponent instance to the child components.
    // However, the GraphComponent instance can only be created in the DiagramComponent later.
    // So this provider is then filled from there.
    const graphComponentProvider = { getGraphComponent: () => null }
    provide('GraphComponentProvider', graphComponentProvider)
  }
})
</script>

<style>
html,
body {
  position: fixed;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  touch-action: none;
  overscroll-behavior-y: contain;
  overflow: hidden;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  color: #333333;
}
</style>
<style scoped>
.demo-content {
  position: absolute;
  top: 0;
  left: 320px;
  right: 0;
  bottom: 0;
}

.demo-header {
  position: absolute;
  top: 0;
  height: 60px;
  left: 0;
  right: 0;
  background-color: #29323c;
  color: white;
}

.demo-y-logo {
  width: 60px;
  height: 60px;
  display: inline-block;
  padding: 5px;
  box-sizing: border-box;
  border-color: transparent;
}

.demo-header a {
  display: inline-block;
  height: 60px;
  text-decoration: none;
  color: white;
  line-height: 60px;
  padding: 0 5px;
  vertical-align: top;
  font-size: 1.5em;
}

.demo-title {
  display: inline-block;
  padding: 0 5px 0 30px;
  height: 60px;
  line-height: 60px;
  color: white;
  cursor: default;
  font-size: 1.5em;
  letter-spacing: 1px;
  background: url('./assets/header-angle.svg') no-repeat 5px 50%;
  background-size: 20px 20px;
  vertical-align: top;
}

.demo-sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 320px;
  box-sizing: border-box;
  background: #f7f7f7;
  z-index: 15;
  line-height: 150%;
  left: 0;
  overflow-y: auto;
}

@media screen and (max-height: 500px) {
  .demo-header {
    height: 30px;
    font-size: 10px;
  }

  .toolbar {
    top: 30px;
    height: 30px;
    line-height: 30px;
  }

  .demo-header .demo-y-logo {
    height: 30px;
    line-height: 30px;
  }

  .demo-header a {
    height: 30px;
    line-height: 30px;
  }

  .demo-title {
    height: 30px;
    line-height: 30px;
  }
}

.graph-overview-component {
  position: absolute;
  left: 20px;
  top: 120px;
}
</style>
