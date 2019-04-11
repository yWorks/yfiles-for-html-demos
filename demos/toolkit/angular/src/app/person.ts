import { BaseClass, IPropertyObservable, PropertyChangedEventArgs } from 'yfiles'

/**
 * Class for representing one person. It implements {@link IPropertyObservable} so that {@link TemplateNodeStyle} can
 * listen to changes and update the node visualization accordingly.
 */
export class Person {
  private listeners = []
  private _position: string
  private _name: string
  private _email: string
  private _phone: string
  private _fax: string
  private _businessUnit: string
  private _status: string
  private _icon: string

  get position() {
    return this._position
  }
  get name() {
    return this._name
  }
  get email() {
    return this._email
  }
  get phone() {
    return this._phone
  }
  get fax() {
    return this._fax
  }
  get businessUnit() {
    return this._businessUnit
  }
  get status() {
    return this._status
  }
  get icon() {
    return this._icon
  }

  set name(value) {
    this._name = value
  }
  set position(value) {
    this._position = value
  }
  set email(value) {
    this._email = value
  }
  set phone(value) {
    this._phone = value
  }
  set fax(value) {
    this._fax = value
  }
  set businessUnit(value) {
    this._businessUnit = value
  }

  constructor({ position, name, email, phone, fax, businessUnit, status, icon }) {
    this._position = position
    this._name = name
    this._email = email
    this._phone = phone
    this._fax = fax
    this._businessUnit = businessUnit
    this._status = status
    this._icon = icon
  }
}
