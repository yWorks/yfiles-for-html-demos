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
import { type GraphComponent, GraphOverviewComponent, License } from 'yfiles'
import { CompanyStructureView } from './CompanyStructureView'

import { fetchLicense } from 'demo-resources/fetch-license'
import { CompanyOwnershipSearch } from './CompanyOwnershipSearch'
import { PropertiesView } from './PropertiesView'
import { initializeConverters } from './styles/TableNodeStyle'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * The component for the search in the graph
 */
let graphSearch: CompanyOwnershipSearch
/**
 * The component on the right that displays the node properties on click.
 */
let propertiesView: PropertiesView
/**
 * The class that manages the graph component and the handling of the data
 */
let companyStructureView: CompanyStructureView

/**
 * Runs this demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  companyStructureView = new CompanyStructureView('#graphComponent')
  const graphComponent = companyStructureView.graphComponent
  applyDemoTheme(graphComponent)

  // add the listeners for the companyStructureView
  companyStructureView.addNodeClickedListener((node) => propertiesView.showNodeProperties(node))
  companyStructureView.addEdgeClickedListener((edge) => propertiesView.showEdgeProperties(edge))

  // initialize graph search
  graphSearch = new CompanyOwnershipSearch(graphComponent)
  CompanyOwnershipSearch.registerEventListener(
    document.querySelector<HTMLInputElement>('#searchBox')!,
    graphSearch
  )

  // initialize the converters needed for the template node style
  initializeConverters()

  // create the properties view
  createPropertiesView()

  // load the graph
  await loadGraph(graphComponent)

  // bind the buttons to their functionality
  initializeUI(graphComponent)

  // initialize the overview component
  new GraphOverviewComponent('#overviewComponent', graphComponent)
}

/**
 * Creates the properties view that displays the information about the current employee.
 */
function createPropertiesView(): void {
  const propertiesViewElement = document.getElementById('propertiesView')!
  propertiesView = new PropertiesView(propertiesViewElement)
}

/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document
    .querySelector<HTMLSelectElement>('#styles')!
    .addEventListener('change', async (event) => {
      const select = event.target as HTMLSelectElement
      companyStructureView.useShapeNodeStyle = select.value === 'shapes'
      await loadGraph(graphComponent)
    })

  document.querySelectorAll<HTMLButtonElement>('[data-command="Shapes"]').forEach((element) => {
    element.addEventListener('click', async () => {
      document.querySelector<HTMLSelectElement>('#styles')!.value = 'shapes'
      companyStructureView.useShapeNodeStyle = true
      await loadGraph(graphComponent)
    })
  })
  document.querySelectorAll<HTMLButtonElement>('[data-command="Tables"]').forEach((element) => {
    element.addEventListener('click', async () => {
      document.querySelector<HTMLSelectElement>('#styles')!.value = 'tables'
      companyStructureView.useShapeNodeStyle = false
      await loadGraph(graphComponent)
    })
  })
}

/**
 * Resets the application and loads the new graph.
 * @param graphComponent The given graphComponent
 * @param animate True if the layout should be animated, false otherwise
 */
async function loadGraph(graphComponent: GraphComponent, animate = true): Promise<void> {
  setUIDisabled(true)
  graphComponent.graph.clear()
  // update the search string
  document.querySelector<HTMLInputElement>('#searchBox')!.value = ''
  graphSearch.updateSearch('')

  await companyStructureView.loadGraph('./resources/company-data.json')
  await companyStructureView.layout(animate)
  setUIDisabled(false)
}

/**
 * Updates the elements of the UI's state and checks whether the buttons should be enabled or not.
 * @param disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  document.querySelector<HTMLSelectElement>('#styles')!.disabled = disabled
  document.querySelectorAll<HTMLButtonElement>('[data-command="Shapes"]').forEach((element) => {
    element.disabled = disabled
  })
  document.querySelectorAll<HTMLButtonElement>('[data-command="Tables"]').forEach((element) => {
    element.disabled = disabled
  })
}

void run().then(finishLoading)
