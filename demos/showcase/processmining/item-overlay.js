/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * Displays ID and any data of the provided entries as a graph overlay.
 */
export function showItemOverlay(items, location, caseData) {
  const graphOverlayElement = document.getElementById('graph-overlay')
  if (!graphOverlayElement) return
  graphOverlayElement.innerHTML = ''
  if (!items[0]) return
  const detailsDiv = document.createElement('div')
  detailsDiv.classList.add('details-popup')
  detailsDiv.style.left = `${location.x}px`
  detailsDiv.style.top = `${location.y}px`
  graphOverlayElement.appendChild(detailsDiv)

  const headline = document.createElement('h3')
  detailsDiv.appendChild(headline)

  if (items.length === 1) {
    headline.textContent = 'Task'
    const caseItem = caseData.find((obj) => obj.caseId === items[0].caseId)
    if (!caseItem) return
    const card = buildTaskCard(caseItem)
    detailsDiv.appendChild(card)
  }
  if (items.length > 1) {
    headline.textContent = 'Tasks'
    const list = document.createElement('div')
    detailsDiv.appendChild(list)

    items.forEach((item) => {
      const caseItem = caseData.find((obj) => obj.caseId === item.caseId)
      if (!caseItem) return
      const card = buildTaskCard(caseItem)
      list.appendChild(card)
    })
  }
}

function buildTaskCard(caseItem) {
  const card = document.createElement('div')
  card.classList.add('task-card')
  const headline = document.createElement('h4')
  headline.textContent = `#${caseItem.caseId}`
  card.appendChild(headline)
  const detailsDiv = document.createElement('div')
  detailsDiv.classList.add('task-card-details')
  card.appendChild(detailsDiv)

  for (const [key, value] of Object.entries(caseItem.data)) {
    const p = document.createElement('p')
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1)
    p.textContent = `${capitalizedKey}: ${value}`
    detailsDiv.appendChild(p)
  }

  return card
}
