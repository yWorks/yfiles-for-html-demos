<script setup lang="ts">
const props = defineProps(['color', 'content', 'zoom', 'image', 'name', 'moreUrl'])
</script>

<template>
  <v-card
    :color="color"
    theme="dark"
    :prepend-avatar="image"
    :title="name"
    height="100%"
    class="d-flex flex-column node-card"
  >
    <v-card-text class="content py-2">
      {{ content }}
    </v-card-text>

    <v-card-actions class="mt-auto">
      <v-btn icon="mdi-heart" density="compact"></v-btn>
      <v-btn icon="mdi-share-variant" density="compact"></v-btn>
      <!-- anchors need a @click.stop, @pointerdown.stop directive so that the GraphComponent doesn't prevent the link from working -->
      <v-btn
        v-if="moreUrl"
        append-icon="mdi-open-in-new"
        class="ml-auto"
        variant="tonal"
        :href="moreUrl"
        target="_blank"
        @click.stop
        @pointerdown.stop
      >
        Learn more
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.content {
  min-height: 0;
  max-height: 200px;
  overflow-y: auto;
}

.node-card ::-webkit-scrollbar {
  width: 10px;
}
.node-card ::-webkit-scrollbar-track {
  background-color: transparent;
}
.node-card ::-webkit-scrollbar-thumb {
  background-clip: content-box;
  background-color: rgba(200, 200, 200, 0.8);
  border-radius: 6px;
  border: 3px solid transparent;
}
.node-card ::-webkit-scrollbar-thumb:hover {
  background-color: #bbbbbb;
}
</style>
