/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
const groupColor = { r: 0.3, g: 0.4, b: 1, a: 0.5 }
const sizes = {
  Tablet: { width: 40, depth: 20, height: 20 },
  Server: { width: 40, depth: 60, height: 60 },
  PC: { width: 20, depth: 60, height: 40 },
  Laptop: { width: 40, depth: 20, height: 40 },
  DB: { width: 20, depth: 20, height: 20 },
  Hub: { width: 40, depth: 40, height: 40 },
  Gateway: { width: 20, depth: 60, height: 40 },
  Firewall: { width: 80, depth: 20, height: 60 },
  Switch: { width: 60, depth: 20, height: 20 }
}
export default {
  nodesSource: [
    {
      id: 'tablet1',
      color: { r: 1, g: 0.6, b: 0, a: 1 },
      label: 'Tablet',
      group: 'development',
      ...sizes.Tablet
    },
    {
      id: 'tablet2',
      color: { r: 1, g: 0.6, b: 0, a: 1 },
      label: 'Tablet',
      group: 'sales',
      ...sizes.Tablet
    },
    {
      id: 'tablet3',
      color: { r: 1, g: 0.6, b: 0, a: 1 },
      label: 'Tablet',
      group: 'sales',
      ...sizes.Tablet
    },
    {
      id: 'tablet4',
      color: { r: 1, g: 0.6, b: 0, a: 1 },
      label: 'Tablet',
      group: 'it',
      ...sizes.Tablet
    },
    {
      id: 'server1',
      color: { r: 0.6, g: 0.2, b: 1, a: 1 },
      label: 'Server',
      group: 'development',
      ...sizes.Server
    },
    {
      id: 'server2',
      color: { r: 0.6, g: 0.2, b: 1, a: 1 },
      label: 'Server',
      group: 'it',
      ...sizes.Server
    },
    {
      id: 'pc1',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'development',
      ...sizes.PC
    },
    {
      id: 'pc2',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'development',
      ...sizes.PC
    },
    {
      id: 'pc3',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'development',
      ...sizes.PC
    },
    {
      id: 'pc4',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'development',
      ...sizes.PC
    },
    {
      id: 'pc5',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'management',
      ...sizes.PC
    },
    {
      id: 'pc6',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'management',
      ...sizes.PC
    },
    {
      id: 'pc7',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'management',
      ...sizes.PC
    },
    {
      id: 'pc8',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'production',
      ...sizes.PC
    },
    {
      id: 'pc9',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'production',
      ...sizes.PC
    },
    {
      id: 'pc10',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'it',
      ...sizes.PC
    },
    {
      id: 'pc11',
      color: { r: 0.6, g: 0.8, b: 0, a: 1 },
      label: 'PC',
      group: 'it',
      ...sizes.PC
    },
    {
      id: 'laptop1',
      color: { r: 0, g: 0.8, b: 1, a: 1 },
      label: 'Laptop',
      group: 'development',
      ...sizes.Laptop
    },
    {
      id: 'laptop2',
      color: { r: 0, g: 0.8, b: 1, a: 1 },
      label: 'Laptop',
      group: 'development',
      ...sizes.Laptop
    },
    {
      id: 'laptop3',
      color: { r: 0, g: 0.8, b: 1, a: 1 },
      label: 'Laptop',
      group: 'sales',
      ...sizes.Laptop
    },
    {
      id: 'laptop4',
      color: { r: 0, g: 0.8, b: 1, a: 1 },
      label: 'Laptop',
      group: 'sales',
      ...sizes.Laptop
    },
    {
      id: 'laptop5',
      color: { r: 0, g: 0.8, b: 1, a: 1 },
      label: 'Laptop',
      group: 'it',
      ...sizes.Laptop
    },
    {
      id: 'db',
      color: { r: 0.6, g: 0.2, b: 1, a: 1 },
      label: 'DB',
      group: 'it',
      ...sizes.DB
    },
    {
      id: 'hub1',
      color: { r: 0.7529411764705882, g: 0.7529411764705882, b: 0.7529411764705882, a: 1 },
      label: 'Hub',
      group: 'development',
      ...sizes.Hub
    },
    {
      id: 'hub2',
      color: { r: 0.7529411764705882, g: 0.7529411764705882, b: 0.7529411764705882, a: 1 },
      label: 'Hub',
      group: 'management',
      ...sizes.Hub
    },
    {
      id: 'hub3',
      color: { r: 0.7529411764705882, g: 0.7529411764705882, b: 0.7529411764705882, a: 1 },
      label: 'Hub',
      group: 'production',
      ...sizes.Hub
    },
    {
      id: 'hub4',
      color: { r: 0.7529411764705882, g: 0.7529411764705882, b: 0.7529411764705882, a: 1 },
      label: 'Hub',
      group: 'sales',
      ...sizes.Hub
    },
    {
      id: 'hub5',
      color: { r: 0.7529411764705882, g: 0.7529411764705882, b: 0.7529411764705882, a: 1 },
      label: 'Hub',
      group: 'it',
      ...sizes.Hub
    },
    { id: 'switch', color: { r: 1, g: 0.4, b: 0, a: 1 }, label: 'Switch', ...sizes.Switch },
    {
      id: 'gateway',
      color: { r: 0.6, g: 0.2, b: 1, a: 1 },
      label: 'Gateway',
      ...sizes.Gateway
    },
    { id: 'firewall', color: { r: 1, g: 0, b: 0, a: 1 }, label: 'Firewall', ...sizes.Firewall }
  ],
  edgesSource: [
    { from: 'server1', to: 'hub1' },
    { from: 'pc1', to: 'hub1' },
    { from: 'pc2', to: 'hub1' },
    { from: 'hub1', to: 'pc3' },
    { from: 'hub1', to: 'pc4' },
    { from: 'laptop1', to: 'hub1' },
    { from: 'laptop2', to: 'hub1' },
    { from: 'tablet1', to: 'hub1' },
    { from: 'hub1', to: 'switch', label: '10 GBytes/s' },
    { from: 'pc5', to: 'hub2' },
    { from: 'pc6', to: 'hub2' },
    { from: 'pc7', to: 'hub2' },
    { from: 'hub2', to: 'switch', label: '1 GByte/s' },
    { from: 'pc8', to: 'hub3' },
    { from: 'pc9', to: 'hub3' },
    { from: 'hub3', to: 'switch', label: '1 GByte/s' },
    { from: 'tablet2', to: 'hub4' },
    { from: 'tablet3', to: 'hub4' },
    { from: 'laptop3', to: 'hub4' },
    { from: 'laptop4', to: 'hub4' },
    { from: 'hub4', to: 'switch', label: '1 GByte/s' },
    { from: 'tablet4', to: 'hub5' },
    { from: 'laptop5', to: 'hub5' },
    { from: 'pc10', to: 'hub5' },
    { from: 'hub5', to: 'pc11' },
    { from: 'hub5', to: 'switch', label: '1 GByte/s' },
    { from: 'server2', to: 'switch', label: '10 GByte/s' },
    { from: 'db', to: 'switch', label: '10 GByte/s' },
    { from: 'switch', to: 'gateway', label: '100 MByte/s' },
    { from: 'gateway', to: 'firewall' }
  ],
  groupsSource: [
    {
      id: 'development',
      label: 'Development',
      color: groupColor
    },
    {
      id: 'management',
      label: 'Management',
      color: groupColor
    },
    {
      id: 'production',
      label: 'Production',
      color: groupColor
    },
    {
      id: 'sales',
      label: 'Sales',
      color: groupColor
    },
    {
      id: 'it',
      label: 'IT',
      color: groupColor
    }
  ]
}
