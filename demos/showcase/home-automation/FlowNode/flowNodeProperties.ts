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
  defaultFlowNodeValidationFn,
  validateFunctionDelayNode,
  validateFunctionFunctionNode,
  validateNetworkTcpNode,
  validateParserCsvNode,
  validateParserJsonNode,
  validateParserXmlNode,
  validateStorageReadWriteNode
} from './FlowNodeValidators'
import type { FlowNodeProperties, FlowNodeVariant } from './FlowNode'

export const flowNodeProperties: Record<FlowNodeVariant, FlowNodeProperties> = {
  storageWriteFile: {
    variant: 'storageWriteFile',
    label: 'Write File',
    hasLeftPort: true,
    hasRightPort: true,
    fileName: '',
    validate: validateStorageReadWriteNode
  },
  storageReadFile: {
    variant: 'storageReadFile',
    label: 'Read File',
    hasLeftPort: true,
    hasRightPort: true,
    fileName: '',
    validate: validateStorageReadWriteNode
  },
  parserCsv: {
    variant: 'parserCsv',
    label: 'csv',
    hasLeftPort: true,
    hasRightPort: true,
    separator: ',',
    newLine: '\\n',
    validate: validateParserCsvNode
  },
  parserJson: {
    variant: 'parserJson',
    label: 'json',
    hasLeftPort: true,
    hasRightPort: true,
    property: 'payload',
    pretty: false,
    validate: validateParserJsonNode
  },
  parserXml: {
    variant: 'parserXml',
    label: 'xml',
    hasLeftPort: true,
    hasRightPort: true,
    property: 'payload',
    attribute: '',
    validate: validateParserXmlNode
  },
  sequenceSort: {
    variant: 'sequenceSort',
    label: 'sort',
    hasLeftPort: true,
    hasRightPort: true,
    order: 'ascending',
    asNumber: false,
    target: 'payload',
    targetType: 'msg',
    msgKey: 'payload',
    msgKeyType: 'elem',
    seqKey: 'payload',
    seqKeyType: 'msg',
    validate: defaultFlowNodeValidationFn
  },
  sequenceJoin: {
    variant: 'sequenceJoin',
    label: 'join',
    hasLeftPort: true,
    hasRightPort: true,
    mode: 'auto',
    build: 'object',
    property: 'payload',
    propertyType: 'msg',
    key: 'topic',
    joiner: '\\n',
    joinerType: 'str',
    accumulate: false,
    timeout: '',
    count: '',
    reduceRight: false,
    validate: defaultFlowNodeValidationFn
  },
  networkTcpIn: {
    variant: 'networkTcpIn',
    label: 'tcp in',
    hasLeftPort: false,
    hasRightPort: true,
    server: '',
    host: '',
    port: '',
    dataMode: 'stream',
    dataType: 'buffer',
    base64: false,
    validate: validateNetworkTcpNode
  },
  networkTcpOut: {
    variant: 'networkTcpOut',
    label: 'tcp out',
    hasLeftPort: true,
    hasRightPort: false,
    host: '',
    port: '',
    server: '',
    base64: false,
    validate: validateNetworkTcpNode
  },
  networkTcpRequest: {
    variant: 'networkTcpRequest',
    label: 'tcp request',
    hasLeftPort: true,
    hasRightPort: true,
    server: 'server',
    port: '',
    out: 'time',
    ret: 'buffer',
    validate: validateNetworkTcpNode
  },
  functionFunction: {
    variant: 'functionFunction',
    label: 'function',
    hasLeftPort: true,
    hasRightPort: true,
    function: 'return msg;',
    validate: validateFunctionFunctionNode
  },
  functionDelay: {
    variant: 'functionDelay',
    label: 'delay',
    hasLeftPort: true,
    hasRightPort: true,
    pauseType: 'delay',
    timeout: '5',
    timeoutUnits: 'seconds',
    validate: validateFunctionDelayNode
  },
  functionFilter: {
    variant: 'functionFilter',
    label: 'filter',
    hasLeftPort: true,
    hasRightPort: true,
    function: 'rbe',
    gap: '',
    start: '',
    inout: 'out',
    property: 'payload',
    topic: 'topic',
    validate: defaultFlowNodeValidationFn
  },
  commonComment: {
    variant: 'commonComment',
    label: 'comment',
    hasLeftPort: false,
    hasRightPort: false,
    comment: '',
    validate: defaultFlowNodeValidationFn
  },
  commonLinkIn: {
    variant: 'commonLinkIn',
    label: 'link in',
    hasLeftPort: false,
    hasRightPort: true,
    validate: defaultFlowNodeValidationFn
  },
  commonLinkOut: {
    variant: 'commonLinkOut',
    label: 'link out',
    hasLeftPort: true,
    hasRightPort: false,
    validate: defaultFlowNodeValidationFn
  },
  commonLinkCall: {
    variant: 'commonLinkCall',
    label: 'link call',
    hasLeftPort: true,
    hasRightPort: true,
    linkType: 'static',
    timeout: 30,
    validate: defaultFlowNodeValidationFn
  },
  commonStatus: {
    variant: 'commonStatus',
    label: 'status',
    hasLeftPort: false,
    hasRightPort: true,
    status: undefined,
    validate: defaultFlowNodeValidationFn
  }
}
