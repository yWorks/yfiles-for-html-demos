/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import '../../../resources/style/demo.css'

/**
 * This demo shows how to load yFiles lazily.
 * Often, applications don't need the diagramming component to be ready as soon as the page loads,
 * but rather when a certain feature of the overall application is used or maybe just loading it
 * delayed for a better user experience.
 *
 * Therefore, this webpack sample is configured to provide necessary yFiles functionality in a
 * separate chunk and it is only loaded when the user clicks the button for the diagram component.
 *
 * Additionally, webpack tree-shaking mechanism automatically only puts the yFiles modules in the
 * chunk that is needed for the implemented functionality.
 */
const loadDiagramComponentBtn = document.getElementById('load-diagram-component-btn')
loadDiagramComponentBtn.addEventListener('click', async () => {
  // set loading state
  loadDiagramComponentBtn.className = 'loading'

  // lazy load yFiles
  const { DiagramComponent } = await import(
    /* webpackChunkName: "diagram-component" */ './diagram-component'
  )

  // hide the note and remove the inactive background color
  const gcContainer = document.getElementById('graphComponent')
  gcContainer.removeChild(gcContainer.firstElementChild)
  gcContainer.className = ''

  // instantiate a new GraphComponent
  const diagramComponent = new DiagramComponent(gcContainer)
})
