<template>
  <div className="diagram-tooltip">
    <h4>{{ title }}</h4>
    <p>{{ content }}</p>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Tooltip',
  setup() {
    const title = ref('Tooltip')
    const content = ref('Tooltip Content')

    return { title, content }
  }
})
</script>

<style>
.yfiles-tooltip {
  /* overwrite the default tooltip styling */
  border: initial;
  padding: initial;
}

.diagram-tooltip {
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
  padding: 10px 24px;
  background-color: white;
  border-radius: 4px;
}

.diagram-tooltip h4 {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  font-family: Roboto, sans-serif;
  margin: 0 0 4px 0;
}

.diagram-tooltip p {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  letter-spacing: 0.03125em;
  font-family: Roboto, sans-serif;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
}
</style>
