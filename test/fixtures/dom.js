var jsdom = require('jsdom')

// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access

module.exports = function createDOM () {
  global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
  global.window = document.defaultView
  global.navigator = { userAgent: 'node.js' }
}
