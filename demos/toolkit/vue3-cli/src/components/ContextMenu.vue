<template>
  <div>
    <div
      v-if="display"
      class="context-menu"
      :style="`top: ${location.y}px; left: ${location.x}px;`"
    >
      <button
        v-for="item in items"
        :key="item.title"
        @click="performAction(item)"
        v-text="item.title"
      ></button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ContextMenu',
  emits: ['hide-context-menu'],
  props: ['location', 'display', 'items'],
  setup(props, ctx) {
    function performAction(item) {
      item.action()
      ctx.emit('hide-context-menu')
    }

    return { performAction }
  }
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
}

.context-menu button {
  padding: 4px 8px;
  font-weight: 500;
  font-family: Roboto, sans-serif;
}
</style>
