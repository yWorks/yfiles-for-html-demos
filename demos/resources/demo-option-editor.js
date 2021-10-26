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
/* eslint-disable */
import {
  Attribute,
  Class,
  Enum,
  HashMap,
  IComparer,
  List,
  PropertyInfo,
  YBoolean,
  yfiles,
  YNumber,
  YString
} from 'yfiles'

/**
 * An attribute that determines the OptionGroup the ui component belongs to.
 */
export const OptionGroupAttribute = Attribute('OptionGroupAttribute', {
  $extends: Attribute,

  /**
   * Initialize the new OptionGroupAttribute.
   * @param {string} name Name of OptionGroup the ui component belongs to.
   * @param {number} position The ui component's display position in the OptionGroup.
   */
  constructor: function (name, position) {
    Attribute.call(this)
    this.name = name
    this.position = position
  },

  /**
   * Name of OptionGroup the ui component belongs to.
   * @type {string}
   */
  name: null,

  /**
   * The ui component's display position in the OptionGroup.
   * @type {number}
   */
  position: 0
})

export const OptionGroup = Class('OptionGroup', {})

/**
 * An attribute that determines the ui component's text label.
 */
export const LabelAttribute = Attribute('LabelAttribute', {
  $extends: Attribute,

  /**
   * Initialize the LabelAttribute.
   * @param {string} label The text of the generated label.
   * @param {string?} link The api link that is associated with this label.
   */
  constructor: function (label, link) {
    Attribute.call(this)
    this.label = label
    if (typeof link === 'string') {
      this.link = link
    }
  },

  /**
   * The text of the generated label.
   * @type {string}
   */
  label: null,

  /**
   * The external link of the generated label.
   */
  link: null
})

/**
 * An attribute that determines the ui component's label link.
 */
export const LinkAttribute = Attribute('LinkAttribute', {
  $extends: Attribute,

  /**
   * Initialize the LinkAttribute.
   * @param {string} link The link of the generated label.
   */
  constructor: function (link) {
    Attribute.call(this)
    this.link = link
  },

  /**
   * The link of the generated label.
   * @type {string}
   */
  link: null
})

/**
 * An attribute that limits the ui component's value to the given range.
 */
export const MinMaxAttribute = Attribute('MinMaxAttribute', {
  $extends: Attribute,

  /**
   * Initialize the MinMaxAttribute.
   */
  constructor: function () {
    Attribute.call(this)
    this.min = Number.MIN_VALUE
    this.max = Number.MAX_VALUE
    this.step = 1
  },

  /**
   * The ui component's minimum valid value.
   * @type {number}
   */
  min: 0,

  /**
   * The ui component's maximum valid value.
   * @type {number}
   */
  max: 0,

  /**
   * The ui component's increment/decrement step (if supported).
   * @type {number}
   */
  step: 0
})

/**
 * An attribute that determines fixed named values for the ui component.
 */
export const EnumValuesAttribute = Attribute('EnumValuesAttribute', {
  $extends: Attribute,

  /** @type {Object[]} */
  values: null
})

/**
 * An attribute that determines the ui component's type.
 */
export const TypeAttribute = Attribute('TypeAttribute', {
  $extends: Attribute,

  /**
   * Initialize the TypeAttribute.
   * @param {Class} type The type of the attribute.
   */
  constructor: function (type) {
    Attribute.call(this)
    this.type = type
  },

  /**
   * The text of the generated label.
   * @type {Class}
   */
  type: null
})

/**
 * ConfigConverter is used to convert an input configuration into a configuration object usable by
 * yFilesOptionUI. The output configuration object is later interpreted by yFilesOptionUI and
 * turned into ui components. The input configuration is a regular class with additional attributes
 * attached to public member declarations. These attributes specify how a member is turned into an
 * ui component. The input configuration format
 *
 *  Components:
 *  - a default component is created for each public property according to the property's type.
 *  - components are available for built-in types: enum, bool, int, double, string
 *  Component labels:
 *  - component labels are defined using the {@link LabelAttribute}
 *
 *  Component minimum, maximum and step:
 *  - component minimum, maximum and step are defined using the {@link MinMaxAttribute}
 *
 *  Component type:
 *  - component type is one of {@link Components} and defined using the
 * {@link ComponentAttribute}
 *
 *  Component grouping and ordering:
 *  - public fields of type OptionGroup are interpreted as ui groups
 *  - components or OptionGroups are assigned to another OptionGroup using the
 * {@link OptionGroupAttribute}
 *  - if a fields OptionGroup attribute has name "RootGroup" the corresponding component is added
 * to the toplevel group.
 *  - display order of components is defined through position parameter of
 * {@link OptionGroupAttribute}
 *
 *  Conditionally disabling a component:
 *  - a public boolean property named "shouldDisable[memberName]" defines a condition to disable
 * the component created for the corresponding member.
 *
 *  Conditionally hiding a component:
 *  - a public boolean property named "shouldHide[memberName]" defines a condition to hide the
 * component created for the corresponding member.
 */
