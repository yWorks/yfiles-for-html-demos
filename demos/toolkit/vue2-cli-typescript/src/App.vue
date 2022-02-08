<template>
  <div id="app">
    <aside class="demo-sidebar demo-description">
      <demo-sidebar></demo-sidebar>
    </aside>

    <div class="demo-content">
      <div class="demo-header">
        <a href="https://www.yworks.com/products/yfiles" target="_blank">
          <img src="../../../resources/icons/ylogo.svg" class="demo-y-logo" />
        </a>
        <a href="https://www.yworks.com/products/yfiles" target="_blank">yFiles for HTML</a>
        <a href="../../../README.html" style="cursor: pointer" target="_blank" class="demo-title"
          >Demos</a
        >
        <span class="demo-title">Vue CLI (Vue 2) TypeScript Demo</span>
      </div>

      <diagram-component ref="GraphComponent"></diagram-component>
      <diagram-overview-component class="diagram-overview-component"></diagram-overview-component>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Ref, Vue } from 'vue-property-decorator'
import DemoSidebar from './components/DemoSidebar.vue'
import DiagramComponent from './components/DiagramComponent.vue'
import DiagramOverviewComponent from './components/DiagramOverviewComponent.vue'

@Component({
  components: {
    DemoSidebar,
    DiagramComponent,
    DiagramOverviewComponent
  }
})
export default class App extends Vue {
  @Ref() readonly diagramComponent!: DiagramComponent
  @Provide() yFilesAPI = {
    getGC: () => this.diagramComponent.graphComponent
  }
}
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

.diagram-overview-component {
  position: absolute;
  left: 20px;
  top: 120px;
}
</style>
