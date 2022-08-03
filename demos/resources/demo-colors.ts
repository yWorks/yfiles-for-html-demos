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
export type ColorSetName =
  | 'demo-orange'
  | 'demo-blue'
  | 'demo-red'
  | 'demo-green'
  | 'demo-purple'
  | 'demo-lightblue'
  | 'demo-palette-11'
  | 'demo-palette-12'
  | 'demo-palette-13'
  | 'demo-palette-14'
  | 'demo-palette-15'
  | 'demo-palette-21'
  | 'demo-palette-22'
  | 'demo-palette-23'
  | 'demo-palette-24'
  | 'demo-palette-25'
  | 'demo-palette-31'
  | 'demo-palette-32'
  | 'demo-palette-33'
  | 'demo-palette-34'
  | 'demo-palette-35'
  | 'demo-palette-41'
  | 'demo-palette-42'
  | 'demo-palette-43'
  | 'demo-palette-44'
  | 'demo-palette-45'
  | 'demo-palette-46'
  | 'demo-palette-47'
  | 'demo-palette-48'
  | 'demo-palette-401'
  | 'demo-palette-402'
  | 'demo-palette-403'
  | 'demo-palette-51'
  | 'demo-palette-52'
  | 'demo-palette-53'
  | 'demo-palette-54'
  | 'demo-palette-55'
  | 'demo-palette-56'
  | 'demo-palette-57'
  | 'demo-palette-58'
  | 'demo-palette-59'
  | 'demo-palette-510'
  | 'demo-palette-511'
  | 'demo-palette-61'
  | 'demo-palette-62'
  | 'demo-palette-63'
  | 'demo-palette-64'
  | 'demo-palette-65'
  | 'demo-palette-71'
  | 'demo-palette-72'
  | 'demo-palette-73'
  | 'demo-palette-74'
  | 'demo-palette-75'
  | 'demo-palette-81'
  | 'demo-palette-82'
  | 'demo-palette-83'
  | 'demo-palette-84'
  | 'demo-palette-91'
  | 'demo-palette-92'
  | 'demo-palette-93'
  | 'demo-palette-94'
  | 'demo-palette-95'
  | 'demo-palette-96'

export type ColorSet = {
  fill: string
  stroke: string
  nodeLabelFill: string
  edgeLabelFill: string
  text: string
}

