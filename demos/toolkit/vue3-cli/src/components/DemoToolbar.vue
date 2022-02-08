<template>
  <div class="demo-toolbar">
    <button class="demo-icon-yIconReload" @click="$emit('reload-graph')"></button>
    <span class="demo-separator"></span>
    <input
      type="checkbox"
      id="toggleEditable"
      class="demo-toggle-button labeled"
      @change="$emit('toggle-editable', $event.target.checked)"
    />
    <label for="toggleEditable">Toggle Editing</label>
    <span class="demo-separator"></span>
    <button class="demo-icon-yIconLayout labeled" @click="$emit('layout')">Layout</button>
    <span class="demo-separator"></span>
    <input
      v-model.trim="searchString"
      class="search"
      placeholder="Search Nodes"
      @input="$emit('search-query-change', $event.target.value)"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DemoToolbar',
  emits: ['reload-graph', 'toggle-editable', 'layout', 'search-query-change'],
  setup() {
    const searchString = ''

    return { searchString }
  }
})
</script>

<style scoped>
.demo-toolbar {
  display: flex;
  align-items: center;
  height: 100%;
}

.demo-toolbar button {
  line-height: normal;
  height: 24px;
}

.demo-toolbar button.labeled {
  background-position-x: left;
  width: inherit;
  padding: 0 2px;
}

.demo-toolbar button.labeled[class*='demo-icon'] {
  padding-left: 24px;
  background-position-x: 2px;
}

.demo-toolbar button,
.demo-toolbar > label {
  display: inline-block;
  outline: none;
  border: none;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-color: transparent;
  height: 24px;
  width: 24px;
  line-height: 24px;
  box-sizing: border-box;
  padding: 0;
  cursor: pointer;
}

.demo-toolbar button:hover,
.demo-toolbar > label:hover {
  background-color: #dedede;
}

.demo-toggle-button {
  display: none !important;
}

.demo-toggle-button:checked + label {
  background-color: #dedede;
}

.demo-toggle-button:checked:hover + label {
  background-color: #b2b2b2;
}

.demo-toggle-button:disabled + label {
  opacity: 0.5;
  cursor: default;
  background-color: transparent;
}

.demo-toggle-button.labeled + label {
  background-position-x: left;
  width: inherit;
  padding: 0 2px;
  line-height: 24px;
}

.demo-toolbar button:active,
.demo-toolbar > label:active,
.demo-toolbar .demo-toggle-button:checked:active + label {
  background-color: #b2b2b2;
}

.demo-toolbar button:disabled,
.demo-toolbar > .demo-toggle-button:disabled + label {
  opacity: 0.5;
  cursor: default;
  background-color: transparent;
}

.demo-separator {
  height: 20px;
  width: 1px;
  background: #999;
  display: inline-block;
  vertical-align: middle;
  margin: 0 10px;
}

.demo-icon-yIconReload {
  background-image: url('../assets/reload-16.svg');
}

.demo-icon-yIconLayout {
  background-image: url('../assets/play2-16.svg');
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
@media screen and (max-height: 500px) {
  .demo-toolbar {
    top: 30px !important;
    height: 30px !important;
    line-height: 30px !important;
  }
}
</style>
