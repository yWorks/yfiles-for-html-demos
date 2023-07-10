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
/* eslint-disable jsdoc/check-param-names */
import {
  Color,
  Enum,
  GroupNodeStyleIconBackgroundShape,
  GroupNodeStyleIconType,
  GroupNodeStyleTabPosition,
  WebGL2ArcEdgeStyle,
  WebGL2ArrowType,
  WebGL2BridgeEdgeStyle,
  WebGL2DashStyle,
  WebGL2DefaultLabelStyle,
  WebGL2Effect,
  WebGL2GroupNodeStyle,
  WebGL2IconLabelStyle,
  WebGL2LabelShape,
  WebGL2LineCap,
  WebGL2PolylineEdgeStyle,
  WebGL2ShapeNodeShape,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke,
  WebGL2TextureRendering
} from 'yfiles'

import plusIcon from 'demo-resources/icons/plus2-16.svg'
import minusIcon from 'demo-resources/icons/minus2-16.svg'

/**
 * @typedef {('node'|'edge'|'label'|'group')} ItemType
 */

/*
 * ############################################################################
 * This file contains methods for getting values from and setting values to
 * the demo's editor UI. Aside from accessing properties of yFiles objects,
 * these methods do not contain yFiles code and do not demonstrate yFiles
 * concepts. As a consequence, most of the code in this file is not documented.
 * ############################################################################
 */

/**
 * Updates the displayed values in the demo's editor UI.
 * @param {!object} styles The style instances whose property values will be displayed in the editor UI.
 */
export function updateEditor(styles) {
  if (styles.group) {
    openSection('group-nodes')
    updateGroupNodeSection(styles.group)
  } else {
    closeSection('group-nodes')
  }
  if (styles.node) {
    openSection('nodes')
    updateNodeSection(styles.node)
  } else {
    closeSection('nodes')
  }
  if (styles.edge) {
    openSection('edges')
    updateEdgeSection(styles.edge)
  } else {
    closeSection('edges')
  }
  if (styles.label) {
    openSection('labels')
    updateLabelSection(styles.label)
  } else {
    closeSection('labels')
  }
}

/*
 * ############################################################################
 * section update group nodes editor
 * ############################################################################
 */

/**
 * @param {!WebGL2GroupNodeStyle} style
 */
function updateGroupNodeSection(style) {
  getInput('groupNodeFill').value = colorToHexString(style.tabFill)
  getInput('groupNodeContentFill').value = colorToHexString(style.contentAreaFill)
  getSelect('groupNodeEffect').value = Enum.getName(WebGL2Effect.$class, style.effect)

  setStroke(style.stroke, 'group')

  getSelect('groupNodeTabPosition').value = Enum.getName(
    GroupNodeStyleTabPosition.$class,
    style.tabPosition
  )
  getInput('groupNodeTabBackgroundFill').value = colorToHexString(style.tabBackgroundFill)
  getInput('groupNodeTabHeight').value = `${style.tabHeight}`
  getInput('groupNodeTabWidth').value = `${style.tabWidth}`
  getInput('groupNodeTabSlope').value = `${style.tabSlope}`
  getInput('groupNodeTabInset').value = `${style.tabInset}`
  getInput('groupNodeCornerRadius').value = `${style.cornerRadius}`

  getSelect('groupNodeIcon').value = getGroupIconPairName(style.groupIcon)
  getInput('groupNodeIconForegroundFill').value = colorToHexString(style.iconForegroundFill)
  getSelect('groupNodeIconBackgroundShape').value = Enum.getName(
    GroupNodeStyleIconBackgroundShape.$class,
    style.iconBackgroundShape
  )
  getInput('groupNodeIconBackgroundFill').value = colorToHexString(style.iconBackgroundFill)
}

/**
 * @param {!GroupNodeStyleIconType} icon
 * @returns {!('NONE'|'PLUSMINUS'|'CHEVRON'|'TRIANGLE')}
 */
function getGroupIconPairName(icon) {
  switch (icon) {
    case GroupNodeStyleIconType.CHEVRON_UP:
    case GroupNodeStyleIconType.CHEVRON_DOWN:
    case GroupNodeStyleIconType.CHEVRON_LEFT:
    case GroupNodeStyleIconType.CHEVRON_RIGHT:
      return 'CHEVRON'
    case GroupNodeStyleIconType.TRIANGLE_UP:
    case GroupNodeStyleIconType.TRIANGLE_DOWN:
    case GroupNodeStyleIconType.TRIANGLE_LEFT:
    case GroupNodeStyleIconType.TRIANGLE_RIGHT:
      return 'TRIANGLE'
    case GroupNodeStyleIconType.PLUS:
    case GroupNodeStyleIconType.MINUS:
      return 'PLUSMINUS'
    default:
      return 'NONE'
  }
}

