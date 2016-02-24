var React = require('react')

/**
 * Wrapper
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */
function wrapper (props) {
  return props.children
}

/**
 * Input
 *
 * Stateless React component that creates a hidden input for a given
 * field and outputs its value.
 *
 * @return {ReactComponent}
 */
function input (props) {
  return React.createElement(
    'input',
    {
      'type': 'hidden',
      'name': props.name,
      'value': props.value
    }
  )
}
input.propTypes = {
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.number,
    React.PropTypes.string
  ])
}
var inputFactory = React.createFactory(input)

/**
 * Map input/wrappers to the various formalist-schema
 * @type {Object}
 */
module.exports = {
  fields: {
    bool: inputFactory,
    int: inputFactory,
    date: inputFactory,
    date_time: inputFactory,
    decimal: inputFactory,
    float: inputFactory,
    string: inputFactory
  },
  attr: wrapper,
  group: wrapper,
  many: wrapper,
  section: wrapper
}
