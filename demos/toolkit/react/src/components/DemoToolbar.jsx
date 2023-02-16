/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import React from 'react'
import PropTypes from 'prop-types'
import './DemoToolbar.css'

function DemoToolbar({ resetData, resetZoom, fitContent, zoomIn, zoomOut, searchChange }) {
  return (
    <div className="demo-toolbar">
      <button className="demo-icon-yIconReload" title="Reset Data" onClick={resetData} />
      <span className="demo-separator" />
      <button className="demo-icon-yIconZoomIn" title="Zoom In" onClick={zoomIn} />
      <button className="demo-icon-yIconZoomOriginal" title="Reset Zoom" onClick={resetZoom} />
      <button className="demo-icon-yIconZoomOut" title="Zoom Out" onClick={zoomOut} />
      <button className="demo-icon-yIconZoomFit" title="Fit Diagram" onClick={fitContent} />
      <span className="demo-separator" />
      <input className="search" placeholder="Search Nodes" onChange={searchChange} />
    </div>
  )
}

DemoToolbar.propTypes = {
  resetData: PropTypes.func,
  resetZoom: PropTypes.func,
  zoomIn: PropTypes.func,
  zoomOut: PropTypes.func,
  fitContent: PropTypes.func,
  searchChange: PropTypes.func
}

export default DemoToolbar
