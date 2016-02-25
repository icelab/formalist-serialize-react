var React = require('react')
var Immutable = require('immutable')
var ImmutablePropTypes = require('react-immutable-proptypes')
var extend = require('lodash/extend')

/**
 * passThrough
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */
function passThrough (props) {
  return props.children
}

/**
 * Attr
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */
function attr (props) {
  // Assemble the current path
  var path = props.serializedPath || []
  path = path.slice(0)
  path.push(props.name)
  return React.createElement(
    'div',
    null,
    React.Children.map(props.children, function (child) {
      return React.cloneElement(child, {
        serializedPath: path
      })
    })
  )
}

attr.propTypes = {
  name: React.PropTypes.string.isRequired,
  serializedPath: React.PropTypes.array,
  children: ImmutablePropTypes.list.isRequired
}

/**
 * Many
 *
 * A stateless React wrapper for components that simply returns
 * its children.
 *
 * @param  {Object} props Props matching a node in a formalist AST
 * @return {Array} Array-ish of children
 */
function many (props) {
  // Assemble the current path
  var path = props.serializedPath || []
  var sets = props.children
  path = path.slice(0)
  path.push(props.name)
  return React.createElement(
    'div',
    null,
    sets.map(function renderSet (children, setIndex) {
      if (Immutable.List.isList(children)) {
        return children.map(function renderChild (child, index) {
          return React.cloneElement(child, {
            serializedPath: path,
            serializedIndex: setIndex
          })
        })
      } else {
        return React.cloneElement(children, {
          serializedPath: path,
          serializedIndex: setIndex
        })
      }
    })
  )
}

many.propTypes = {
  name: React.PropTypes.string.isRequired,
  serializedPath: React.PropTypes.array,
  children: ImmutablePropTypes.list.isRequired
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
  // Assemble the current path
  var path = props.serializedPath || []
  path = path.slice(0)
  if (props.serializedIndex !== undefined && props.serializedIndex !== null) {
    path.push(props.serializedIndex)
  }
  path.push(props.name)

  // Join our path into an HTML array foo[bar][baz]
  var serializedName = path.map(function (s, i) {
    if (i === 0) {
      return s
    } else {
      return '[' + s + ']'
    }
  }).join('')

  return React.createElement(
    'input',
    {
      'type': 'hidden',
      'name': serializedName,
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
  ]),
  serializedPath: React.PropTypes.array,
  serializedIndex: React.PropTypes.number
}

/**
 * Wrap a passed `component` by returning a function that will call it with
 * new `additionalProps` mixed in
 * @param  {ReactComponent} component
 * @param  {Object} additionalProps
 * @return {Function}
 */
function wrapComponent (component, additionalProps) {
  return function (componentProps) {
    var props = extend({}, componentProps, additionalProps)
    return React.createElement(
      component,
      props
    )
  }
}

/**
 * Map input/wrappers to the various formalist-schema
 * @param  {Object} options Options hash: { prefix: String }
 * @return {Object} A object referencing the various React components above
 */
module.exports = function serialize (options) {
  options = options || {}
  var additionalProps = {
    serializedPath: (options.prefix) ? [options.prefix] : []
  }
  var components = {
    fields: {
      bool: wrapComponent(input, additionalProps),
      int: wrapComponent(input, additionalProps),
      date: wrapComponent(input, additionalProps),
      date_time: wrapComponent(input, additionalProps),
      decimal: wrapComponent(input, additionalProps),
      float: wrapComponent(input, additionalProps),
      string: wrapComponent(input, additionalProps)
    },
    attr: wrapComponent(attr, additionalProps),
    many: wrapComponent(many, additionalProps),
    group: passThrough,
    section: passThrough
  }
  return components
}
