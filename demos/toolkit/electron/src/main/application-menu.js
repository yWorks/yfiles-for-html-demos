/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Menu } from 'electron'

export default class ApplicationMenu {
  /**
   * Installs an application menu in the given window.
   * @param {Electron.BrowserWindow} window
   */
  static initApplicationMenu(window) {
    const applicationMenu = [
      {
        label: 'File',
        submenu: [
          { label: 'New', click: () => window.webContents.send('onNew') },
          { label: 'Open...', click: () => window.webContents.send('onOpen') },
          { label: 'SaveAs...', click: () => window.webContents.send('onSaveAs') },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'cut', click: () => window.webContents.send('onCut') },
          { role: 'copy', click: () => window.webContents.send('onCopy') },
          { role: 'paste', click: () => window.webContents.send('onPaste') },
          { role: 'delete', click: () => window.webContents.send('onDelete') },
          { type: 'separator' },
          { role: 'selectAll', click: () => window.webContents.send('onSelectAll') }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Fit Content', click: () => window.webContents.send('onFitContent') },
          { label: 'Zoom to original size', click: () => window.webContents.send('onResetZoom') },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      }
    ]
    const menu = Menu.buildFromTemplate(applicationMenu)
    Menu.setApplicationMenu(menu)
  }
}
