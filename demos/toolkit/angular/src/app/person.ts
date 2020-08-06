/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IPropertyObservable } from 'yfiles'

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
  private readonly _status: string
  private readonly _icon: string

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

  constructor({
    position,
    name,
    email,
    phone,
    fax,
    businessUnit,
    status,
    icon
  }: {
    position: string
    name: string
    email: string
    phone: string
    fax: string
    businessUnit: string
    status: string
    icon: string
  }) {
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
