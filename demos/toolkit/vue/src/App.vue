<template>
  <div id="app">
    <aside class="demo-sidebar demo-description">
      <demo-sidebar></demo-sidebar>
    </aside>

    <div class="demo-content">
      <div class="demo-header">
        <a href="https://www.yworks.com/products/yfiles" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 113.39 113.39" class="demo-y-logo">
            <path
              d="M12.39 47.29l.1 19.3a27.74 27.74 0 0 0 13.9 23.8l16.8 9.6a27.32 27.32 0 0 0 27.5-.2L87.39 90A27.44 27.44 0 0 0 101 66.09l-.1-19.4A27.86 27.86 0 0 0 87 22.89l-16.7-9.5a27.32 27.32 0 0 0-27.5.2l-16.7 9.8a27.5 27.5 0 0 0-13.7 23.9"
              fill="#fff"
            />
            <path
              d="M66.39 75.79a13.53 13.53 0 0 1 2 3.1 5.64 5.64 0 0 1-.9 6.2 5.54 5.54 0 0 1-7.4.7 6 6 0 0 1-2.2-5 10.86 10.86 0 0 1 1.1-3.9 25.54 25.54 0 0 0 1.4-3.5 14.12 14.12 0 0 0 .4-4.6c-.1-1.6-.3-3.1-.5-4.7a11.49 11.49 0 0 0-2.8-6 14.65 14.65 0 0 0-5.2-3.4c-.9-.4-1.7-.8-2.6-1.1a13.45 13.45 0 0 0-6.3-.9c-1.4.1-2.7.4-4.1.4a6.21 6.21 0 0 1-4.4-1.5 5.48 5.48 0 0 1-1.1-7 5.55 5.55 0 0 1 7.8-1.7 8 8 0 0 1 2.3 2.2l1.7 2.3a12.94 12.94 0 0 0 3.3 3.3 14 14 0 0 0 3 1.5c1 .4 2 .9 3 1.3a11.55 11.55 0 0 0 5.5.8 12.46 12.46 0 0 0 4.6-1.5c1.2-.7 2.3-1.6 3.5-2.4a13.43 13.43 0 0 0 3.2-3.1 14.59 14.59 0 0 0 1.7-3 15.9 15.9 0 0 1 2.1-4.1 6.14 6.14 0 0 1 3.8-2.5 5.2 5.2 0 0 1 5 1.6 5.26 5.26 0 0 1 1.4 4.6 5.74 5.74 0 0 1-3 4.1 13.58 13.58 0 0 1-4.9 1.2 15.19 15.19 0 0 0-5.1 1.2c-.6.3-1.1.6-1.6.9a38.77 38.77 0 0 0-3.3 2.3 14.06 14.06 0 0 0-3.6 3.7 12.57 12.57 0 0 0-1.5 3.8 17 17 0 0 0 0 4.5 22.26 22.26 0 0 0 .5 3.6 13 13 0 0 0 1.8 4.6c.5.7 1 1.4 1.4 2"
              fill="#29323c"
            />
            <path
              d="M71.39 64a13.54 13.54 0 0 1 3.6.8 5.85 5.85 0 0 1 3.8 5 5.39 5.39 0 0 1-4.7 5.7 5.79 5.79 0 0 1-5.1-2 10 10 0 0 1-1.9-3.5 36.83 36.83 0 0 0-1.5-3.5 10.88 10.88 0 0 0-2.9-3.5c-1.2-1-2.4-2-3.7-2.9a11.46 11.46 0 0 0-6.2-2.3 13.93 13.93 0 0 0-6.1 1.3 27.73 27.73 0 0 1-2.6 1A13.93 13.93 0 0 0 39 64c-.9 1.1-1.7 2.2-2.6 3.2a7 7 0 0 1-4.2 2.1 5.47 5.47 0 0 1-5.7-4.2 5.54 5.54 0 0 1 4.3-6.7 8.55 8.55 0 0 1 3.2-.1c.9.1 1.9.3 2.8.4a18.48 18.48 0 0 0 4.7 0 19.66 19.66 0 0 0 3.2-1l3-1.2a12.23 12.23 0 0 0 4.5-3.3 11.72 11.72 0 0 0 2.2-4.3c.3-1.4.5-2.8.7-4.2a17 17 0 0 0 .1-4.5 17.83 17.83 0 0 0-.9-3.3 32.55 32.55 0 0 1-1.5-4.4 6.49 6.49 0 0 1 .9-4.5 5.19 5.19 0 0 1 4.7-2.4 5.36 5.36 0 0 1 4.3 2.3 5.56 5.56 0 0 1 .8 5 12.06 12.06 0 0 1-2.7 4.3 15.66 15.66 0 0 0-2.8 4.4 12.09 12.09 0 0 0-.5 1.8c-.3 1.3-.5 2.6-.7 4a13 13 0 0 0 .1 5.2 12.45 12.45 0 0 0 1.7 3.7 23.45 23.45 0 0 0 3.1 3.2 32.53 32.53 0 0 0 2.9 2.3 13 13 0 0 0 4.5 2 19.53 19.53 0 0 1 2.3.2"
              fill="#29323c"
            />
          </svg>
        </a>
        <a href="https://www.yworks.com/products/yfiles" target="_blank">yFiles for HTML</a>
        <a href="../../../README.html" style="cursor: pointer" target="_blank" class="demo-title">
          Demos
        </a>
        <span class="demo-title">Vue Demo</span>
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
  font-size: 14px;
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
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 14px;
  color: #343f4a;
}

.demo-header {
  display: flex;
  position: absolute;
  top: 0;
  height: 60px;
  left: 0;
  right: 0;
  background: transparent linear-gradient(90deg, #29323c 0%, #38434f 100%) 0 0 no-repeat padding-box;
  color: white;
  font-size: 1.1rem;
  z-index: 16;
  transition: padding-left 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0s;
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
}

.demo-title {
  display: inline-block;
  padding: 0 5px 0 30px !important;
  height: 60px;
  line-height: 60px;
  color: white;
  cursor: default;
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
  background: #e0edf0;
  z-index: 15;
  line-height: 140%;
  overflow-y: auto;
  color: #343f4a;
  padding-left: 0.2em;
}

.demo-sidebar.demo-description {
  left: 0;
  width: 320px;
  overflow: hidden;
  right: auto;
  background-color: #e0edf0;
  padding-top: 60px;
}

@media screen and (max-height: 500px) {
  .demo-header {
    height: 30px;
    font-size: 12px;
  }

  .demo-header .demo-y-logo {
    height: 30px;
    width: 30px;
    line-height: 30px;
  }

  .demo-header a {
    height: 30px;
    line-height: 30px;
  }

  .demo-title {
    height: 30px;
    line-height: 30px;
    background-size: 12px 12px;
  }
}

.graph-overview-component {
  position: absolute;
  left: 20px;
  top: 120px;
}
</style>
