/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * This file contains helper functions for the demos/README.html file.
 */

/* eslint-disable no-shadow-restricted-names,no-var,no-eval,no-undef */

'use strict'
;(function() {
  var enableES6warning =
    window.location.hostname.indexOf('yworks.') < 0 &&
    window.location.pathname.indexOf('demos-es5') < 0 &&
    !hasEs6Support()

  if (enableES6warning) {
    document.getElementById('no-ecmascript6').removeAttribute('style')
    var tutorials = document.getElementById('tutorials')
    tutorials && blockEs6Demos(tutorials.getElementsByTagName('a'))
    var demoGrid = document.querySelector('.demo-grid')
    demoGrid && blockEs6Demos(demoGrid.getElementsByTagName('a'))
    var sidebar = document.getElementById('sidebar')
    sidebar && blockEs6Demos(sidebar.getElementsByTagName('a'))
  }

  if (window.location.protocol.indexOf('file') >= 0) {
    document.getElementById('localhost-notice').removeAttribute('style')
  }

  function hasEs6Support() {
    try {
      // ES6 features that we want to detect
      eval('class Foo {}')
      eval('const foo = "bar"')
      eval('let bar = (x) => x+1')
    } catch (ignored) {
      return false
    }
    return true
  }

  function blockEs6Demos(aElementList) {
    for (var i = 0; i < aElementList.length; i++) {
      var link = aElementList[i]
      if (link.getAttribute('href').indexOf('index.html') > 0) {
        link.addEventListener('click', function(e) {
          window.scrollTo(0, 0)
          var notice = document.getElementById('no-ecmascript6')
          notice.setAttribute('class', notice.getAttribute('class') + ' highlight-important')
          window.setTimeout(function() {
            notice.setAttribute(
              'class',
              notice.getAttribute('class').replace(' highlight-important', '')
            )
          }, 600)
          e.preventDefault()
        })
      }
    }
  }
})()
;(function() {
  // Check whether the demo data is available. Otherwise, this is used in a README file of the tutorials
  if (window.getDemoData == null) {
    return
  }

  var isViewerPackage = document.title.indexOf('Viewer') > -1
  var viewerCategories = ['tutorial', 'input', 'style', 'integration', 'view']
  var excludeLayoutDemos = ['Angular CLI', 'AngularJS 1', 'Neo4j']

  var demos = window.getDemoData().filter(function(item) {
    if (isViewerPackage) {
      return (
        viewerCategories.indexOf(item.category) !== -1 &&
        excludeLayoutDemos.indexOf(item.name) === -1
      )
    } else {
      return item.category !== 'tutorial step'
    }
  })

  var gridItemTemplate = document.querySelector('#grid-item-template')
  var accordionItemTemplate = document.querySelector('#accordion-template')

  function createGridItem(demo, index) {
    var gridItem = document.createElement('div')
    gridItem.className = 'grid-item'
    gridItem.innerHTML = gridItemTemplate.innerHTML.replace(/{{([^}]+)}}/gi, function(
      match,
      propertyName
    ) {
      if (propertyName === 'index') {
        return index + 2
      } else if (demo.hasOwnProperty(propertyName)) {
        return demo[propertyName]
      } else {
        // console.warn("Property '" + propertyName + "' not found in demo: " + demo.name);
        return ''
      }
    })
    if (demo.tags) {
      var tagContainer = gridItem.querySelector('.tags')
      demo.tags.forEach(function(tag) {
        var tagItem = document.createElement('span')
        var anchor = document.createElement('a')
        anchor.setAttribute('href', '#' + tag)
        tagItem.className += ' tag'
        anchor.textContent = tag
        tagItem.appendChild(anchor)
        tagContainer.appendChild(tagItem)
      })
    }
    return gridItem
  }

  function createAccordionItem(category) {
    var item = document.createElement('div')
    item.innerHTML = accordionItemTemplate.innerHTML.replace(/{{([^}]+)}}/gi, function(
      match,
      propertyName
    ) {
      if (category.hasOwnProperty(propertyName)) {
        return category[propertyName]
      } else {
        // console.warn("Property '" + propertyName + "' not found in demo: " + demo.name);
        return ''
      }
    })
    return item.firstElementChild
  }

  function createSidebarItem(demo) {
    var sidebarItem = document.createElement('div')
    var link = document.createElement('a')
    link.textContent = demo.name
    link.setAttribute('href', demo.demoPath)
    sidebarItem.appendChild(link)
    return sidebarItem
  }

  function insertSortedChild(parent, newChild) {
    var children = parent.querySelectorAll('div')
    parent.appendChild(newChild)
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.textContent > newChild.textContent) {
        parent.insertBefore(newChild, child)
        break
      }
    }
  }

  /**
   * @param {object} demo The JSON data of a demo
   * @param {string} needle A whitespace-separated list of search terms
   */
  function matchDemo(demo, needle) {
    const words = needle.split(/\s+/)
    return words
      .map(function(word) {
        return matchWord(demo, word)
      })
      .reduce(function(prev, curr) {
        return prev && curr
      }, true)
  }

  /**
   * @param {object} demo The JSON data of a demo
   * @param {string} word A single search term
   */
  function matchWord(demo, word) {
    var regex = new RegExp(word, 'gi')
    if (regex.test(demo.name)) {
      return true
    }
    if (
      demo.tags.some(function(tag) {
        return regex.test(tag)
      })
    ) {
      return true
    }
    if (
      demo.keywords &&
      demo.keywords.some(function(tag) {
        return regex.test(tag)
      })
    ) {
      return true
    }
    if (regex.test(demo.category)) {
      return true
    }
    return regex.test(demo.summary)
  }

  var demoGrid = document.querySelector('.demo-grid')
  demos.forEach(function(demo, index) {
    var gridItem = createGridItem(demo, index)
    demoGrid.appendChild(gridItem)
    demo.element = gridItem
    var sidebarItem = createSidebarItem(demo)
    var element = document.querySelector('.demo-items-' + demo.category)
    if (!element) {
      document.querySelector('.sidebar').appendChild(createAccordionItem({ title: demo.category }))
      element = document.querySelector('.demo-items-' + demo.category)
    }
    insertSortedChild(element, sidebarItem)
    demo.sidebarElement = sidebarItem
  })

  var notice = document.getElementById('online-notice')
  if (window.location.hostname.indexOf('yworks.') >= 0) {
    notice.setAttribute('style', 'display:none')
  }

  var searchBox = document.querySelector('#search')
  searchBox.addEventListener('input', searchBoxChanged)
  searchBox.addEventListener('click', searchBoxClicked)
  searchBox.addEventListener('blur', function(e) {
    searchBox.addEventListener('click', searchBoxClicked)
  })

  function onHashChange() {
    if (location.hash && location.hash.length > 1 && location.hash.charAt(0) === '#') {
      searchBox.value = decodeURIComponent(location.hash.substr(1))
      searchBoxChanged()
    } else {
      searchBox.value = ''
      searchBoxChanged()
    }
  }

  window.onhashchange = onHashChange
  onHashChange()
  searchBoxChanged()

  function searchBoxClicked(evt) {
    searchBox.select()
    searchBox.removeEventListener('click', searchBoxClicked)
    location.hash = searchBox.textContent
  }

  function searchBoxChanged(evt) {
    demos.forEach(function(demo) {
      if (matchDemo(demo, searchBox.value)) {
        demo.element.className = 'grid-item'
        demo.sidebarElement.className = ''
      } else {
        demo.element.className = 'grid-item filtered'
        demo.sidebarElement.className = 'filtered'
      }
    })
  }
})()
