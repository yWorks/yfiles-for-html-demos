/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { MetabolicPathwayData } from '../data-types'

export const krebsCycleData: MetabolicPathwayData = {
  nodes: [
    {
      id: 0,
      label: '<span style="font-size: 18px">Pyruvate</span>',
      tag: { type: 'PRODUCT', vAlign: 1 }
    },
    {
      id: 1,
      label: '<span style="font-size: 18px">Acetyl CoA</span>',
      tag: { type: 'REACTANT', vAlign: 3 }
    },
    {
      id: 2,
      label: '<span style="font-size: 18px">Oxaloacetate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 3,
      label: '<span style="font-size: 18px">Citrate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 4,
      label: '<span style="font-size: 18px">Malate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 5,
      label: '<span style="font-size: 18px">Fumarate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 6,
      label: '<span style="font-size: 18px">Succinate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 7,
      label: '<span style="font-size: 18px">Succinyl CoA</span>',
      tag: { type: 'REACTANT', circle: true, vAlign: 5 }
    },
    {
      id: 8,
      label: '<span style="font-size: 18px">a-Ketoglutarate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 9,
      label: '<span style="font-size: 18px">D-Isocitrate</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    {
      id: 10,
      label: '<span style="font-size: 18px">Cis-Aconitase</span>',
      tag: { type: 'REACTANT', circle: true }
    },
    { id: 11, tag: { type: 'REACTION', vAlign: 2 } },
    {
      id: 12,
      label:
        '<span style="font-size: 18px"><span style="color:#ab2346; font-weight:bolder">CoA</span>-SH + NAD<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 13,
      label:
        '<span style="font-size: 18px">CO<sub>2</sub> + NADH<sup>+</sup> + H<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 14,
      label: '<span style="font-size: 18px">Pyruvate<br>dehydrogenase</span>',
      tag: { type: 'ENZYME' }
    },
    { id: 16, tag: { type: 'REACTION' } },
    { id: 17, tag: { type: 'REACTION' } },
    { id: 18, tag: { type: 'REACTION' } },
    { id: 19, tag: { type: 'REACTION' } },
    { id: 20, tag: { type: 'REACTION' } },
    { id: 21, tag: { type: 'REACTION' } },
    { id: 22, tag: { type: 'REACTION' } },
    { id: 23, tag: { type: 'REACTION' } },
    {
      id: 24,
      label: '<span style="font-size: 18px">NAD<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 25,
      label: '<span style="font-size: 18px">NADH<sup>+</sup> + H<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 26,
      label: '<span style="font-size: 18px">Malate<br>dehydrogenase</span>',
      tag: { type: 'ENZYME' }
    },
    {
      id: 27,
      label: '<span style="font-size: 18px">H<sub>2</sub>O</span>',
      tag: { type: 'OTHER' }
    },
    { id: 28, label: '<span style="font-size: 18px">Fumarase</span>', tag: { type: 'ENZYME' } },
    {
      id: 29,
      label: '<span style="font-size: 18px">Succinate<br>dehydrogenase</span>',
      tag: { type: 'ENZYME' }
    },
    {
      id: 30,
      label: '<span style="font-size: 18px">GDP + Pi</span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 31,
      label:
        '<span style="font-size: 18px"><span style="color:#ab2346; font-weight:bolder">CoA</span>-SH</span> + GDP</span',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 32,
      label: '<span style="font-size: 18px">Succinate<br>thiokinase</span>',
      tag: { type: 'ENZYME' }
    },
    {
      id: 33,
      label:
        '<span style="font-size: 18px">NAD<sup>+</sup> + <span style="color:#ab2346; font-weight:bolder">CoA</span>-SH</span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 34,
      label:
        '<span style="font-size: 18px">NADH<sup>+</sup> + H<sup>+</sup> + CO<sub>2</sub></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 36,
      label: '<span style="font-size: 18px">NAD<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 37,
      label: '<span style="font-size: 18px">NADH<sup>+</sup> + H<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 38,
      label: '<span style="font-size: 18px">CO<sub>2</sub></span>',
      tag: { type: 'OTHER' }
    },
    {
      id: 39,
      label: '<span style="font-size: 18px">a-ketoglutarate<br>dehydrogenase</span>',
      tag: { type: 'ENZYME' }
    },
    {
      id: 40,
      label: '<span style="font-size: 18px">Isocitrate<br>dehydrogenase</span>',
      tag: { type: 'ENZYME' }
    },
    { id: 41, label: '<span style="font-size: 18px">Aconitase</span>', tag: { type: 'ENZYME' } },
    {
      id: 42,
      label: '<span style="font-size: 18px">H<sub>2</sub>O</span>',
      tag: { type: 'OTHER' }
    },
    { id: 43, label: '<span style="font-size: 18px">Aconitase</span>', tag: { type: 'ENZYME' } },
    {
      id: 44,
      label: '<span style="font-size: 18px">H<sub>2</sub>O</span>',
      tag: { type: 'OTHER' }
    },
    {
      id: 45,
      label: '<span style="font-size: 18px">Citrate<br>synthase</span>',
      tag: { type: 'ENZYME' }
    },
    {
      id: 46,
      label:
        '<span style="font-size: 18px"><span style="color:#ab2346; font-weight:bolder;" >CoA</span>-SH</span>',
      tag: { type: 'OTHER' }
    },
    { id: 47, label: '<span style="font-size: 18px">FAD</span>', tag: { type: 'CO_REACTANT' } },
    {
      id: 48,
      label: '<span style="font-size: 18px">FADH<sub>2</sub></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 49,
      label: '<span style="font-size: 18px">H<sub>2</sub>O</span>',
      tag: { type: 'OTHER' }
    },
    { id: 50, tag: { type: 'REACTION', vAlign: 4 } }
  ],
  edges: [
    { source: 0, target: 11 },
    { source: 11, target: 1 },
    { source: 12, target: 11 },
    { source: 11, target: 13 },
    { source: 11, target: 14 },
    { source: 11, target: 15 },
    { source: 24, target: 16 },
    { source: 16, target: 25 },
    { source: 16, target: 26 },
    { source: 17, target: 28 },
    { source: 18, target: 29 },
    { source: 30, target: 19 },
    { source: 19, target: 31 },
    { source: 19, target: 32 },
    { source: 20, target: 34 },
    { source: 33, target: 20 },
    { source: 20, target: 35 },
    { source: 20, target: 39 },
    { source: 21, target: 40 },
    { source: 36, target: 21 },
    { source: 21, target: 37 },
    { source: 21, target: 38 },
    { source: 22, target: 41 },
    { source: 22, target: 42 },
    { source: 23, target: 43 },
    { source: 23, target: 44 },
    { source: 3, target: 23 },
    { source: 23, target: 10 },
    { source: 10, target: 22 },
    { source: 22, target: 9 },
    { source: 9, target: 21 },
    { source: 21, target: 8 },
    { source: 8, target: 20 },
    { source: 20, target: 7 },
    { source: 7, target: 19 },
    { source: 19, target: 6 },
    { source: 6, target: 18 },
    { source: 18, target: 5 },
    { source: 5, target: 17 },
    { source: 17, target: 4 },
    { source: 4, target: 16 },
    { source: 16, target: 2 },
    { source: 47, target: 18 },
    { source: 18, target: 48 },
    { source: 27, target: 17 },
    { source: 2, target: 50 },
    { source: 1, target: 50 },
    { source: 49, target: 50 },
    { source: 50, target: 3 },
    { source: 50, target: 46 },
    { source: 50, target: 45 }
  ]
}