export const colorSets: Record<ColorSetName, ColorSet> = {
  'demo-orange': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-blue': {
    fill: '#242265',
    stroke: '#0e0e28',
    nodeLabelFill: '#a7a7c1',
    edgeLabelFill: '#cfcfd4',
    text: '#0e0e28'
  },
  'demo-red': {
    fill: '#ca0c3b',
    stroke: '#510518',
    nodeLabelFill: '#ea9eb1',
    edgeLabelFill: '#dccdd1',
    text: '#510518'
  },
  'demo-green': {
    fill: '#61a044',
    stroke: '#27401b',
    nodeLabelFill: '#c0d9b4',
    edgeLabelFill: '#d4d9d1',
    text: '#27401b'
  },
  'demo-purple': {
    fill: '#a37ab3',
    stroke: '#413148',
    nodeLabelFill: '#dacae1',
    edgeLabelFill: '#d9d6da',
    text: '#413148'
  },
  'demo-lightblue': {
    fill: '#46a8d5',
    stroke: '#1c4355',
    nodeLabelFill: '#b5dcee',
    edgeLabelFill: '#d2d9dd',
    text: '#1c4355'
  },
  'demo-palette-11': {
    fill: '#111d4a',
    stroke: '#070c1e',
    nodeLabelFill: '#a0a5b7',
    edgeLabelFill: '#cdced2',
    text: '#070c1e'
  },
  'demo-palette-12': {
    fill: '#0b7189',
    stroke: '#042d37',
    nodeLabelFill: '#9dc6d0',
    edgeLabelFill: '#cdd5d7',
    text: '#042d37'
  },
  'demo-palette-13': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-palette-14': {
    fill: '#ab2346',
    stroke: '#440e1c',
    nodeLabelFill: '#dda7b5',
    edgeLabelFill: '#dacfd2',
    text: '#440e1c'
  },
  'demo-palette-15': {
    fill: '#621b00',
    stroke: '#270b00',
    nodeLabelFill: '#c0a499',
    edgeLabelFill: '#d4cecc',
    text: '#270b00'
  },
  'demo-palette-21': {
    fill: '#17bebb',
    stroke: '#094c4b',
    nodeLabelFill: '#a2e5e4',
    edgeLabelFill: '#cedbdb',
    text: '#094c4b'
  },
  'demo-palette-22': {
    fill: '#ffc914',
    stroke: '#665008',
    nodeLabelFill: '#ffe9a1',
    edgeLabelFill: '#e0dcce',
    text: '#665008'
  },
  'demo-palette-23': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-palette-24': {
    fill: '#2e282a',
    stroke: '#121011',
    nodeLabelFill: '#aba9aa',
    edgeLabelFill: '#d0cfcf',
    text: '#121011'
  },
  'demo-palette-25': {
    fill: '#76b041',
    stroke: '#2f461a',
    nodeLabelFill: '#c8dfb3',
    edgeLabelFill: '#d5dad1',
    text: '#2f461a'
  },
  'demo-palette-31': {
    fill: '#67b7dc',
    stroke: '#294958',
    nodeLabelFill: '#c2e2f1',
    edgeLabelFill: '#d4dbde',
    text: '#294958'
  },
  'demo-palette-32': {
    fill: '#6771dc',
    stroke: '#292d58',
    nodeLabelFill: '#c2c6f1',
    edgeLabelFill: '#d4d5de',
    text: '#292d58'
  },
  'demo-palette-33': {
    fill: '#242265',
    stroke: '#0e0e28',
    nodeLabelFill: '#a7a7c1',
    edgeLabelFill: '#cfcfd4',
    text: '#0e0e28'
  },
  'demo-palette-34': {
    fill: '#dc67ce',
    stroke: '#582952',
    nodeLabelFill: '#f1c2eb',
    edgeLabelFill: '#ded4dc',
    text: '#582952'
  },
  'demo-palette-35': {
    fill: '#a367dc',
    stroke: '#412958',
    nodeLabelFill: '#dac2f1',
    edgeLabelFill: '#d9d4de',
    text: '#412958'
  },
  'demo-palette-41': {
    fill: '#363020',
    stroke: '#16130d',
    nodeLabelFill: '#afaca6',
    edgeLabelFill: '#d0d0cf',
    text: '#16130d'
  },
  'demo-palette-42': {
    fill: '#605c4e',
    stroke: '#26251f',
    nodeLabelFill: '#bfbeb8',
    edgeLabelFill: '#d4d3d2',
    text: '#26251f'
  },
  'demo-palette-43': {
    fill: '#a49966',
    stroke: '#423d29',
    nodeLabelFill: '#dbd6c2',
    edgeLabelFill: '#d9d8d4',
    text: '#423d29'
  },
  'demo-palette-44': {
    fill: '#c7c7a6',
    stroke: '#505042',
    nodeLabelFill: '#e9e9db',
    edgeLabelFill: '#dcdcd9',
    text: '#505042'
  },
  'demo-palette-45': {
    fill: '#eaffda',
    stroke: '#5e6657',
    nodeLabelFill: '#f7fff0',
    edgeLabelFill: '#dfe0dd',
    text: '#5e6657'
  },
  'demo-palette-46': {
    fill: '#a4778b',
    stroke: '#423038',
    nodeLabelFill: '#dbc9d1',
    edgeLabelFill: '#d9d6d7',
    text: '#423038'
  },
  'demo-palette-47': {
    fill: '#aa4586',
    stroke: '#441c36',
    nodeLabelFill: '#ddb5cf',
    edgeLabelFill: '#dad2d7',
    text: '#441c36'
  },
  'demo-palette-48': {
    fill: '#177e89',
    stroke: '#093237',
    nodeLabelFill: '#a2cbd0',
    edgeLabelFill: '#ced6d7',
    text: '#093237'
  },
  'demo-palette-401': {
    fill: '#f26419',
    stroke: '#61280a',
    nodeLabelFill: '#fac1a3',
    edgeLabelFill: '#dfd4ce',
    text: '#61280a'
  },
  'demo-palette-402': {
    fill: '#e01a4f',
    stroke: '#5a0a20',
    nodeLabelFill: '#f3a3b9',
    edgeLabelFill: '#deced2',
    text: '#5a0a20'
  },
  'demo-palette-403': {
    fill: '#01baff',
    stroke: '#004a66',
    nodeLabelFill: '#99e3ff',
    edgeLabelFill: '#ccdbe0',
    text: '#004a66'
  },
  'demo-palette-51': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-palette-52': {
    fill: '#242265',
    stroke: '#0e0e28',
    nodeLabelFill: '#a7a7c1',
    edgeLabelFill: '#cfcfd4',
    text: '#0e0e28'
  },
  'demo-palette-53': {
    fill: '#56926e',
    stroke: '#223a2c',
    nodeLabelFill: '#bbd3c5',
    edgeLabelFill: '#d3d8d5',
    text: '#223a2c'
  },
  'demo-palette-54': {
    fill: '#6dbc8d',
    stroke: '#2c4b38',
    nodeLabelFill: '#c5e4d1',
    edgeLabelFill: '#d5dbd7',
    text: '#2c4b38'
  },
  'demo-palette-55': {
    fill: '#6c4f77',
    stroke: '#2b2030',
    nodeLabelFill: '#c4b9c9',
    edgeLabelFill: '#d5d2d6',
    text: '#2b2030'
  },
  'demo-palette-56': {
    fill: '#4281a4',
    stroke: '#1a3442',
    nodeLabelFill: '#b3cddb',
    edgeLabelFill: '#d1d6d9',
    text: '#1a3442'
  },
  'demo-palette-57': {
    fill: '#e0e04f',
    stroke: '#5a5a20',
    nodeLabelFill: '#f3f3b9',
    edgeLabelFill: '#deded2',
    text: '#5a5a20'
  },
  'demo-palette-58': {
    fill: '#c1c1c1',
    stroke: '#4d4d4d',
    nodeLabelFill: '#e6e6e6',
    edgeLabelFill: '#dbdbdb',
    text: '#4d4d4d'
  },
  'demo-palette-59': {
    fill: '#db3a34',
    stroke: '#581715',
    nodeLabelFill: '#f1b0ae',
    edgeLabelFill: '#ded1d0',
    text: '#581715'
  },
  'demo-palette-510': {
    fill: '#f0c808',
    stroke: '#605003',
    nodeLabelFill: '#f9e99c',
    edgeLabelFill: '#dfdccd',
    text: '#605003'
  },
  'demo-palette-511': {
    fill: '#2d4d3a',
    stroke: '#121f17',
    nodeLabelFill: '#abb8b0',
    edgeLabelFill: '#d0d2d1',
    text: '#121f17'
  },
  'demo-palette-61': {
    fill: '#ab2346',
    stroke: '#440e1c',
    nodeLabelFill: '#dda7b5',
    edgeLabelFill: '#dacfd2',
    text: '#440e1c'
  },
  'demo-palette-62': {
    fill: '#76b041',
    stroke: '#2f461a',
    nodeLabelFill: '#c8dfb3',
    edgeLabelFill: '#d5dad1',
    text: '#2f461a'
  },
  'demo-palette-63': {
    fill: '#a367dc',
    stroke: '#412958',
    nodeLabelFill: '#dac2f1',
    edgeLabelFill: '#d9d4de',
    text: '#412958'
  },
  'demo-palette-64': {
    fill: '#c1c1c1',
    stroke: '#4d4d4d',
    nodeLabelFill: '#e6e6e6',
    edgeLabelFill: '#dbdbdb',
    text: '#4d4d4d'
  },
  'demo-palette-65': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-palette-71': {
    fill: '#ffc914',
    stroke: '#665008',
    nodeLabelFill: '#ffe9a1',
    edgeLabelFill: '#e0dcce',
    text: '#665008'
  },
  'demo-palette-72': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-palette-73': {
    fill: '#76b041',
    stroke: '#2f461a',
    nodeLabelFill: '#c8dfb3',
    edgeLabelFill: '#d5dad1',
    text: '#2f461a'
  },
  'demo-palette-74': {
    fill: '#2d728f',
    stroke: '#122e39',
    nodeLabelFill: '#abc7d2',
    edgeLabelFill: '#d0d5d7',
    text: '#122e39'
  },
  'demo-palette-75': {
    fill: '#c1c1c1',
    stroke: '#4d4d4d',
    nodeLabelFill: '#e6e6e6',
    edgeLabelFill: '#dbdbdb',
    text: '#4d4d4d'
  },
  'demo-palette-81': {
    fill: '#242265',
    stroke: '#0e0e28',
    nodeLabelFill: '#a7a7c1',
    edgeLabelFill: '#cfcfd4',
    text: '#0e0e28'
  },
  'demo-palette-82': {
    fill: '#01baff',
    stroke: '#004a66',
    nodeLabelFill: '#99e3ff',
    edgeLabelFill: '#ccdbe0',
    text: '#004a66'
  },
  'demo-palette-83': {
    fill: '#f26419',
    stroke: '#61280a',
    nodeLabelFill: '#fac1a3',
    edgeLabelFill: '#dfd4ce',
    text: '#61280a'
  },
  'demo-palette-84': {
    fill: '#fdca40',
    stroke: '#65511a',
    nodeLabelFill: '#feeab3',
    edgeLabelFill: '#e0dcd1',
    text: '#65511a'
  },
  'demo-palette-91': {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  },
  'demo-palette-92': {
    fill: '#242265',
    stroke: '#0e0e28',
    nodeLabelFill: '#a7a7c1',
    edgeLabelFill: '#cfcfd4',
    text: '#0e0e28'
  },
  'demo-palette-93': {
    fill: '#61a044',
    stroke: '#27401b',
    nodeLabelFill: '#c0d9b4',
    edgeLabelFill: '#d4d9d1',
    text: '#27401b'
  },
  'demo-palette-94': {
    fill: '#a37ab3',
    stroke: '#413148',
    nodeLabelFill: '#dacae1',
    edgeLabelFill: '#d9d6da',
    text: '#413148'
  },
  'demo-palette-95': {
    fill: '#ca0c3b',
    stroke: '#510518',
    nodeLabelFill: '#ea9eb1',
    edgeLabelFill: '#dccdd1',
    text: '#510518'
  },
  'demo-palette-96': {
    fill: '#46a8d5',
    stroke: '#1c4355',
    nodeLabelFill: '#b5dcee',
    edgeLabelFill: '#d2d9dd',
    text: '#1c4355'
  }
}