export const ConfigConverter = Class('ConfigConverter', {
  constructor: function () {
    this.$initConfigConverter()
  },

  /**
   * all members that need to be written to membersArray - including groups
   * @type {List.<MemberInfo>}
   */
  toplevelItems: null,

  /**
   * all members including members inside groups; without groups themselves
   * @type {List.<MemberInfo>}
   */
  toplevelMembers: null,

  /**
   * the groups
   * @type {List.<MemberInfo>}
   */
  groups: null,

  /**
   * the methods
   * @type {List.<MethodInfo>}
   */
  methods: null,

  /**
   * the members that are contained within groups
   * @type {Map.<MemberInfo, MemberInfo>}
   */
  groupMembers: null,

  /**
   * map a group name to a list of its inner members
   * @type {Map.<string,List.<MemberInfo>>}
   */
  groupMapping: null,

  /**
   * maps for disabled and hidden properties
   * @type {Map.<string,string>}
   */
  isDisabledMapping: null,

  /**
   * @type {Map.<string,string>}
   */
  isHiddenMapping: null,

  /**
   * Convert the input configuration into an output configuration object usable by yFilesOptionUI.
   * First, all members are *collected* and stored in their respective maps and lists.
   * Next, members are sorted by the position information contained in the corresponding
   * OptionGroupAttribute. Finally, all members are visited and the extracted data relevant to
   * build ui components are written to a JSObject.
   * @param {Object} config The input configuration written by the developer.
   * @return {Object} The output configuration usable by yFilesOptionUI.
   */
  convert: function (config) {
    const type = yfiles.lang.getType(config)
    this.collectMembers(type)

    const config1 = new Object()
    this.writeLabel(type, config1)

    this.toplevelItems.sort(new ConfigConverter.MemberComparer())
    this.groupMapping.forEach(function (entry) {
      entry.value.sort(new ConfigConverter.MemberComparer())
    })

    this.writeMembers(config1, config)
    this.writeApply(config1, config)
    this.writeMembersArray(config1)

    config1._preset = null
    return config1
  },

  /**
   * Write member information into config JSObject.
   * <remarks>
   * The function basically dispatches between different visitor functions.
   * </remarks>
   * @param {Object} config The JSObject to contain the configuration.
   * @param {Object} yFilesObj
   */
  writeMembers: function (config, yFilesObj) {
    const members = new Object()

    this.toplevelMembers.forEach(
      function (member) {
        this.visitMember(member, members, yFilesObj)
      }.bind(this)
    )
    this.groupMembers.forEach(
      function (member) {
        this.visitMember(member.key, members, yFilesObj)
      }.bind(this)
    )
    this.groups.forEach(
      function (group) {
        this.visitGroup(group, members, yFilesObj)
      }.bind(this)
    )
    this.methods.forEach(
      function (method) {
        this.visitMember(method, members, yFilesObj)
      }.bind(this)
    )

    config['members'] = members
  },

  /**
   * Collect all members of a given type and store them in the respective field.
   * @param {Class} type The type object to collect members for.
   */
  collectMembers: function (type) {
    this.clearMappings()
    let memberInfos = this.getMemberInfos(type, true)

    let /** number */ i
    for (i = 0; i < memberInfos.length; i++) {
      var member = memberInfos[i]
      this.collectMember(member)
    }
    memberInfos = this.getMemberInfos(type, false)

    let /** number */ i1
    for (i1 = 0; i1 < memberInfos.length; i1++) {
      var member = memberInfos[i1]
      this.collectPrivateMember(member)
    }
  },

  getMemberInfos: function (type, isPublic) {
    const members = []
    const allNames = Object.getOwnPropertyNames(type.Object.prototype)
    const scopedNames = allNames.filter(function (name) {
      return isPublic ? name.indexOf('$') < 0 : name.indexOf('$') === 0
    })

    scopedNames.forEach(function (name) {
      if (name === 'constructor') {
        return
      }
      const attributes = []
      let typeAttribute = null

      // get meta data attributes
      const attributeContainer = type.$meta[name]
      if (typeOf(attributeContainer) === 'function') {
        const attributeGetters = type.$meta[name]()
        if (typeOf(attributeGetters) === 'array') {
          attributeGetters.forEach(function (attributeGetter) {
            const attr = attributeGetter()
            if (attr instanceof TypeAttribute) {
              typeAttribute = attr.type
            }
            attributes.push(attr)
          })
        }
      }

      // determine type
      const objectDescriptor = Object.getOwnPropertyDescriptor(type.Object.prototype, name)
      let propertyMask = 0
      if (objectDescriptor.hasOwnProperty('get')) {
        // readable property
        propertyMask += 1
      }
      if (
        propertyMask &&
        objectDescriptor.hasOwnProperty('set') &&
        void 0 !== objectDescriptor.set
      ) {
        // writable property
        propertyMask += 2
      }
      const valueType = typeOf(objectDescriptor.value)
      const isField =
        objectDescriptor.hasOwnProperty('value') &&
        valueType !== 'function' &&
        valueType !== 'asyncfunction'
      const isMethod =
        objectDescriptor.hasOwnProperty('value') &&
        (valueType === 'function' || valueType === 'asyncfunction')

      const member = {
        name: name,
        _attributes: attributes,
        propertyMask: propertyMask,
        isField: isField,
        isMethod: isMethod
      }

      // assign the type attribute if there is any
      if (type !== null) {
        if (propertyMask) {
          member.propertyType = typeAttribute
        } else if (isField) {
          member.fieldType = typeAttribute
        }
      }

      members.push(member)
    })
    return members
  },

  getCustomAttributesOfType: function (member, type) {
    if (!member._attributes) {
      return []
    }

    const allAttributes = member._attributes
    const typedAttributes = []
    allAttributes.forEach(function (attr) {
      if (type.isInstance(attr)) {
        typedAttributes.push(attr)
      }
    })
    return typedAttributes
  },

  /**
   * Clear members from dictionaries and lists.
   */
  clearMappings: function () {
    this.groupMapping.clear()
    this.groups.clear()
    this.toplevelMembers.clear()
    this.toplevelItems.clear()
    this.methods.clear()
    this.groupMembers.clear()
    this.isHiddenMapping.clear()
    this.isDisabledMapping.clear()
  },

  /**
   * Collect a member.
   * The function dispatches between different collect functions based on type of member.
   * @param {MemberInfo} member The member to be processed.
   */
  collectMember: function (member) {
    if (this.collectUtilityProperty(member)) {
      return
    }
    if (member.isField) {
      this.collectField(member)
    } else if (isProperty(member)) {
      this.collectProperty(member)
    } else if (member.isMethod) {
      this.collectMethod(member)
    }
  },

  collectPrivateMember: function (member) {
    this.collectUtilityProperty(member)
  },

  /**
   * Collect an UtilityProperty that disables or hides a control.
   * @param {MemberInfo} member The member to be processed.
   * @return {boolean} true if property is an UtilityProperty
   */
  collectUtilityProperty: function (member) {
    if (startsWith(member.name, 'shouldHide')) {
      this.isHiddenMapping.set(member.name.substr(10).toLowerCase(), member.name)
      return true
    } else if (startsWith(member.name, '$shouldHide')) {
      this.isHiddenMapping.set(member.name.substr(11).toLowerCase(), member.name)
      return true
    } else if (startsWith(member.name, 'shouldDisable')) {
      this.isDisabledMapping.set(member.name.substr(13).toLowerCase(), member.name)
      return true
    } else if (startsWith(member.name, '$shouldDisable')) {
      this.isDisabledMapping.set(member.name.substr(14).toLowerCase(), member.name)
      return true
    }
    return false
  },

  /**
   * Collect a field.
   * If the field has a group attribute, add it to the corresponding
   * {@link ConfigConverter#groupMapping}, otherwise add it to
   * {@link ConfigConverter#toplevelMembers}. If the field is a group (it is of type
   * OptionGroup), add it to the {@link ConfigConverter#groups}, otherwise add it to
   * {@link ConfigConverter#groupMembers}.
   * @param {FieldInfo} field The field to process.
   */
  collectField: function (field) {
    const group = this.getGroup(field)
    if (group !== null && group !== 'RootGroup') {
      if (!this.groupMapping.has(group)) {
        this.groupMapping.set(group, new List())
      }
      this.groupMapping.get(group).add(field)
      if (this.isOptionGroup(field)) {
        this.groups.add(field)
      } else {
        if (!this.groupMembers.has(field)) {
          this.groupMembers.set(field, field)
        }
      }
    } else {
      this.toplevelItems.add(field)
      if (field.fieldType === OptionGroup.$class) {
        this.groups.add(field)
      } else {
        this.toplevelMembers.add(field)
      }
    }
  },

  /**
   * Collect a property.
   * If the property has a group attribute, add it to the corresponding
   * {@link ConfigConverter#groupMapping}, otherwise add it to
   * {@link ConfigConverter#toplevelMembers}. If the property is a group (it is of type
   * OptionGroup), add it to the {@link ConfigConverter#groups}, otherwise add it to
   * {@link ConfigConverter#groupMembers}.
   * @param {PropertyInfo} property The property to process.
   */
  collectProperty: function (property) {
    const group = this.getGroup(property)
    if (group !== null && group !== 'RootGroup') {
      if (!this.groupMapping.has(group)) {
        this.groupMapping.set(group, new List())
      }
      this.groupMapping.get(group).add(property)
      if (this.isOptionGroup(property)) {
        this.groups.add(property)
      } else {
        if (!this.groupMembers.has(property)) {
          this.groupMembers.set(property, property)
        }
      }
    } else {
      this.toplevelItems.add(property)
      if (property.propertyType === OptionGroup.$class) {
        this.groups.add(property)
      } else {
        this.toplevelMembers.add(property)
      }
    }
  },

  /**
   * Collect a method.
   * @param {MethodInfo} method The method to process.
   */
  collectMethod: function (method) {
    if (method.name !== 'getClass') {
      this.methods.add(method)
    }
  },

  /**
   * Visit a member.
   * The function dispatches between different visit functions based on type of the member.
   * @param {MemberInfo} member The member to visit.
   * @param {Object} members The output data object.
   * @param {Object} yFilesObj
   */
  visitMember: function (member, members, yFilesObj) {
    if (shouldIgnoreMember(member)) {
      return
    }
    if (member.isField) {
      members[member.name] = this.visitField(member, yFilesObj)
    } else if (isProperty(member)) {
      members[member.name] = this.visitProperty(member, yFilesObj)
    } else if (member.isMethod) {
      members[member.name] = visitMethod(member, yFilesObj)
    }
  },

  /**
   * Visit a field and return all relevant information to build a component.
   * The following information is written:
   * - the text label
   * - the options
   * - the initial value
   * - the default value
   * - the component type
   * - the utility properties (condition to disable/hide the component)
   * - all custom attributes
   * @param {FieldInfo} field The field to visit.
   * @param {Object} yFilesObj
   * @return {Object} a new JSObject containing all information collected for the field
   */
  visitField: function (field, yFilesObj) {
    const f = new Object()

    f['name'] = field.name
    f['type'] = this.getTypeString(field.fieldType)

    this.writeLabel(field, f)
    this.writeOptions(field, field.fieldType, f)
    this.writeValueProperty(field, f, yFilesObj)
    this.writeDefault(field, f, yFilesObj)
    this.writeComponent(field, field.fieldType, f)
    this.writeUtilityProperties(field, f, yFilesObj)
    /* Object[] */ let arr
    /* number */ let i
    for (i = 0, arr = field._attributes; i < arr.length; i++) {
      const attribute = arr[i]
      this.visitAttribute(attribute, f)
    }
    return f
  },

  /**
   * Visit a property and return all relevant information to build a component.
   * The following information is written:
   * - the text label
   * - the options
   * - the initial value
   * - the default value
   * - the component type
   * - the utility properties (condition to disable/hide the component)
   * - all custom attributes
   * @param {PropertyInfo} property The property to visit.
   * @param {Object} yFilesObj
   * @return {Object} a new JSObject containing all information collected for the property
   */
  visitProperty: function (property, yFilesObj) {
    const p = new Object()

    p['name'] = property.name
    p['type'] = this.getTypeString(property.propertyType)

    this.writeLabel(property, p)
    this.writeOptions(property, property.propertyType, p)
    this.writeValueProperty(property, p, yFilesObj)
    if (isReadWrite(property)) {
      this.writeDefault(property, p, yFilesObj)
    }
    this.writeComponent(property, property.propertyType, p)
    this.writeUtilityProperties(property, p, yFilesObj)
    let /** Object[] */ arr
    let /** number */ i
    for (i = 0, arr = property._attributes; i < arr.length; i++) {
      const attribute = arr[i]
      this.visitAttribute(attribute, p)
    }
    return p
  },

  /**
   * Visit an attribute and return all relevant information to build a component.
   * The following information is written:
   * - minimum value
   * - maximum value
   * - increment/decrement step
   * @param {Attribute} attribute The attribute to process.
   * @param {Object} obj The object containing the extracted information
   */
  visitAttribute: function (attribute, obj) {
    if (attribute instanceof MinMaxAttribute) {
      const attr = attribute
      obj['min'] = attr.min
      obj['max'] = attr.max
      obj['step'] = attr.step
    }
  },

  /**
   * Visit a group and return all relevant information to build a component.
   * The following information is written:
   * - group name
   * - text label
   * @param {MemberInfo} group The group to process.
   * @param {Object} members The object containing the extracted information
   * @param {Object} yFilesObj
   */
  visitGroup: function (group, members, yFilesObj) {
    const g = new Object()
    g['name'] = group.name
    this.writeLabel(group, g)
    const attrs = group._attributes
    let /** number */ i
    for (i = 0; i < attrs.length; i++) {
      const attribute = attrs[i]
      this.visitAttribute(attribute, g)
    }

    members[group.name] = g
  },

  /**
   * Write the value property to object.
   * @param {MemberInfo} member The member to process.
   * @param {Object} obj The object containing the extracted information.
   * @param {Object} yFilesObj
   */
  writeValueProperty: function (member, obj, yFilesObj) {
    const descriptor = new Object()
    descriptor['get'] = function () {
      return yFilesObj[member.name]
    }
    descriptor['set'] = function (o) {
      ;(yFilesObj[member.name] = o), o
    }
    Object.defineProperty(obj, 'value', descriptor)
  },

  /**
   * Write the component type to object.
   * If a ComponentAttribute is set, the given component type is written.
   * If an EnumValuesAttribute is present a combobox component is written.
   * Otherwise a default component is determined based on datatype.
   * @param {MemberInfo} member The member to process.
   * @param {Class} type The type of the member.
   * @param {Object} obj The object containing the extracted information.
   */
  writeComponent: function (member, type, obj) {
    let /** string */ component
    if (this.getCustomAttributesOfType(member, ComponentAttribute.$class).length > 0) {
      const attr = this.getCustomAttributesOfType(member, ComponentAttribute.$class)[0]
      component = this.getComponent(attr.value)
    } else {
      if (this.getCustomAttributesOfType(member, EnumValuesAttribute.$class).length > 0) {
        // use combobox for members with EnumValues attribute
        component = 'combobox'
      } else {
        component = this.getDefaultComponent(type)
      }
    }
    obj['component'] = component
  },

  /**
   * Write the label text to JSObject.
   * @param {MemberInfo} member The member to process.
   * @param {Object} obj The JSObject containing the extracted information.
   */
  writeLabel: function (member, obj) {
    const attributes = this.getCustomAttributesOfType(member, LabelAttribute.$class)
    let /** string */ label
    let /** string */ link
    if (attributes.length > 0) {
      const attr = attributes[0]
      label = attr.label
      link = attr.link
    } else {
      label = member.name
    }
    obj['label'] = label
    if (link && link.startsWith('#')) {
      link = 'https://docs.yworks.com/yfileshtml/' + link
    }
    obj['link'] = link
  },

  /**
   * Write options to JSObject.
   * If an EnumValuesAttribute is set, options are extracted from it.
   * If the member is of type enum, options are extracted from the enum.
   * @param {MemberInfo} member The member to process.
   * @param {Class} type The type of the member.
   * @param {Object} obj The JSObject containing the extracted information.
   */
  writeOptions: function (member, type, obj) {
    const options = new Array()
    const attributes = this.getCustomAttributesOfType(member, EnumValuesAttribute.$class)
    if (attributes.length > 0) {
      var values = attributes[0].values
      /* number */ let i1
      for (i1 = 0; i1 < values.length; i1++) {
        const value = values[i1]
        options.push(this.createOption(value[0], value[1]))
      }
      obj['options'] = options
    } else if (type.isEnum) {
      var values = Enum.getValues(type)
      for (let i = 0; i < values.length; i++) {
        options.push(this.createOption(Enum.getName(type, values[i]), values[i]))
      }
      obj['options'] = options
    }
  },

  /**
   * @return {Object}
   */
  createOption: function (name, value) {
    const option = new Object()
    option['name'] = name
    option['value'] = value
    return option
  },

  /**
   * Write default value to JSObject.
   * @param {MemberInfo} member The member to process.
   * @param {Object} obj The JSObject containing the extracted information.
   * @param {Object} yFilesObj
   */
  writeDefault: function (member, obj, yFilesObj) {
    const a = this.getDefaultCore(member, yFilesObj)
    obj['default'] = a
    obj['reset'] = function () {
      ;(obj['value'] = a), a
    }
  },

  /**
   * Write utility properties to JSObject.
   * @param {MemberInfo} member The member to process.
   * @param {Object} obj The JSObject containing the extracted information.
   * @param {Object} yFilesObj
   */
  writeUtilityProperties: function (member, obj, yFilesObj) {
    const name = member.name.toLowerCase()
    if (this.isDisabledMapping.has(name)) {
      obj['isDisabled'] = function () {
        return yFilesObj[this.isDisabledMapping.get(name)]
      }.bind(this)
    }
    if (this.isHiddenMapping.has(name)) {
      obj['isHidden'] = function () {
        return yFilesObj[this.isHiddenMapping.get(name)]
      }.bind(this)
    }
  },

  writeApply: function (config, yFilesObj) {
    config['apply'] = function () {
      if (yFilesObj['apply']) {
        return yFilesObj['apply'].call(yFilesObj, [])
      }
      return null
    }
  },

  /**
   * Writes an array with the options and groups hierarchy.
   */
  writeMembersArray: function (config) {
    const membersArray = new Array()
    for (let i = 0; i < this.toplevelItems.size; i++) {
      const member = this.toplevelItems.get(i)
      if (this.groups.includes(member)) {
        membersArray.push(this.getGroupObject(member))
      } else {
        membersArray.push(getMemberObject(member))
      }
    }
    config['membersArray'] = membersArray
  },

  /**
   * @return {Object}
   */
  getGroupObject: function (group) {
    const o = new Object()
    const name = group.name
    o['type'] = 'group'
    o['name'] = name

    const members = new Array()
    if (this.groupMapping.has(name)) {
      for (let i = 0; i < this.groupMapping.get(name).size; i++) {
        const groupMember = this.groupMapping.get(name).get(i)
        if (this.isOptionGroup(groupMember)) {
          members.push(this.getGroupObject(groupMember))
        } else {
          members.push(getMemberObject(groupMember))
        }
      }
    }
    o['members'] = members

    return o
  },

  /**
   * @return {boolean}
   */
  isOptionGroup: function (groupMember) {
    if (isProperty(groupMember)) {
      return groupMember.propertyType === OptionGroup.$class
    } else if (groupMember.isField) {
      return groupMember.fieldType === OptionGroup.$class
    }
    return false
  },

  /**
   * @return {string}
   */
  getTypeString: function (type) {
    if (type === YNumber.$class) {
      return 'number'
    } else if (type === YString.$class) {
      return 'string'
    } else if (type === YBoolean.$class) {
      return 'bool'
    }
    return type.fullName
  },

  /**
   * @return {Object}
   */
  getDefaultCore: function (member, yFilesObj) {
    return yFilesObj[member.name]
  },

  /**
   * @return {string}
   */
  getGroup: function (member) {
    const attributes = []
    member._attributes.forEach(function (attr) {
      if (attr instanceof OptionGroupAttribute) {
        attributes.push(attr)
      }
    })
    if (attributes.length > 0) {
      return attributes[0].name
    }
    return null
  },

  /**
   * @return {string}
   */
  getComponent: function (value) {
    switch (value) {
      case Components.SLIDER:
        return 'slider'
      case Components.COMBOBOX:
        return 'combobox'
      case Components.RADIO_BUTTON:
        return 'radiobutton'
      case Components.CHECKBOX:
        return 'checkbox'
      case Components.SPINNER:
        return 'spinner'
      case Components.HTML_BLOCK:
        return 'htmlblock'
      default:
        return 'text'
    }
  },

  /**
   * @return {string}
   */
  getDefaultComponent: function (type) {
    if (type.isEnum) {
      return 'combobox'
    } else if (type === YBoolean.$class) {
      return 'checkbox'
    } else if (type === YNumber.$class) {
      return 'spinner'
    }
    return 'text'
  },

  $initConfigConverter: function () {
    this.toplevelItems = new List()
    this.toplevelMembers = new List()
    this.groups = new List()
    this.methods = new List()
    this.groupMembers = new HashMap()
    this.groupMapping = new HashMap()
    this.isDisabledMapping = new HashMap()
    this.isHiddenMapping = new HashMap()
  },

  $static: {
    /**
     * IComparer that compares members position information contained in OptionGroupAttribute.
     */
    MemberComparer: Class('MemberComparer', {
      $with: [IComparer],

      getCustomAttributesOfType: function (member, type) {
        if (!member._attributes) {
          return []
        }

        const allAttributes = member._attributes
        const typedAttributes = []
        allAttributes.forEach(function (attr) {
          if (type.isInstance(attr)) {
            typedAttributes.push(attr)
          }
        })
        return typedAttributes
      },

      /** @return {number} */
      compare: function (x, y) {
        let posX = 0,
          posY = 0
        const attributesX = this.getCustomAttributesOfType(x, OptionGroupAttribute.$class)
        if (attributesX.length > 0) {
          posX = attributesX[0].position
        }
        const attributesY = this.getCustomAttributesOfType(y, OptionGroupAttribute.$class)
        if (attributesY.length > 0) {
          posY = attributesY[0].position
        }
        if (posX > posY) {
          return 1
        } else if (posX < posY) {
          return -1
        }
        return 0
      }
    })
  }
})