/*
 * ############################################################################
 * section update normal nodes editor
 * ############################################################################
 */

/**
 * @param {!WebGL2ShapeNodeStyle} style
 */
function updateNodeSection(style) {
  getSelect('nodeShape').value = Enum.getName(WebGL2ShapeNodeShape.$class, style.shape)
  getInput('nodeFill').value = colorToHexString(style.fill)
  getSelect('nodeEffect').value = Enum.getName(WebGL2Effect.$class, style.effect)

  setStroke(style.stroke, 'node')
}

/*
 * ############################################################################
 * section update edges editor
 * ############################################################################
 */

/**
 * @param {!(WebGL2ArcEdgeStyle|WebGL2BridgeEdgeStyle|WebGL2PolylineEdgeStyle)} style
 */
function updateEdgeSection(style) {
  if (style instanceof WebGL2ArcEdgeStyle) {
    updateEdgeSectionImpl(style, 'Arc')
  } else if (style instanceof WebGL2BridgeEdgeStyle) {
    updateEdgeSectionImpl(style, 'Bridge')
  } /* WebGL2PolylineEdgeStyle*/ else {
    updateEdgeSectionImpl(style, 'Default')
  }
}

/**
 * @param {!(WebGL2ArcEdgeStyle|WebGL2BridgeEdgeStyle|WebGL2PolylineEdgeStyle)} style
 * @param {!('Arc'|'Bridge'|'Default')} type
 */
function updateEdgeSectionImpl(style, type) {
  getSelect('edgeStyle').value = type

  getSelect('sourceArrow').value = Enum.getName(WebGL2ArrowType.$class, style.sourceArrow)
  getSelect('targetArrow').value = Enum.getName(WebGL2ArrowType.$class, style.targetArrow)
  getSelect('edgeEffect').value = Enum.getName(WebGL2Effect.$class, style.effect)
  getInput('bendSmoothing').value = `${getSmoothingLength(style, type)}`
  if (style instanceof WebGL2ArcEdgeStyle || style instanceof WebGL2BridgeEdgeStyle) {
    getInput('height').value = `${style.height}`
  }

  setStroke(style.stroke, 'edge')
}

/**
 * @param {!(WebGL2ArcEdgeStyle|WebGL2BridgeEdgeStyle|WebGL2PolylineEdgeStyle)} style
 * @param {!('Arc'|'Bridge'|'Default')} type
 * @returns {number}
 */
function getSmoothingLength(style, type) {
  return 'Default' === type ? style.smoothingLength : 0
}

/*
 * ############################################################################
 * section update labels editor
 * ############################################################################
 */

/**
 * @param {!(WebGL2DefaultLabelStyle|WebGL2IconLabelStyle)} style
 */
function updateLabelSection(style) {
  if (style instanceof WebGL2DefaultLabelStyle) {
    updateLabelSectionImpl(style, 'Default')
  } else {
    updateLabelSectionImpl(style, 'Icon')
  }
}

/**
 * @param {!(WebGL2DefaultLabelStyle|WebGL2IconLabelStyle)} style
 * @param {!('Default'|'Icon')} type
 */
function updateLabelSectionImpl(style, type) {
  getSelect('labelShape').value = Enum.getName(WebGL2LabelShape.$class, style.shape)
  getInput('labelTextColor').value = colorToHexString(getTextColor(style, type))
  getInput('labelBackgroundColor').value = colorToHexString(style.backgroundColor)
  getSelect('labelEffect').value = Enum.getName(WebGL2Effect.$class, style.effect)
  getSelect('labelRenderingType').value = Enum.getName(
    WebGL2TextureRendering.$class,
    style.textureRendering
  )
  getInput('labelOversampling').value = `${getSamplingRate(style, type)}`

  setStroke(style.backgroundStroke, 'label')
}

/**
 * @param {!(WebGL2DefaultLabelStyle|WebGL2IconLabelStyle)} style
 * @param {!('Default'|'Icon')} type
 * @returns {number}
 */
function getSamplingRate(style, type) {
  return 'Default' === type ? style.samplingRate : 0.0
}

/**
 * @param {!(WebGL2DefaultLabelStyle|WebGL2IconLabelStyle)} style
 * @param {!('Default'|'Icon')} type
 * @returns {!Color}
 */
