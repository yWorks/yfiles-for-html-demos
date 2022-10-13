<template>
  <div>
    <div
      v-if="displayMenu"
      class="context-menu"
      :style="`top: ${positionY}px; left: ${positionX}px;`"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { BrowserDetection } from '@/utils/BrowserDetection'

function getCenterInPage(element) {
  let left = element.clientWidth / 2.0
  let top = element.clientHeight / 2.0
  while (element.offsetParent) {
    left += element.offsetLeft
    top += element.offsetTop
    element = element.offsetParent
  }
  return { x: left, y: top }
}

// @yjs:keep=hide
export default {
  name: 'ContextMenu',
  inject: ['yFilesAPI'],
  watch: {
    displayMenu: function (val) {
      if (!val && this.$inputMode) {
        this.$inputMode.contextMenuInputMode.menuClosed()
      }
    }
  },
  data() {
    return {
      positionX: 0,
      positionY: 0,
      displayMenu: false
    }
  },
  methods: {
    /**
     * @param {GraphComponent} graphComponent
     */
    register(graphComponent) {
      this.$inputMode = graphComponent.inputMode
      this.addOpeningEventListeners(graphComponent, location => {
        const worldLocation = graphComponent.toWorldFromPage(location)
        const displayMenu = this.$inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
        if (displayMenu) {
          this.openMenu(location)
        }
      })

      this.$inputMode.contextMenuInputMode.addPopulateMenuListener((sender, evt) => {
        evt.showMenu = true
      })

      this.$inputMode.addPopulateItemContextMenuListener((sender, args) => {
        if (args.item) {
          // select the item
          graphComponent.selection.clear()
          graphComponent.selection.setSelected(args.item, true)
        }
        // emit the populate event
        this.$emit('populate-context-menu', args.item)
      })
      this.$inputMode.contextMenuInputMode.addCloseMenuListener(() => this.hide())
    },

    hide() {
      this.displayMenu = false
    },

    /**
     * @param { {x: number, y: number} } location
     */
    openMenu(location) {
      this.displayMenu = true
      this.positionX = location.x
      this.positionY = location.y
    },

    addOpeningEventListeners(graphComponent, openingCallback) {
      const componentDiv = graphComponent.div
      const contextMenuListener = evt => {
        evt.preventDefault()
        if (this.displayMenu) {
          // might be open already because of the longpress listener
          return
        }
        const me = evt
        if (evt.mozInputSource === 1 && me.button === 0) {
          // This event was triggered by the context menu key in Firefox.
          // Thus, the coordinates of the event point to the lower left corner of the element and should be corrected.
          openingCallback(getCenterInPage(componentDiv))
        } else if (me.pageX === 0 && me.pageY === 0) {
          // Most likely, this event was triggered by the context menu key in IE.
          // Thus, the coordinates are meaningless and should be corrected.
          openingCallback(getCenterInPage(componentDiv))
        } else {
          openingCallback({ x: me.pageX, y: me.pageY })
        }
      }

      // Listen for the contextmenu event
      // Note: On Linux based systems (e.g. Ubuntu), the contextmenu event is fired on mouse down
      // which triggers the ContextMenuInputMode before the ClickInputMode. Therefore handling the
      // event, will prevent the ItemRightClicked event from firing.
      // For more information, see https://docs.yworks.com/yfileshtml/#/kb/article/780/
      componentDiv.addEventListener('contextmenu', contextMenuListener, false)

      if (BrowserDetection.safariVersion > 0 || BrowserDetection.iOSVersion > 0) {
        // Additionally add a long press listener especially for iOS, since it does not fire the contextmenu event.
        let contextMenuTimer
        graphComponent.addTouchDownListener((sender, args) => {
          contextMenuTimer = setTimeout(() => {
            openingCallback(
              graphComponent.toPageFromView(graphComponent.toViewCoordinates(args.location))
            )
          }, 500)
        })
        graphComponent.addTouchUpListener(() => {
          clearTimeout(contextMenuTimer)
        })
      }

      // Listen to the context menu key to make it work in Chrome
      componentDiv.addEventListener('keyup', evt => {
        if (evt.keyCode === 93) {
          evt.preventDefault()
          openingCallback(getCenterInPage(componentDiv))
        }
      })
    }
  }
}
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