function isProperty(member) {
  return member.propertyMask > 0
}

function isReadWrite(property) {
  return (property.propertyMask & 2) === 2
}

/** @return {boolean} */
function startsWith(text, pattern) {
  return text.slice(0, pattern.length) === pattern
}

/** @return {Object} */
function visitMethod(method, yFilesObj) {
  // methods aren't used right now
  return new Object()
}

/** @return {boolean} */
function shouldIgnoreMember(member) {
  return startsWith(member.name, 'shouldHide') || startsWith(member.name, 'shouldDisable')
}

/** @return {Object} */
function getMemberObject(member) {
  const o = new Object()
  o['type'] = 'option'
  o['name'] = member.name
  return o
}

function pathToChild(members, name, path) {
  for (const member of members) {
    if (member.name === name) {
      path.push(member)
      return !0
    }

    if (member.type === 'group') {
      if (pathToChild(member.members, name, path)) {
        path.push(member)
        return !0
      }
    }
  }
  return !1
}

/**
 * The OptionEditor provides means to initialize and communicate with yFilesOptionUI.
 * The OptionEditor serves as interface class between the angular.js part - yFilesOptionUI - and the
 * configuration object which is generated using {@link ConfigConverter}.
 */
export const OptionEditor = Class('OptionEditor', {
  /**
   * Initialize the yFilesOptionUI angular.js application. Get a reference to the angular Service
   * "OptionConfig" which serves as an interface class to the angular.js application.
   * @param {Element} rootElement The HTML element the yFilesOptionUI is appended to.
   */
  constructor: function (rootElement) {
    this.converter = new ConfigConverter()

    const div = window.document.createElement('div')
    div.setAttribute('data-option-ui', '')

    rootElement.appendChild(div)

    const angular = window['angular']
    if (angular && angular['bootstrap']) {
      this.injector = angular['bootstrap'].apply(angular, [rootElement, ['yFilesOptionUI']])
      this.optionConfigService = this.injector['get'].apply(this.injector, ['OptionConfig'])
      this.eventBus = this.injector['get'].apply(this.injector, ['eventBus'])
    }
  },

  /**
   * @type {Object}
   */
  injector: null,

  /**
   * @type {Object}
   */
  optionConfigService: null,

  /**
   * @type {ConfigConverter}
   */
  converter: null,

  /**
   * @type {Object}
   */
  config1: null,

  /**
   * @type {function(boolean)}
   */
  validateCallback: null,

  addChangeListener: function (listener) {
    const eventBus = this.eventBus
    if (eventBus) {
      eventBus.addChangeListener(listener)
    }
  },

  expand: function (name) {
    const service = this.optionConfigService
    if (service) {
      const path = []
      pathToChild(service.config.membersArray, name, path)
      if (path.length > 0) {
        for (let i = path.length - 1; i > 0; --i) {
          path[i]._isCollapsed = !1
        }
      }
    }
  },

  setPresetName: function (presetName) {
    const service = this.optionConfigService
    if (service) {
      service.config._preset = presetName
      this.refresh()
    }
  },

  refresh: function () {
    const service = this.optionConfigService
    if (service) {
      service.forceDigest()
    }
  },

  reset: function () {
    const service = this.optionConfigService
    if (service) {
      service.resetConfig()
    }
  },

  /**
   * Get or set the configuration object in yFilesOptionUI. The configuration object is first
   * converted into a Javascript Object using {@link ConfigConverter} before setting it.
   * @type {Object}
   */
  config: {
    get: function () {
      return this.config1
    },
    set: function (value) {
      this.config1 = value
      const convertedConfig = this.config1 !== null ? this.converter.convert(this.config1) : null
      if (this.optionConfigService && this.optionConfigService['setConfig']) {
        this.optionConfigService['setConfig'].apply(this.optionConfigService, [
          convertedConfig,
          !!value.collapsedInitialization
        ])
      }
    }
  },

  /**
   * Get or set the form validation callback which is called when the validation result of
   * yFilesOptionUI changes.
   * @type {function(boolean)}
   */
  validateConfigCallback: {
    get: function () {
      return this.validateCallback
    },
    set: function (value) {
      if (this.optionConfigService && this.optionConfigService['setConfig']) {
        this.optionConfigService['setConfigValidCb'].apply(this.optionConfigService, [value])
        this.validateCallback = value
      }
    }
  }
})