function getTextColor(style, type) {
  return 'Default' === type ? style.textColor : Color.BLACK
}

/*
 * ############################################################################
 * section strokes editor
 * ############################################################################
 */

/**
 * Returns a {@link WebGL2Stroke} instance that is created with the editor values from the
 * editor section for the given item type.
 * @param {!ItemType} type the item type for which the stroke is used.
 * @returns {!WebGL2Stroke}
 */
export function getStroke(type) {
  const noStroke = getInput(`${type}StrokeButtonNone`).className.indexOf('active') != -1
  const simpleStroke = getInput(`${type}StrokeButtonSimple`).className.indexOf('active') != -1
  if (noStroke && type != 'edge') {
    return WebGL2Stroke.NONE
  } else if (simpleStroke) {
    return new WebGL2Stroke(
      getInput(`${type}StrokeColor`).value,
      getNumber(`${type}StrokeThickness`)
    )
  } else {
    return new WebGL2Stroke(
      getInput(`${type}StrokeColor`).value,
      getNumber(`${type}StrokeThickness`),
      getDashStyle(type),
      getLineCapStyle(type)
    )
  }
}

/**
 * @param {!string} type
 * @returns {!WebGL2DashStyle}
 */
function getDashStyle(type) {
  const value = getValue(`${type}StrokeDashStyle`)
  return WebGL2DashStyle[value]
}

/**
 * @param {!string} type
 * @returns {!WebGL2LineCap}
 */
function getLineCapStyle(type) {
  const value = getValue(`${type}StrokeLineCaps`)
  return WebGL2LineCap[value]
}

/**
 * Updates the stroke editor values in the editor section for the given item type with the
 * property values of the given stroke instance.
 * @param {!WebGL2Stroke} stroke
 * @param {!ItemType} type
 */
export function setStroke(stroke, type) {
  if (WebGL2Stroke.NONE == stroke) {
    setStrokeSectionActive(type, 'None')
  } else if (stroke.dashStyle == WebGL2DashStyle.SOLID) {
    setStrokeSectionActive(type, 'Simple')
    getInput(`${type}StrokeColor`).value = colorToHexString(stroke.color)
    getInput(`${type}StrokeThickness`).value = `${stroke.thickness}`
  } else {
    setStrokeSectionActive(type, 'More')
    getInput(`${type}StrokeColor`).value = colorToHexString(stroke.color)
    getInput(`${type}StrokeThickness`).value = `${stroke.thickness}`
    getSelect(`${type}StrokeDashStyle`).value = Enum.getName(
      WebGL2DashStyle.$class,
      stroke.dashStyle
    )
    getSelect(`${type}StrokeLineCaps`).value = Enum.getName(WebGL2LineCap.$class, stroke.lineCap)
  }
}

/**
 * @param {!ItemType} type
 * @param {!('None'|'Simple'|'More')} section
 */
function setStrokeSectionActive(type, section) {
  const isNone = 'None' === section
  const isMore = 'More' === section
  if (isNone) {
    getButton(`${type}StrokeButtonSimple`).classList.remove('active')
    getButton(`${type}StrokeButtonMore`).classList.remove('active')
  } else if (isMore) {
    getButton(`${type}StrokeButtonNone`).classList.remove('active')
    getButton(`${type}StrokeButtonSimple`).classList.remove('active')
  } else {
    getButton(`${type}StrokeButtonNone`).classList.remove('active')
    getButton(`${type}StrokeButtonMore`).classList.remove('active')
  }

  getButton(`${type}StrokeButton${section}`).classList.add('active')

  const contentArea = getBlock(`${type}TabContent`)
  contentArea.style.display = isNone ? 'none' : 'block'
  const strokeSimple = getBlock(`${type}StrokeSimple`)
  strokeSimple.style.display = isNone ? 'none' : 'block'
  const strokeMore = getBlock(`${type}StrokeMore`)
  strokeMore.style.display = isMore ? 'block' : 'none'
}

/**
 * Returns the hexadecimal representation of the given color.
 * @param {!Color} c
 * @returns {!string}
 */
function colorToHexString(c) {
  return '#' + (toHexString(c.r) + toHexString(c.g) + toHexString(c.b)).toUpperCase()
}

/**
 * Returns the hexadecimal representation of the given number.
 * This methods assumes a value in the range [0, 255].
 * @param {number} value
 * @returns {!string}
 */
function toHexString(value) {
  return (value < 16 ? '0' : '') + value.toString(16)
}

