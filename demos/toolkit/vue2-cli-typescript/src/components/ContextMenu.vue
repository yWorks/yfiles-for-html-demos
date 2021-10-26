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

<script lang="ts">
import { detectiOSVersion, detectSafariVersion } from '@/utils/Workarounds'
import { Component, Emit, Inject, Vue, Watch } from 'vue-property-decorator'
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphViewerInputMode,
  IModelItem,
  Point,
  PopulateItemContextMenuEventArgs
} from 'yfiles'

function getCenterInPage(element: HTMLElement): Point {
  let left = element.clientWidth / 2.0
  let top = element.clientHeight / 2.0
  while (element.offsetParent) {
    left += element.offsetLeft
    top += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return new Point(left, top)
}

@Component
export default class ContextMenu extends Vue {
  private positionX = 0
  private positionY = 0
  private displayMenu = false
  // since we don't want the inputMode be reactive we set its initial value to undefined
  private $inputMode: GraphEditorInputMode | GraphViewerInputMode | undefined = undefined

  @Inject() readonly yFilesAPI!: { getGC: () => GraphComponent }

  @Watch('displayMenu')
  displayMenuChanged(val: boolean): void {
    if (!val && this.$inputMode) {
      this.$inputMode.contextMenuInputMode.menuClosed()
    }
  }

  register(graphComponent: GraphComponent): void {
    this.$inputMode = graphComponent.inputMode as GraphEditorInputMode | GraphViewerInputMode

    this.addOpeningEventListeners(graphComponent, (location: Point) => {
      const worldLocation = graphComponent.toWorldFromPage(location)
      const displayMenu = this.$inputMode!.contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (displayMenu) {
        this.openMenu(location)
      }
    })

    this.$inputMode.contextMenuInputMode.addPopulateMenuListener((sender, evt) => {
      evt.showMenu = true
    })

    this.$inputMode.addPopulateItemContextMenuListener(
      (sender: object, args: PopulateItemContextMenuEventArgs<IModelItem>) =>
        this.selectItem(args.item, graphComponent)
    )

    this.$inputMode.contextMenuInputMode.addCloseMenuListener(() => this.hide())
  }

  @Emit('populate-context-menu')
  selectItem(item: IModelItem | null, graphComponent: GraphComponent): void {
    if (item) {
      // select the item
      graphComponent.selection.clear()
      graphComponent.selection.setSelected(item, true)
    }
  }

  hide(): void {
    this.displayMenu = false
  }

  openMenu(location: Point): void {
    this.displayMenu = true
    this.positionX = location.x
    this.positionY = location.y
  }

  addOpeningEventListeners(
    graphComponent: GraphComponent,
    openingCallback: (location: Point) => void
  ): void {
    const componentDiv = graphComponent.div
    const contextMenuListener = (evt: MouseEvent) => {
      evt.preventDefault()
      if (this.displayMenu) {
        // might be open already because of the long press listener
        return
      }
      const me = evt
      if ((evt as any).mozInputSource === 1 && me.button === 0) {
        // This event was triggered by the context menu key in Firefox.
        // Thus, the coordinates of the event point to the lower left corner of the element and should be corrected.
        openingCallback(getCenterInPage(componentDiv))
      } else if (me.pageX === 0 && me.pageY === 0) {
        // Most likely, this event was triggered by the context menu key in IE.
        // Thus, the coordinates are meaningless and should be corrected.
        openingCallback(getCenterInPage(componentDiv))
      } else {
        openingCallback(new Point(me.pageX, me.pageY))
      }
    }

    // Listen for the contextmenu event
    // Note: On Linux based systems (e.g. Ubuntu), the contextmenu event is fired on mouse down
    // which triggers the ContextMenuInputMode before the ClickInputMode. Therefore handling the
    // event, will prevent the ItemRightClicked event from firing.
    // For more information, see https://docs.yworks.com/yfileshtml/#/kb/article/780/
    componentDiv.addEventListener('contextmenu', contextMenuListener, false)

    if (detectSafariVersion() > 0 || detectiOSVersion() > 0) {
      // Additionally add a long press listener especially for iOS, since it does not fire the contextmenu event.
      let contextMenuTimer: number
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
      if (evt.key === 'ContextMenu') {
        evt.preventDefault()
        openingCallback(getCenterInPage(componentDiv))
      }
    })
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