/**
 * An attribute that determines the type of ui component that will be generated for the attributed
 * member.
 */
export const ComponentAttribute = Attribute('ComponentAttribute', {
  $extends: Attribute,

  /**
   * Initialize the ComponentAttribute.
   * @param {Components} value The type of ui component to be generated.
   */
  constructor: function (value) {
    Attribute.call(this)
    this.$initComponentAttribute()
    this.value = value
  },

  /**
   * Backing field for below property
   * @type {Components}
   */
  $value: null,

  /** @type {Components} */
  value: {
    get: function () {
      return this.$value
    },
    set: function (value) {
      this.$value = value
    }
  },

  $initComponentAttribute: function () {
    this.$value = Components.SLIDER
  }
})

/**
 * The ui components available in the generated UI.
 */
export const Components = Enum('Components', {
  SLIDER: 0,
  COMBOBOX: 1,
  RADIO_BUTTON: 2,
  CHECKBOX: 3,
  SPINNER: 4,
  HTML_BLOCK: 5
})

/**
 * @yjs:keep
 */
function typeOf(object) {
  return {}.toString
    .call(object)
    .match(/\s([a-zA-Z]+)/)
    .pop()
    .toLowerCase()
}

function createReferences(config) {
  function addMemberReferences(hierarchy) {
    for (let j = 0; j < hierarchy.length; j++) {
      const memberPointer = hierarchy[j]
      ;(memberPointer._member = members[memberPointer.name]),
        addMemberReferences(memberPointer.members || [], memberPointer)
    }
  }

  function addProperties(hierarchy, parentPointer, recursive) {
    function wrapRecFun(member, parentPointer) {
      return parentPointer
        ? function () {
            return (
              (member.isDisabled && member.isDisabled()) ||
              (parentPointer._recIsDisabled && parentPointer._recIsDisabled())
            )
          }
        : function () {
            return member.isDisabled
          }
    }

    for (let j = 0; j < hierarchy.length; j++) {
      const memberPointer = hierarchy[j]
      const member = memberPointer._member

      const isDisabledImpl = wrapRecFun(member, recursive && parentPointer)
      Object.defineProperty(memberPointer, '_recIsDisabled', { get: isDisabledImpl })

      if (memberPointer.type === 'option') {
        const isHiddenImpl = function () {
          return member.isHidden && member.isHidden()
        }
        Object.defineProperty(memberPointer, '_isHidden', { get: isHiddenImpl })
        const isChangedImpl = function () {
          return void 0 !== member.default && member.value !== member.default
        }
        Object.defineProperty(memberPointer, '_isChanged', { get: isChangedImpl })
      }

      addProperties(memberPointer.members || [], memberPointer, recursive || void 0 !== member)
    }
  }

  if (!config) {
    return null
  }
  var hierarchy = config.membersArray
  var members = config.members
  addMemberReferences(hierarchy)
  addProperties(hierarchy)
  return config
}