/*
 * ############################################################################
 * section utility methods for expanding and collapsing sections
 * ############################################################################
 */

/**
 * @param {!string} id
 */
function closeSection(id) {
  const button = getButton(`${id}-section-button`)
  if (button.classList.contains('active')) {
    toggleSectionButton(button)
  }
}

/**
 * @param {!string} id
 */
function openSection(id) {
  const button = getButton(`${id}-section-button`)
  if (!button.classList.contains('active')) {
    toggleSectionButton(button)
  }
}

/**
 * @param {!HTMLButtonElement} button
 */
function toggleSectionButton(button) {
  button.classList.toggle('active')
  const img = button.firstElementChild
  const section = button.nextElementSibling

  if (section.style.display === 'block') {
    section.style.display = 'none'
    img.src = plusIcon
  } else {
    section.style.display = 'block'
    img.src = minusIcon
  }
}

/*
 * ############################################################################
 * section editor UI configuration
 * ############################################################################
 */

/**
 * Registers listeners to be notified of any changes in the demo's properties editor UI.
 * @param {!function} valueChanged Callback that is notified of changes in one of the item type editor sections.
 */
export function configureEditor(valueChanged) {
  configureSectionHeaders()
  configureStrokeSections()

  configureEditorListeners(valueChanged, 'node', 'nodes-section')
  configureEditorListeners(valueChanged, 'group', 'group-nodes-section')
  configureEditorListeners(valueChanged, 'edge', 'edges-section')
  configureEditorListeners(valueChanged, 'label', 'labels-section')
}

/**
 * @param {!function} valueChanged
 * @param {!ItemType} type
 * @param {!string} id
 */
function configureEditorListeners(valueChanged, type, id) {
  let delayedEvent = 0
  const scheduleEvent = () => {
    clearTimeout(delayedEvent)
    delayedEvent = window.setTimeout(() => valueChanged(type), 100)
  }
  for (const editor of document.querySelectorAll(`#${id} .editor`)) {
    if (editor instanceof HTMLSelectElement) {
      editor.addEventListener('change', scheduleEvent)
    } else if (editor instanceof HTMLInputElement) {
      editor.addEventListener('input', scheduleEvent)
    } else if (editor instanceof HTMLButtonElement) {
      editor.addEventListener('click', scheduleEvent)
    }
  }
}

/**
 * Registers listeners for collapsing and expanding editor sections when clicking into the
 * section headers.
 */
function configureSectionHeaders() {
  const headers = document.getElementsByClassName('collapsible')
  for (let i = 0; i < headers.length; ++i) {
    const button = headers[i]
    button.onclick = () => toggleSectionButton(button)
    button.nextElementSibling.style.display = 'none'
  }
}

/**
 * Registers listeners for choosing one of stroke types 'None', 'Solid', and 'Dashed'.
 */
function configureStrokeSections() {
  configureStrokeSectionsImpl('node')
  configureStrokeSectionsImpl('edge')
  configureStrokeSectionsImpl('label')
  configureStrokeSectionsImpl('group')
}

/**
 * Registers listeners for choosing one of stroke types 'None', 'Solid', and 'Dashed' in the
 * given item type section.
 * @param {!ItemType} type
 */
function configureStrokeSectionsImpl(type) {
  const sections = ['None', 'Simple', 'More']
  for (const section of sections) {
    getButton(`${type}StrokeButton${section}`).onclick = () => setStrokeSectionActive(type, section)
  }
}

/*
 * ############################################################################
 * section accessor methods for HTML elements
 * ############################################################################
 */

/**
 * @param {!string} id
 * @returns {!HTMLDivElement}
 */
function getBlock(id) {
  return getElementById(id)
}

/**
 * @param {!string} id
 * @returns {!HTMLButtonElement}
 */
function getButton(id) {
  return getElementById(id)
}

/**
 * @param {!string} id
 * @returns {!HTMLInputElement}
 */
export function getInput(id) {
  return getElementById(id)
}

/**
 * @param {!string} id
 * @returns {number}
 */
export function getNumber(id) {
  return Number(getInput(id).value)
}

/**
 * @param {!string} id
 * @returns {!HTMLSelectElement}
 */
function getSelect(id) {
  return getElementById(id)
}

/**
 * @param {!string} id
 * @returns {!string}
 */
export function getValue(id) {
  return getElementById(id).value
}

/**
 * @template {HTMLElement} T
 * @param {!string} id
 * @returns {!T}
 */
function getElementById(id) {
  return document.getElementById(id)
}
