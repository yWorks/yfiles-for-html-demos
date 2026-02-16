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
import { type FlowNodeProperties, type FlowNodeValidation } from './FlowNode'

export function defaultFlowNodeValidationFn(_: FlowNodeProperties): FlowNodeValidation {
  return { invalidProperties: [], validationMessages: [] }
}

export function validateStorageReadWriteNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.fileName) {
    invalidProperties.push('fileName')
    validationMessages.push('File name is not defined')
  }
  return { invalidProperties, validationMessages }
}

export function validateParserCsvNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.separator) {
    invalidProperties.push('separator')
    validationMessages.push('Separator is not defined')
  }
  if (!args.newLine) {
    invalidProperties.push('newLine')
    validationMessages.push('New line symbol is not defined')
  }
  return { invalidProperties, validationMessages }
}

export function validateParserJsonNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.property) {
    invalidProperties.push('property')
    validationMessages.push('Property value is not defined')
  }
  return { invalidProperties, validationMessages }
}

export function validateParserXmlNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.property) {
    invalidProperties.push('property')
    validationMessages.push('Property value is not defined')
  }
  return { invalidProperties, validationMessages }
}

export function validateNetworkTcpNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.server) {
    invalidProperties.push('server')
    validationMessages.push('Server is not defined')
  }
  return { invalidProperties, validationMessages }
}

export function validateFunctionFunctionNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.function) {
    invalidProperties.push('function')
    validationMessages.push('No function to execute')
  }
  return { invalidProperties, validationMessages }
}

export function validateFunctionDelayNode(args: FlowNodeProperties): FlowNodeValidation {
  const invalidProperties = []
  const validationMessages = []
  if (!args.timeout) {
    invalidProperties.push('timeout')
    validationMessages.push('Timeout is not defined')
  }
  if (!args.timeoutUnits) {
    invalidProperties.push('timeoutUnits')
    validationMessages.push('Timeout units are not defined')
  }
  return { invalidProperties, validationMessages }
}