function newEventBus() {
  const bus = new Object()
  bus['listeners'] = []

  bus['addChangeListener'] = function (listener) {
    this.listeners.push(listener)
  }

  bus['emit'] = function (event) {
    for (const listener of this.listeners) {
      listener(event)
    }
  }

  bus['getEmitter'] = function () {
    return this.emit.bind(this)
  }
  return bus
}

!(function () {
  const module = angular.module('optionUiTabbar', [])
  module.directive('optionUiTabbar', function () {
    return {
      restrict: 'A',
      templateUrl: relativeTemplatePath + './components/option-ui-tabbar/option-ui-tabbar.html',
      scope: {
        tabs: '=',
        selected: '='
      },
      controller: [
        '$scope',
        function ($scope) {
          function initialize(newValue) {
            newValue && ($scope.setCurrentTab(0), $scope.moveSlider())
          }

          ;($scope.isCurrentTab = function (index) {
            return $scope.currentTab === index
          }),
            ($scope.setCurrentTab = function (index) {
              ;($scope.selected = $scope.tabs[index]), ($scope.currentTab = index)
            }),
            ($scope.moveSlider = function () {
              const length = 100 / $scope.tabs.length
              $scope.slide = {
                width: length + '%',
                left: $scope.currentTab * length + '%'
              }
            }),
            $scope.$watch('tabs', initialize)
        }
      ],
      link: function (scope, elem) {
        function insertAsNext(newChild, reference) {
          let parent = reference.parentNode,
            next = reference.nextElementSibling
          parent.insertBefore(newChild, next)
        }

        elem.addClass('option-ui-tabbar')
        const dropShadow = document.createElement('div')
        ;(dropShadow.className = 'option-ui-shadow'), insertAsNext(dropShadow, elem[0])
      }
    }
  }),
    module.filter('camelcase', function () {
      return function (items) {
        return items.replace(/[^A-Z0-9._-]/g, '')
      }
    })
})(),
  (function () {
    const module = angular.module('optionUiCollapse', [])
    module.directive('optionUiCollapse', function () {
      return {
        restrict: 'A',
        templateUrl:
          relativeTemplatePath + './components/option-ui-collapse/option-ui-collapse.html',
        transclude: !0,
        scope: { collapsed: '=' },
        controller: ['$scope', '$element', function () {}],
        link: function () {}
      }
    })
  })(),
  (function () {
    function createIcon(icon) {
      const graph = icons[icon]
      if (graph) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('viewBox', '0 0 ' + iconSize + ' ' + iconSize),
          (svg.style.pointerEvents = 'none')
        const doc = new DOMParser().parseFromString(graph, 'application/xml')
        return svg.appendChild(document.importNode(doc.documentElement, !0)), svg
      }
    }

    var module = angular.module('optionUiButton', []),
      iconSize = 24,
      icons = {
        chevronRight:
          '<g xmlns="http://www.w3.org/2000/svg"><polygon points="16.6,8.6 12,13.2 7.4,8.6 6,10 12,16 18,10 "></polygon></g>',
        chevronDown:
          '<g xmlns="http://www.w3.org/2000/svg"><polygon points="10,6 8.6,7.4 13.2,12 8.6,16.6 10,18 16,12 "></polygon></g>',
        undo: '<g xmlns="http://www.w3.org/2000/svg"><path d="M12,5V1.5l-5,5l5,5V7c3.3,0,6,2.7,6,6s-2.7,6-6,6c-3.3,0-6-2.7-6-6H4c0,4.4,3.6,8,8,8c4.4,0,8-3.6,8-8S16.4,5,12,5z"></path></g>'
      }
    module.directive('optionUiButton', function () {
      return {
        restrict: 'A',
        templateUrl: relativeTemplatePath + './components/option-ui-button/option-ui-button.html',
        scope: {
          label: '=',
          icon: '=',
          disabled: '=',
          clickCallback: '&'
        },
        controller: [
          '$scope',
          '$element',
          function ($scope, $element) {
            $scope.$watch('icon', function () {
              const old = $element.find('svg')
              old && old.remove()
              const svg = createIcon($scope.icon)
              if (svg) {
                svg.setAttribute('height', '100%'),
                  svg.setAttribute('width', '100%'),
                  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'),
                  (svg.style.display = 'block')
                const container = $element[0].querySelector('.icon')
                container.insertBefore(svg, container.firstElementChild)
              }
            })
          }
        ],
        link: function (scope, elem) {
          elem.addClass('option-ui-button')
        }
      }
    })
  })(),
  (function () {
    const module = angular.module('optionUiCheckbox', [])
    module.directive('optionUiCheckbox', function () {
      return {
        restrict: 'A',
        templateUrl:
          relativeTemplatePath + './components/option-ui-checkbox/option-ui-checkbox.html',
        scope: {
          option: '=',
          disabled: '='
        },
        controller: [
          '$scope',
          'eventBus',
          function ($scope, eventBus) {
            $scope.eventBus = eventBus
          }
        ],
        link: function (scope, elem) {
          elem.on('change', scope.eventBus.getEmitter())
        }
      }
    })
  })(),
  (function () {
    const module = angular.module('optionUiCombobox', [])
    module.directive('optionUiCombobox', function () {
      return {
        restrict: 'A',
        templateUrl:
          relativeTemplatePath + './components/option-ui-combobox/option-ui-combobox.html',
        scope: {
          option: '=',
          options: '=',
          disabled: '='
        },
        controller: [
          '$scope',
          'eventBus',
          function ($scope, eventBus) {
            $scope.eventBus = eventBus
          }
        ],
        link: function (scope, elem) {
          elem.on('change', scope.eventBus.getEmitter())
        }
      }
    })
  })(),
  (function () {
    const module = angular.module('optionUiDropdown', [])
    module.directive('optionUiDropdown', function () {
      return {
        restrict: 'A',
        templateUrl:
          relativeTemplatePath + './components/option-ui-dropdown/option-ui-dropdown.html',
        scope: {
          options: '=',
          selected: '='
        },
        controller: [
          '$scope',
          function ($scope) {
            function initialize(newValue) {
              newValue && $scope.setCurrentSelected(0)
            }

            ;($scope.setCurrentSelected = function (index) {
              ;($scope.selected = $scope.options[index]), ($scope.currentSelected = index)
            }),
              $scope.$watch('options', initialize),
              $scope.$watch('currentSelected', $scope.setCurrentSelected)
          }
        ],
        link: function (scope, elem) {
          function insertAsNext(newChild, reference) {
            let parent = reference.parentNode,
              next = reference.nextElementSibling
            parent.insertBefore(newChild, next)
          }

          elem.addClass('option-ui-dropdown')
          const dropShadow = document.createElement('div')
          ;(dropShadow.className = 'option-ui-shadow'), insertAsNext(dropShadow, elem[0])
        }
      }
    })
  })(),
  (function () {
    const module = angular.module('optionUiSlider', [])
    module.directive('optionUiSlider', function () {
      return {
        restrict: 'A',
        templateUrl: relativeTemplatePath + './components/option-ui-slider/option-ui-slider.html',
        scope: {
          option: '=',
          disabled: '='
        },
        controller: [
          '$scope',
          'eventBus',
          function ($scope, eventBus) {
            $scope.eventBus = eventBus
          }
        ],
        link: function (scope, elem) {
          elem.on('change', scope.eventBus.getEmitter())
        }
      }
    }),
      module.directive('optionUiNumberParser', [
        '$timeout',
        function ($timeout) {
          return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
              ctrl &&
                (ctrl.$parsers.push(function (value) {
                  return Number(value)
                }),
                $timeout(function () {
                  if (scope.option.valid !== !1) {
                    const oldval = scope.option.value
                    ;(scope.option.value = 0),
                      scope.$digest(),
                      (scope.option.value = oldval),
                      scope.$digest()
                  }
                }, 10))
            }
          }
        }
      ])
  })(),
  (function () {
    const module = angular.module('optionUiSpinner', [])
    module.directive('optionUiSpinner', [
      '$timeout',
      function () {
        return {
          restrict: 'A',
          templateUrl:
            relativeTemplatePath + './components/option-ui-spinner/option-ui-spinner.html',
          scope: {
            option: '=',
            disabled: '='
          },
          controller: [
            '$scope',
            'eventBus',
            function ($scope, eventBus) {
              $scope.eventBus = eventBus
            }
          ],
          link: function (scope, elem) {
            elem.on('change', scope.eventBus.getEmitter())
          }
        }
      }
    ])
  })(),
  (function () {
    const module = angular.module('optionUiText', [])
    module.directive('optionUiText', function () {
      return {
        restrict: 'A',
        templateUrl: relativeTemplatePath + './components/option-ui-text/option-ui-text.html',
        scope: {
          option: '=',
          options: '=',
          disabled: '='
        },
        controller: [
          '$scope',
          'eventBus',
          function ($scope, eventBus) {
            $scope.eventBus = eventBus
          }
        ],
        link: function (scope, elem) {
          elem.on('change', scope.eventBus.getEmitter())
        }
      }
    })
  })(),
  (function () {
    const module = angular.module('optionUiHtmlblock', [])
    module.directive('optionUiHtmlblock', function () {
      return {
        restrict: 'A',
        templateUrl:
          relativeTemplatePath + './components/option-ui-htmlblock/option-ui-htmlblock.html',
        scope: {
          option: '=',
          disabled: '='
        },
        controller: ['$scope', function () {}],
        link: function (scope, elem) {
          angular.element(elem.children()[0]).append(scope.option.value)
        }
      }
    })
  })()
