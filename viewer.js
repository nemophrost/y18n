var applyStyle = function (node, styles) {
  Object.keys(styles).forEach(function (key) {
    node.style[key] = styles[key]
  })
}

var createOrGet = function (tagName, id) {
  id = 'y18n-' + id
  var el = document.getElementById(id)
  if (el) { return el }
  el = document.createElement(tagName)
  el.id = id
  return el
}

var getLocalesWithUpdates = function () {
  return Object.keys(window.localStorage).filter(function (key) {
    return /y18n-/.test(key)
  }).map(function (key) {
    return key.substr(5)
  })
}

var renderTabs = function (y18n, textarea, locales, selectedLocale) {
  var tabs = createOrGet('div', 'tabs')
  applyStyle(tabs, {
    position: 'absolute',
    bottom: '40px',
    left: '40px',
    right: '40px',
    borderTop: 'black solid 1px'
  })
  // clear out tabs
  tabs.innerHTML = ''

  // add tabs
  locales.forEach(function (locale, i) {
    var tab = createOrGet('div', 'tab' + i)
    var selected = locale === selectedLocale
    applyStyle(tab, {
      float: 'left',
      display: 'block',
      top: '40px',
      left: '40px',
      padding: '4px 10px',
      borderRight: 'black solid 1px',
      lineHeight: '18px',
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: selected ? 'white' : 'black',
      backgroundColor: selected ? 'black' : 'white',
      cursor: 'pointer'
    })
    tab.onclick = function () {
      renderTabs(y18n, textarea, locales, locale)
    }
    tab.innerHTML = locale
    tabs.appendChild(tab)
  })

  // set textarea
  textarea.value = (selectedLocale && y18n.getUpdates(selectedLocale)) || ''

  // add clear button
  var clearBtn = createOrGet('div', 'clr')
  if (selectedLocale && (locales.length > 0)) {
    applyStyle(clearBtn, {
      position: 'absolute',
      top: '-40px',
      right: '10px',
      padding: '4px 10px',
      borderRadius: '3px',
      lineHeight: '18px',
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: 'white',
      backgroundColor: '#a00',
      cursor: 'pointer'
    })
    clearBtn.onclick = function () {
      y18n.clearUpdates(selectedLocale)
      renderTabs(y18n, textarea, getLocalesWithUpdates(), null)
    }
    clearBtn.innerHTML = 'Clear `' + selectedLocale + '` from local storage'
    tabs.appendChild(clearBtn)
  } else if (clearBtn.parentNode) {
    clearBtn.parentNode.removeChild(clearBtn)
  }

  return tabs
}

var showUpdates = function (y18n, locale) {
  if (!y18n || (typeof document === 'undefined')) {
    return
  }

  var backdrop = createOrGet('div', 'bd')
  applyStyle(backdrop, {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 99999
  })

  var textarea = createOrGet('textarea', 'ta')
  applyStyle(textarea, {
    position: 'absolute',
    top: '40px',
    left: '40px',
    width: (window.innerWidth - 80) + 'px',
    height: (window.innerHeight - 80) + 'px',
    padding: '10px 10px 80px',
    resize: 'none',
    border: 'none'
  })

  var tabs = renderTabs(y18n, textarea, getLocalesWithUpdates(), y18n.getLocale())

  var doneBtn = createOrGet('div', 'btn')
  applyStyle(doneBtn, {
    position: 'absolute',
    top: '28px',
    right: '28px',
    width: '40px',
    height: '40px',
    backgroundColor: 'black',
    boxSizing: 'border-box',
    border: 'white solid 3px',
    borderRadius: '20px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.4)',
    textAlign: 'center',
    lineHeight: '34px',
    fontSize: '18px',
    fontFamily: 'sans-serif',
    color: 'white',
    cursor: 'pointer'
  })
  doneBtn.innerHTML = '×'
  doneBtn.onclick = function () {
    document.body.removeChild(backdrop)
  }

  backdrop.appendChild(textarea)
  backdrop.appendChild(tabs)
  backdrop.appendChild(doneBtn)
  document.body.appendChild(backdrop)
}

module.exports = {
  showUpdates: showUpdates
}
