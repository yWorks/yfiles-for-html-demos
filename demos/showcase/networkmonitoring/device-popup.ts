/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  type GraphComponent,
  type GraphInputMode,
  INode
} from 'yfiles'
import HTMLPopupSupport from '../../view/htmlpopup/HTMLPopupSupport'
import type { Device } from './model/Device'
import { D3BarChart } from './ui/D3BarChart'

let devicePopup: HTMLPopupSupport<INode>

/**
 * Enables an HTML panel on top of the GraphComponent's content that displays detailed information
 * about a node (device).
 */
export function initializeDeviceDetailsPopup(
  graphComponent: GraphComponent,
  graphInputMode: GraphInputMode,
  getDevice: (node: INode) => Device
): void {
  createDeviceDetailsPopup(graphComponent)

  // On item click, update the popup with the device's data
  graphInputMode.addItemClickedListener((_, evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }

    const device = getDevice(evt.item)
    updateDeviceInfoElement(device)
    updatePowerButtonState(device.enabled)
    barChart?.barChart(device)
    devicePopup.currentItem = evt.item
  })

  // On canvas click, hide the popup
  graphInputMode.addCanvasClickedListener(() => (devicePopup.currentItem = null))

  // On click of the power button, toggle a device enabled/disabled
  devicePopup.div.querySelector('#powerButton')!.addEventListener(
    'click',
    () => {
      const device = getDevice(devicePopup.currentItem!)
      device.enabled = !device.enabled
      updatePowerButtonState(device.enabled)
      graphComponent.invalidate()
    },
    true
  )
}

function createDeviceDetailsPopup(graphComponent: GraphComponent): void {
  // create a label model parameter that is used to position the node pop-up
  const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })
  const popupPositionParameter = nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  devicePopup = new HTMLPopupSupport(
    graphComponent,
    document.getElementById('nodePopupContent')!,
    popupPositionParameter
  )

  devicePopup.div
    .querySelector('#closeButton')!
    .addEventListener('click', () => (devicePopup.currentItem = null), true)
}

function updatePowerButtonState(enabled: boolean): void {
  const powerButtonPath = devicePopup!.div.querySelector('.power-button-path')!
  if (enabled) {
    powerButtonPath.classList.remove('switched-off')
  } else {
    powerButtonPath.classList.add('switched-off')
  }
}

function updateDeviceInfoElement(device: Device): void {
  // Find and update elements according to their data-id attribute
  devicePopup.div.querySelectorAll('div[data-id]').forEach((element) => {
    const key = element.getAttribute('data-id') as keyof Device
    element.textContent = String(device[key] ?? '')
  })
}

export function updateBarChart(): void {
  barChart?.animate()
}

/**
 * The bar chart which is displayed in the node popup.
 */
const barChart = initializeD3BarChart()

/**
 * Tries to load d3 for rendering the bar charts in the popup.
 * If this fails for any reason, we disable the bar chart display.
 */
function initializeD3BarChart(): D3BarChart | undefined {
  try {
    return new D3BarChart()
  } catch (ignored) {
    // if for some reason d3 has not loaded, this will be caught here,
    // and we disable the d3 charts in the popup
    const chartElement = document.getElementsByClassName('chart')[0]
    chartElement.setAttribute('class', 'no-chart')
  }
}