var relativeTemplatePath = relativeTemplatePath || ''
!(function () {
  const module = angular.module('yFilesOptionUI', [
    'ngSanitize',
    'optionUiTabbar',
    'optionUiCollapse',
    'optionUiButton',
    'optionUiCheckbox',
    'optionUiCombobox',
    'optionUiSlider',
    'optionUiSpinner',
    'optionUiText',
    'optionUiHtmlblock'
  ])
  module.directive('optionUi', [
    'OptionConfig',
    function (OptionConfig) {
      return {
        restrict: 'A',
        templateUrl: relativeTemplatePath + './templates/option-ui.html',
        scope: {},
        controller: [
          '$scope',
          '$element',
          function ($scope, $element) {
            function updateContentHeight() {
              const oldHeight = contentContainer.style.height
              contentContainer.style.height = 0
              let uiBounds = uiContainer.getBoundingClientRect(),
                contentBounds = contentContainer.getBoundingClientRect(),
                parentBounds = parentNode.getBoundingClientRect(),
                diffBottom = uiBounds.bottom - contentBounds.bottom,
                height = parentBounds.bottom - diffBottom - contentBounds.top
              contentContainer.style.height = height ? height + 'px' : oldHeight
            }

            ;($scope.config = OptionConfig.getConfig()),
              $scope.$watch(
                function () {
                  return OptionConfig.getConfig()
                },
                function (newVal) {
                  $scope.config = newVal
                }
              )
            for (
              var uiContainer = $element[0],
                contentContainer = uiContainer.querySelector('.option-ui-content-container'),
                parentNode = uiContainer.parentNode;
              parentNode.className.indexOf('option-ui') > -1 ||
              parentNode.id.indexOf('option-ui') > -1;

            ) {
              parentNode = parentNode.parentNode
            }
            window.setTimeout(updateContentHeight, 1e3),
              document.body.addEventListener('resize', updateContentHeight, !1)
          }
        ],
        link: function (scope, elem) {
          elem.addClass('option-ui')
        }
      }
    }
  ]),
    module.directive('optionUiForm', [
      '$templateCache',
      '$http',
      '$compile',
      function ($templateCache, $http, $compile) {
        return {
          restrict: 'A',
          scope: {
            presetName: '=',
            members: '=',
            accordeon: '@'
          },
          controller: [
            '$scope',
            function ($scope) {
              ;(this.setCollapseFunction = function (fun) {
                $scope.toggleCollapsed = fun
              }),
                (this.$watch = function (watchExpression, listener) {
                  $scope.$watch(watchExpression, listener)
                }),
                ($scope.toggleCollapsed = function (member) {
                  member._isCollapsed = !member._isCollapsed
                })
            }
          ],
          link: function (scope, elem) {
            function compile(html) {
              const compiledContents = $compile(html)
              compiledContents(scope, function (clone) {
                elem.append(clone)
              })
            }

            let templateUrl = relativeTemplatePath + './templates/option-ui-form.html',
              html = $templateCache.get(templateUrl)
            void 0 === html
              ? $http.get(templateUrl).success(function (data) {
                  $templateCache.put(templateUrl, data), compile(data)
                })
              : compile(html)
          }
        }
      }
    ]),
    module.directive('accordeon', function () {
      return {
        restrict: 'A',
        require: '?optionUiForm',
        link: function (scope, elem, attrs, ctrl) {
          ctrl &&
            ctrl.setCollapseFunction(function (member, members) {
              member._isCollapsed = !member._isCollapsed
            })
        }
      }
    }),
    module.directive('optionUiItem', function () {
      return {
        restrict: 'A',
        scope: {
          option: '=',
          disabled: '='
        },
        templateUrl: relativeTemplatePath + './templates/option-ui-item.html',
        controller: ['$scope', function () {}],
        link: function (scope, elem) {
          elem.addClass('option-ui-item')
        }
      }
    }),
    module.directive('revert', [
      '$templateCache',
      '$http',
      '$compile',
      function ($templateCache, $http, $compile) {
        return {
          restrict: 'A',
          require: '?^^optionUiItem',
          link: function (scope, elem, attr, ctrl) {
            function compile(html) {
              const compiledContents = $compile(html)
              compiledContents(scope, function (clone) {
                elem.append(clone)
              })
            }

            if (ctrl) {
              let templateUrl = relativeTemplatePath + './templates/option-ui-revert.html',
                html = $templateCache.get(templateUrl)
              void 0 === html
                ? $http.get(templateUrl).success(function (data) {
                    $templateCache.put(templateUrl, data), compile(data)
                  })
                : compile(html)
            }
          },
          controller: [
            '$scope',
            function ($scope) {
              $scope.$watch('option', function (newValue) {
                newValue && newValue.reset && ($scope.clickCallback = newValue.reset)
              })
            }
          ]
        }
      }
    ]),
    module.directive('optionUiValidate', [
      '$compile',
      'OptionConfig',
      function ($compile, OptionConfig) {
        return {
          require: 'ngModel',
          restrict: 'A',
          link: function (scope) {
            scope.$watch('ctrlForm.input.$valid', function (validity) {
              ;(scope.option.valid = validity), OptionConfig.updateConfigValidity()
            })
          }
        }
      }
    ])
})(),
  (function () {
    const module = angular.module('yFilesOptionUI')
    module.value('eventBus', newEventBus())
    module.service('OptionConfig', [
      '$rootScope',
      function ($rootScope) {
        ;(this.config = null),
          (this.configValidCb = null),
          (this.getConfig = function () {
            return this.config
          }),
          (this.setConfig = function (obj, collapsedInit) {
            ;(this.config = createReferences(obj)),
              this.config != null &&
                (angular.forEach(this.config.membersArray, function (member) {
                  member._isCollapsed = !0
                }),
                !collapsedInit && (this.config.membersArray[0]._isCollapsed = !1)),
              $rootScope.$$phase || $rootScope.$apply()
          }),
          (this.resetConfig = function () {
            this.config != null &&
              angular.forEach(this.config.members, function (member) {
                member.reset && member.reset()
              })
          }),
          (this.forceDigest = function () {
            $rootScope.$digest()
          }),
          (this.setConfigValidCb = function (fn) {
            this.configValidCb = fn
          }),
          (this.updateConfigValidity = function () {
            let self = this,
              valid = !0
            angular.forEach(this.config.members, function (member) {
              void 0 !== member.valid && member.valid === !1 && (valid = !1)
            }),
              self.configValidCb !== null &&
                typeof self.configValidCb === 'function' &&
                self.configValidCb(valid)
          })
      }
    ])
  })()
