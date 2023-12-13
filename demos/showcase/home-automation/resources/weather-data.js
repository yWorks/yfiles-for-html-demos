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
export const SampleData = {
  nodes: [
    {
      position: [0, -46],
      properties: {
        variant: 'commonStatus',
        label: 'Humidity',
        status: 'humidity'
      }
    },
    {
      position: [0, -121],
      properties: {
        variant: 'commonStatus',
        label: 'Temperature',
        status: 'temperature'
      }
    },
    {
      position: [203.64501953125, -46],
      properties: {
        variant: 'functionFunction',
        label: 'analyzeHumidity',
        function:
          'if (msg.payload > 70) {         msg.suggestion = "Open the window";     } else if (msg.payload < 30) {         msg.suggestion = "Use a humidifier";     } else {         msg.suggestion = "Nothing to do.";     }'
      }
    },
    {
      position: [420, -46],
      properties: {
        variant: 'functionDelay',
        label: 'delay',
        pauseType: 'delay',
        timeout: '5',
        timeoutUnits: 'minutes'
      }
    },
    {
      position: [883.3037109375, -46],
      properties: {
        variant: 'commonLinkOut',
        label: 'Send Message'
      }
    },
    {
      position: [191.576171875, -121],
      properties: {
        variant: 'functionFunction',
        label: 'analyzeTemperature',
        function:
          'if (msg.payload > 25) {         msg.suggestion = "Open the window";     } else if (msg.payload < 18) {         msg.suggestion = "Turn on the heating";     } else {         msg.suggestion = "Nothing to do";     }'
      }
    },
    {
      position: [690, -46],
      properties: {
        variant: 'sequenceJoin',
        label: 'join',
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
        reduceRight: false
      }
    },
    {
      position: [420, -121],
      properties: {
        variant: 'functionDelay',
        label: 'delay',
        pauseType: 'delay',
        timeout: '5',
        timeoutUnits: 'minutes'
      }
    }
  ],
  edges: [
    {
      bends: [],
      sourceNodeIndex: 0,
      targetNodeIndex: 2
    },
    {
      bends: [],
      sourceNodeIndex: 2,
      targetNodeIndex: 3
    },
    {
      bends: [],
      sourceNodeIndex: 3,
      targetNodeIndex: 6
    },
    {
      bends: [],
      sourceNodeIndex: 1,
      targetNodeIndex: 5
    },
    {
      bends: [],
      sourceNodeIndex: 6,
      targetNodeIndex: 4
    },
    {
      bends: [
        [575, -105],
        [577.3992919921875, -104.853515625],
        [582.4761962890625, -103.681640625],
        [587.8021240234375, -101.337890625],
        [593.2305908203125, -97.822265625],
        [598.6151123046875, -93.134765625],
        [603.8092041015625, -87.275390625],
        [608.6663818359375, -80.244140625],
        [613.0401611328125, -72.041015625],
        [615, -67.5],
        [616.988525390625, -62.958984375],
        [621.580810546875, -54.755859375],
        [626.846923828125, -47.724609375],
        [632.611083984375, -41.865234375],
        [638.697509765625, -37.177734375],
        [644.930419921875, -33.662109375],
        [651.134033203125, -31.318359375],
        [657.132568359375, -30.146484375],
        [660, -30]
      ],
      sourceNodeIndex: 7,
      targetNodeIndex: 6
    },
    {
      bends: [],
      sourceNodeIndex: 5,
      targetNodeIndex: 7
    }
  ]
}
