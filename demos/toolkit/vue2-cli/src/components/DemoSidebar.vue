<template>
  <div>
    <h1 class="demo-sidebar-header">Description</h1>
    <div class="demo-sidebar-content">
      <p>
        This demo shows how to integrate yFiles in a basic
        <a href="https://cli.vuejs.org/" target="_blank">Vue CLI</a>
        setup.
      </p>
      <p>
        The application is separated into different single-file components that use Vue events to
        communicate different interactions.
      </p>
      <h2>Building the demo</h2>
      <p>
        The demo is using <code>Vue CLI</code>, thus the following steps are required to start it:
      </p>
      <code> > npm install <br />> npm run serve </code>
      <p>This will start the developments server of the Vue CLI application.</p>

      <h2>Things to Try</h2>

      <ul>
        <li>Toggle editing support using the "Toggle Editing" button.</li>
        <li>
          After the graph has been edited, click
          <img style="vertical-align: middle" src="../assets/reload-16.svg" /> to reload the initial
          sample graph.
        </li>
        <li>
          The integrated development server of the Vue CLI project will automatically update the
          application upon changes.
        </li>
      </ul>

      <h2>App Generator</h2>

      <p>
        Use the
        <a
          href="https://www.yworks.com/products/app-generator"
          target="_blank"
          rel="noopener noreferrer"
          >App Generator</a
        >
        to create visualization prototypes – quickly and easily.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DemoSidebar'
}
</script>

<style scoped>
.demo-sidebar-header {
  color: #666666;
  font-size: 1.8em;
  height: 60px;
  line-height: 60px;
  margin: 0;
  box-sizing: border-box;
  padding-left: 65px;
}

.demo-sidebar-content {
  overflow-y: auto;
  height: calc(100% - 70px);
  padding: 0 25px;
}

.demo-sidebar-content h1,
.demo-sidebar-content h2 {
  color: #666666;
}

.demo-sidebar-content a,
.demo-sidebar-content a:visited {
  text-decoration: none;
  color: #1871bd;
}

.demo-sidebar-content a:hover {
  text-decoration: none;
  color: #18468c;
}

.demo-sidebar-content ul {
  padding-left: 1.3em;
}

.demo-sidebar-content li {
  margin: 0.5em 0;
}
</style>
