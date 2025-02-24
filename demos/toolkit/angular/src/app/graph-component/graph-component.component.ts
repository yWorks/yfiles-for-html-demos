/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  NgZone,
  ViewChild
} from '@angular/core'
import { GraphComponentService } from '../services/graph-component.service'
import {
  Command,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  type QueryItemToolTipEventArgs,
  Point,
  Rect,
  TimeSpan
} from '@yfiles/yfiles'
import { TooltipComponent } from '../tooltip/tooltip.component'
import { Person } from '../person'

@Component({
  selector: 'graph-component',
  templateUrl: './graph-component.component.html',
  styleUrls: ['./graph-component.component.css']
})
export class GraphComponentComponent implements AfterViewInit {
  @ViewChild('graphComponentRef') graphComponentRef!: ElementRef

  contextMenuActions: { title: string; action: () => void }[] = []
  private graphComponent!: GraphComponent

  constructor(
    private graphComponentService: GraphComponentService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private zone: NgZone,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngAfterViewInit(): void {
    // add the GraphComponent to the div of this component
    this.graphComponent = this.graphComponentService.getGraphComponent()
    const div = this.graphComponent.htmlElement
    div.style.height = '100%'
    this.graphComponentRef.nativeElement.appendChild(div)

    // register tooltips on nodes and edges
    this.initializeTooltips()
  }

  onPopulateContextMenu(item: IModelItem) {
    const contextMenuItems = []
    if (item instanceof INode || item instanceof IEdge) {
      contextMenuItems.push({
        title: 'Zoom to item',
        action: () => {
          // center the item in the viewport
          const targetBounds =
            item instanceof INode
              ? item.layout.toRect()
              : Rect.add(item.sourceNode.layout.toRect(), item.targetNode.layout.toRect())
          this.graphComponent.executeCommand(
            Command.ZOOM,
            targetBounds.getEnlarged(50 / this.graphComponent.zoom)
          )
        }
      })
    }
    this.contextMenuActions = contextMenuItems
  }

  /**
   * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for the 'query-item-tool-tip'
   * event of the {@link GraphViewerInputMode} using the {@link QueryItemToolTipEventArgs} parameter.
   * The {@link QueryItemToolTipEventArgs} parameter provides three relevant properties:
   * handled, queryLocation, and toolTip. The {@link QueryItemToolTipEventArgs.handled} property is a flag which indicates
   * whether the tooltip was already set by one of possibly several tooltip providers. The
   * {@link QueryItemToolTipEventArgs.queryLocation} property contains the mouse position for the query in world coordinates.
   * The {@link QueryItemToolTipEventArgs.toolTip} is set by setting the ToolTip property.
   */
  private initializeTooltips(): void {
    const inputMode = this.graphComponent.inputMode as GraphViewerInputMode

    // show tooltips only for nodes and edges
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

    // Customize the tooltip's behavior to our liking.
    const toolTipInputMode = inputMode.toolTipInputMode
    toolTipInputMode.toolTipLocationOffset = new Point(15, 15)
    toolTipInputMode.delay = TimeSpan.fromMilliseconds(500)
    toolTipInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addEventListener('query-item-tool-tip', (evt) => {
      if (evt.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      evt.toolTip = this.createTooltipContent(evt.item!)

      // Indicate that the tooltip content has been set.
      evt.handled = true
    })
  }

  /**
   * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
   * return a compiled Angular component.
   */
  private createTooltipContent(item: IModelItem) {
    let tooltipTitle = ''
    let tooltipContent = ''

    if (item instanceof INode) {
      tooltipTitle = (item.tag as Person).name
      tooltipContent = (item.tag as Person).businessUnit
    } else if (item instanceof IEdge) {
      tooltipTitle = 'Subordinate'
      tooltipContent = (item.targetNode.tag as Person).name
    }

    // Retrieve the factory for TooltipComponents
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent)
    // Have the factory create a new TooltipComponent
    const container = document.createElement('div')
    const tooltipRef = componentFactory.create(this.injector, undefined, container)
    // Attach the component to the Angular component tree so that change detection will work
    this.appRef.attachView(tooltipRef.hostView)
    // Assign the NodeComponent's item input property

    this.zone.run(() => {
      tooltipRef.instance.title = tooltipTitle
      tooltipRef.instance.content = tooltipContent
    })

    return container
  }
}
