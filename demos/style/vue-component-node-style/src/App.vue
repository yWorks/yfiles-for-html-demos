<script lang="ts">
import { defineComponent } from 'vue'
import DiagramComponent from '@/components/DiagramComponent.vue'

export default defineComponent({ components: { DiagramComponent } })
</script>

<template>
  <div class="demo-main__graph-component">
    <diagram-component />
  </div>
</template>

<style scoped></style>
