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
  </div>
</template>

<script>
  export default {
    name: 'DemoToolbar'
  }
</script>

<style scoped>
  .demo-toolbar > * {
    vertical-align: middle;
  }
  .demo-toolbar button {
    line-height: normal;
    height: 24px;
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
    margin: 0 2px;
  }
  .demo-icon-yIconReload {
    background-image: url('../assets/reload-16.svg');
  }
</style>
