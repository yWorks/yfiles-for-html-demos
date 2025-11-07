/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
export const testGraphData = {
  groups: [
    { id: 'north-east-grain-belt', headline: 'North-East Grain Belt' },
    { id: 'atlantic-dairy-coast', headline: 'Atlantic Dairy Coast' },
    { id: 'urban-bakeries', headline: 'Urban Bakeries' },
    { id: 'northern-gateways', headline: 'Northern Gateways' },
    { id: 'retail-hubs', headline: 'Retail Hubs' }
  ],
  nodes: [
    {
      id: 'ne-grain-coop-reims',
      headline: 'Grain Cooperative',
      location: 'Reims, Grand Est',
      icon: 'grass',
      groupId: 'north-east-grain-belt',
      layer: 2,
      properties: [
        { id: 'p1', name: 'wheat grain', stock: 3 },
        { id: 'p2', name: 'rye grain', stock: 2 },
        { id: 'p3', name: 'barley grain', stock: 4 }
      ]
    },
    {
      id: 'burgundy-grain-producers',
      headline: 'Mixed Grain Producers',
      location: 'Dijon, Bourgogne-Franche-Comté',
      icon: 'grass',
      groupId: 'north-east-grain-belt',
      layer: 2,
      properties: [
        { id: 'p1', name: 'spelt grain', stock: 1 },
        { id: 'p2', name: 'soft wheat', stock: 5 }
      ]
    },
    {
      id: 'strasbourg-river-mill',
      headline: 'River Mill',
      location: 'Strasbourg, Grand Est',
      icon: 'grain',
      groupId: 'north-east-grain-belt',
      layer: 2,
      properties: [
        { id: 'p1', name: 'wheat flour 00', stock: 4 },
        { id: 'p2', name: 'wheat flour 405', stock: 4 },
        { id: 'p3', name: 'wheat flour whole grain', stock: 3 },
        { id: 'p4', name: 'rye flour', stock: 1 },
        { id: 'p5', name: 'spelt flour', stock: 5 },
        { id: 'p6', name: 'barley flour', stock: 2 }
      ]
    },
    {
      id: 'normandy-dairy-collective',
      headline: 'Dairy Collective',
      location: 'Caen, Normandie',
      icon: 'agriculture',
      groupId: 'atlantic-dairy-coast',
      layer: 2,
      properties: [
        { id: 'p1', name: 'whole milk', stock: 3 },
        { id: 'p2', name: 'cream', stock: 4 },
        { id: 'p3', name: 'butter', stock: 5 }
      ]
    },
    {
      id: 'brittany-egg-center',
      headline: 'Egg Farm',
      location: 'Vitré, Bretagne',
      icon: 'egg',
      groupId: 'atlantic-dairy-coast',
      layer: 2,
      properties: [
        { id: 'p1', name: 'eggs', stock: 2 },
        { id: 'p2', name: 'egg whites', stock: 1 }
      ]
    },
    {
      id: 'normandy-fromagerie',
      headline: 'Fromagerie',
      location: 'Lisieux, Normandie',
      icon: 'incomplete_circle',
      groupId: 'atlantic-dairy-coast',
      layer: 2,
      properties: [
        { id: 'p1', name: 'camembert', stock: 3 },
        { id: 'p2', name: 'gruyere', stock: 4 },
        { id: 'p3', name: 'roquefort', stock: 2 }
      ]
    },
    {
      id: 'paris-bakery-bread',
      headline: 'Artisan Bakery',
      location: 'Paris, Île-de-France',
      icon: 'breakfast_dining',
      groupId: 'urban-bakeries',
      layer: 3,
      properties: [
        { id: 'p1', name: 'baguette traditionnel', stock: 5 },
        { id: 'p2', name: 'baguette rustique', stock: 3 },
        { id: 'p3', name: 'pain de campagne', stock: 1 },
        { id: 'p4', name: 'pain au levain', stock: 2 }
      ]
    },
    {
      id: 'paris-patisserie',
      headline: 'Pâtisserie',
      location: 'Paris, Île-de-France',
      icon: 'bakery_dining',
      groupId: 'urban-bakeries',
      layer: 3,
      properties: [
        { id: 'p1', name: 'croissant', stock: 4 },
        { id: 'p2', name: 'pain au chocolat', stock: 3 },
        { id: 'p3', name: 'chocolate batons', stock: 2 },
        { id: 'p4', name: 'orange merengue', stock: 1 },
        { id: 'p5', name: 'citron merengue', stock: 5 },
        { id: 'p6', name: 'brioche', stock: 3 }
      ]
    },
    {
      id: 'lyon-quiche-boulangerie',
      headline: 'Quiche Boulangerie',
      location: 'Lyon, Auvergne-Rhône-Alpes',
      icon: 'local_pizza',
      groupId: 'urban-bakeries',
      layer: 3,
      properties: [
        { id: 'p1', name: 'quiche lorraine', stock: 4 },
        { id: 'p2', name: 'quiche provenzale', stock: 2 },
        { id: 'p3', name: 'quiche roquefort', stock: 3 }
      ]
    },
    {
      id: 'lille-packaging-plant',
      headline: 'Packaging Plant',
      location: 'Lille, Hauts-de-France',
      icon: 'inventory_2',
      groupId: 'northern-gateways',
      layer: 4,
      properties: [
        { id: 'p1', name: 'baguette packaged', stock: 5 },
        { id: 'p2', name: 'croissant packaged', stock: 3 },
        { id: 'p3', name: 'pastry assortment', stock: 1 },
        { id: 'p4', name: 'bread loaf packaged', stock: 4, endOfChain: true },
        { id: 'p5', name: 'brioche packaged', stock: 2, endOfChain: true },
        { id: 'p6', name: 'quiche tray', stock: 3 }
      ]
    },
    {
      id: 'le-havre-export-terminal',
      headline: 'Export Terminal',
      location: 'Le Havre, Normandie',
      icon: 'ac_unit',
      groupId: 'northern-gateways',
      layer: 4,
      properties: [
        { id: 'p1', name: 'refrigerated containers', stock: 2 },
        { id: 'p2', name: 'frozen containers', stock: 2 }
      ]
    },
    {
      id: 'calais-distribution-hub',
      headline: 'Distribution Hub',
      location: 'Calais, Hauts-de-France',
      icon: 'local_shipping',
      groupId: 'northern-gateways',
      layer: 4,
      properties: [
        { id: 'p1', name: 'baked goods shipment', stock: 1 },
        { id: 'p2', name: 'pâtisserie shipment', stock: 3 },
        { id: 'p3', name: 'sour dough shipment', stock: 3 }
      ]
    },
    {
      id: 'paris-flagship-shop',
      headline: 'Bakery Shop',
      location: 'Paris, Île-de-France',
      icon: 'breakfast_dining',
      groupId: 'retail-hubs',
      layer: 5,
      properties: [
        { id: 'p1', name: 'baguette traditional', stock: 2, endOfChain: true },
        { id: 'p2', name: 'pain au chocolat', stock: 5, endOfChain: true },
        { id: 'p3', name: 'brioche', stock: 4, endOfChain: true },
        { id: 'p4', name: 'quiche', stock: 2, endOfChain: true },
        { id: 'p5', name: 'pastry assortment', stock: 1, endOfChain: true }
      ]
    },
    {
      id: 'marseille-seafront-cafe',
      headline: 'Seafront Café',
      location: 'Marseille, Provence-Alpes-Côte d’Azur',
      icon: 'local_cafe',
      groupId: 'retail-hubs',
      layer: 5,
      properties: [
        { id: 'p1', name: 'baguette au fromage', stock: 2, endOfChain: true },
        { id: 'p2', name: 'café et croissant', stock: 1, endOfChain: true },
        { id: 'p3', name: 'sandwich', stock: 5, endOfChain: true }
      ]
    },
    {
      id: 'orleans-supermarket',
      headline: 'Supermarket',
      location: 'Orléans, Centre-Val de Loire',
      icon: 'shopping_cart',
      groupId: 'retail-hubs',
      layer: 5,
      properties: [
        { id: 'p1', name: 'sliced bread', stock: 4, endOfChain: true },
        { id: 'p2', name: 'frozen quiche', stock: 3, endOfChain: true },
        { id: 'p3', name: 'merengue', stock: 4, endOfChain: true },
        { id: 'p4', name: 'baguette', stock: 1, endOfChain: true },
        { id: 'p5', name: 'upcycled food waste', stock: 4, endOfChain: false }
      ]
    },
    {
      id: 'antwerp-cocoa-import',
      headline: 'Cocoa Import',
      location: 'Antwerpen, Belgium',
      icon: 'grid_on',
      layer: 1,
      properties: [
        { id: 'p1', name: 'chocolate', stock: 4 },
        { id: 'p2', name: 'chocolate batons', stock: 5 }
      ]
    },
    {
      id: 'marcq-yeast-plant',
      headline: 'Yeast Plant',
      location: 'Marcq-en-Barœul, Hauts-de-France',
      icon: 'coronavirus',
      layer: 1,
      properties: [
        { id: 'p1', name: 'yeast', stock: 2 },
        { id: 'p2', name: 'levain starter', stock: 3 }
      ]
    },
    {
      id: 'sicily-citrus-import',
      headline: 'Citrus Import',
      location: 'Catania, Sicily, Italy',
      icon: 'nature',
      layer: 1,
      properties: [
        { id: 'p1', name: 'candied-orange-peel', stock: 2 },
        { id: 'p2', name: 'lemon-zest', stock: 1 }
      ]
    }
  ],
  edges: [
    {
      id: 'e1',
      source: { nodeId: 'ne-grain-coop-reims', propertyId: 'p1' },
      target: { nodeId: 'burgundy-grain-producers', propertyId: 'p2' }
    },
    {
      id: 'e2',
      source: { nodeId: 'ne-grain-coop-reims', propertyId: 'p1' },
      target: { nodeId: 'strasbourg-river-mill', propertyId: 'p1' }
    },
    {
      id: 'e3',
      source: { nodeId: 'ne-grain-coop-reims', propertyId: 'p1' },
      target: { nodeId: 'strasbourg-river-mill', propertyId: 'p2' }
    },
    {
      id: 'e4',
      source: { nodeId: 'ne-grain-coop-reims', propertyId: 'p1' },
      target: { nodeId: 'strasbourg-river-mill', propertyId: 'p3' }
    },
    {
      id: 'e5',
      source: { nodeId: 'ne-grain-coop-reims', propertyId: 'p2' },
      target: { nodeId: 'strasbourg-river-mill', propertyId: 'p4' }
    },
    {
      id: 'e6',
      source: { nodeId: 'ne-grain-coop-reims', propertyId: 'p3' },
      target: { nodeId: 'strasbourg-river-mill', propertyId: 'p6' }
    },
    {
      id: 'e7',
      source: { nodeId: 'burgundy-grain-producers', propertyId: 'p1' },
      target: { nodeId: 'strasbourg-river-mill', propertyId: 'p5' }
    },
    {
      id: 'e8',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p1' }
    },
    {
      id: 'e9',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p2' }
    },
    {
      id: 'e10',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p6' }
    },
    {
      id: 'e11',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p3' }
    },
    {
      id: 'e12',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p2' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p1' }
    },
    {
      id: 'e13',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p2' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p2' }
    },
    {
      id: 'e14',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p3' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p3' }
    },
    {
      id: 'e15',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p3' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p4' }
    },
    {
      id: 'e16',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p5' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p3' }
    },
    {
      id: 'e17',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p6' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p4' }
    },
    {
      id: 'e18',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p2' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p1' }
    },
    {
      id: 'e19',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p2' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p2' }
    },
    {
      id: 'e20',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p3' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' }
    },
    {
      id: 'e21',
      source: { nodeId: 'strasbourg-river-mill', propertyId: 'p4' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' }
    },
    {
      id: 'e23',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p3' }
    },
    {
      id: 'e24',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p6' }
    },
    {
      id: 'e25',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p5' }
    },
    {
      id: 'e26',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p6' }
    },
    {
      id: 'e27',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p1' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p1' }
    },
    {
      id: 'e28',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p1' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p2' }
    },
    {
      id: 'e29',
      source: { nodeId: 'brittany-egg-center', propertyId: 'p1' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' }
    },
    {
      id: 'e30',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p6' }
    },
    {
      id: 'e31',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p3' }
    },
    {
      id: 'e32',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p3' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p1' }
    },
    {
      id: 'e33',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p3' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p2' }
    },
    {
      id: 'e34',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p3' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p6' }
    },
    {
      id: 'e35',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p3' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p1' }
    },
    {
      id: 'e36',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p3' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p2' }
    },
    {
      id: 'e37',
      source: { nodeId: 'normandy-dairy-collective', propertyId: 'p3' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' }
    },
    {
      id: 'e38',
      source: { nodeId: 'antwerp-cocoa-import', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p2' }
    },
    {
      id: 'e39',
      source: { nodeId: 'antwerp-cocoa-import', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p3' }
    },
    {
      id: 'e40',
      source: { nodeId: 'normandy-fromagerie', propertyId: 'p1' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p2' }
    },
    {
      id: 'e41',
      source: { nodeId: 'normandy-fromagerie', propertyId: 'p2' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p1' }
    },
    {
      id: 'e42',
      source: { nodeId: 'normandy-fromagerie', propertyId: 'p2' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' }
    },
    {
      id: 'e43',
      source: { nodeId: 'normandy-fromagerie', propertyId: 'p3' },
      target: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' }
    },
    {
      id: 'e44',
      source: { nodeId: 'sicily-citrus-import', propertyId: 'p1' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p4' }
    },
    {
      id: 'e45',
      source: { nodeId: 'sicily-citrus-import', propertyId: 'p2' },
      target: { nodeId: 'paris-patisserie', propertyId: 'p5' }
    },
    {
      id: 'e46',
      source: { nodeId: 'marcq-yeast-plant', propertyId: 'p1' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p1' }
    },
    {
      id: 'e47',
      source: { nodeId: 'marcq-yeast-plant', propertyId: 'p1' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p2' }
    },
    {
      id: 'e48',
      source: { nodeId: 'marcq-yeast-plant', propertyId: 'p1' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p3' }
    },
    {
      id: 'e49',
      source: { nodeId: 'marcq-yeast-plant', propertyId: 'p2' },
      target: { nodeId: 'paris-bakery-bread', propertyId: 'p4' }
    },
    {
      id: 'e50',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p1' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p1' }
    },
    {
      id: 'e51',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p2' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p1' }
    },
    {
      id: 'e52',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p3' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p4' }
    },
    {
      id: 'e53',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p4' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p4' }
    },
    {
      id: 'e54',
      source: { nodeId: 'paris-patisserie', propertyId: 'p1' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p2' }
    },
    {
      id: 'e55',
      source: { nodeId: 'paris-patisserie', propertyId: 'p2' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p3' }
    },
    {
      id: 'e56',
      source: { nodeId: 'paris-patisserie', propertyId: 'p3' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p3' }
    },
    {
      id: 'e57',
      source: { nodeId: 'paris-patisserie', propertyId: 'p4' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p3' }
    },
    {
      id: 'e58',
      source: { nodeId: 'paris-patisserie', propertyId: 'p5' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p3' }
    },
    {
      id: 'e59',
      source: { nodeId: 'paris-patisserie', propertyId: 'p6' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p5' }
    },
    {
      id: 'e60',
      source: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p1' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p6' }
    },
    {
      id: 'e61',
      source: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p2' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p6' }
    },
    {
      id: 'e62',
      source: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p3' },
      target: { nodeId: 'lille-packaging-plant', propertyId: 'p6' }
    },
    {
      id: 'e63',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p1' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p1' }
    },
    {
      id: 'e64',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p3' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p1' }
    },
    {
      id: 'e65',
      source: { nodeId: 'paris-bakery-bread', propertyId: 'p4' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p3' }
    },
    {
      id: 'e66',
      source: { nodeId: 'paris-patisserie', propertyId: 'p6' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p1' }
    },
    {
      id: 'e67',
      source: { nodeId: 'paris-patisserie', propertyId: 'p1' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p2' }
    },
    {
      id: 'e68',
      source: { nodeId: 'paris-patisserie', propertyId: 'p2' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p2' }
    },
    {
      id: 'e69',
      source: { nodeId: 'paris-patisserie', propertyId: 'p5' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p2' }
    },
    {
      id: 'e70',
      source: { nodeId: 'lyon-quiche-boulangerie', propertyId: 'p1' },
      target: { nodeId: 'calais-distribution-hub', propertyId: 'p1' }
    },
    {
      id: 'e71',
      source: { nodeId: 'paris-patisserie', propertyId: 'p4' },
      target: { nodeId: 'le-havre-export-terminal', propertyId: 'p1' }
    },
    {
      id: 'e72',
      source: { nodeId: 'paris-patisserie', propertyId: 'p5' },
      target: { nodeId: 'le-havre-export-terminal', propertyId: 'p1' }
    },
    {
      id: 'e73',
      source: { nodeId: 'lille-packaging-plant', propertyId: 'p6' },
      target: { nodeId: 'le-havre-export-terminal', propertyId: 'p2' }
    },
    {
      id: 'e74',
      source: { nodeId: 'lille-packaging-plant', propertyId: 'p1' },
      target: { nodeId: 'marseille-seafront-cafe', propertyId: 'p1' }
    },
    {
      id: 'e75',
      source: { nodeId: 'lille-packaging-plant', propertyId: 'p2' },
      target: { nodeId: 'marseille-seafront-cafe', propertyId: 'p2' }
    },
    {
      id: 'e76',
      source: { nodeId: 'calais-distribution-hub', propertyId: 'p3' },
      target: { nodeId: 'marseille-seafront-cafe', propertyId: 'p3' }
    },
    {
      id: 'e77',
      source: { nodeId: 'normandy-fromagerie', propertyId: 'p1' },
      target: { nodeId: 'marseille-seafront-cafe', propertyId: 'p1' }
    },
    {
      id: 'e78',
      source: { nodeId: 'normandy-fromagerie', propertyId: 'p2' },
      target: { nodeId: 'marseille-seafront-cafe', propertyId: 'p3' }
    },
    {
      id: 'e79',
      source: { nodeId: 'lille-packaging-plant', propertyId: 'p3' },
      target: { nodeId: 'paris-flagship-shop', propertyId: 'p5' }
    },
    {
      id: 'e80',
      source: { nodeId: 'lille-packaging-plant', propertyId: 'p6' },
      target: { nodeId: 'paris-flagship-shop', propertyId: 'p4' }
    },
    {
      id: 'e81',
      source: { nodeId: 'lille-packaging-plant', propertyId: 'p1' },
      target: { nodeId: 'paris-flagship-shop', propertyId: 'p1' }
    },
    {
      id: 'e82',
      source: { nodeId: 'calais-distribution-hub', propertyId: 'p1' },
      target: { nodeId: 'paris-flagship-shop', propertyId: 'p3' }
    },
    {
      id: 'e83',
      source: { nodeId: 'calais-distribution-hub', propertyId: 'p2' },
      target: { nodeId: 'paris-flagship-shop', propertyId: 'p2' }
    },
    {
      id: 'e84',
      source: { nodeId: 'calais-distribution-hub', propertyId: 'p1' },
      target: { nodeId: 'orleans-supermarket', propertyId: 'p1' }
    },
    {
      id: 'e85',
      source: { nodeId: 'calais-distribution-hub', propertyId: 'p1' },
      target: { nodeId: 'orleans-supermarket', propertyId: 'p4' }
    },
    {
      id: 'e86',
      source: { nodeId: 'le-havre-export-terminal', propertyId: 'p1' },
      target: { nodeId: 'orleans-supermarket', propertyId: 'p3' }
    },
    {
      id: 'e87',
      source: { nodeId: 'le-havre-export-terminal', propertyId: 'p2' },
      target: { nodeId: 'orleans-supermarket', propertyId: 'p2' }
    },
    {
      id: 'e88',
      source: { nodeId: 'orleans-supermarket', propertyId: 'p5' },
      target: { nodeId: 'brittany-egg-center', propertyId: 'p1' }
    },
    {
      id: 'e89',
      source: { nodeId: 'orleans-supermarket', propertyId: 'p5' },
      target: { nodeId: 'brittany-egg-center', propertyId: 'p2' }
    }
  ]
}
