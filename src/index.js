import React from 'react'
import Immutable from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import extend from 'lodash/extend'

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
 * assemblePath
 *
 * A helper function to assemble the current path from `props`
 *
 * @param  {Object} props
 * @return {Array} [path]
 */

function assemblePath (props = {}) {
  let { serializedPath } = props
  let { serializedIndex } = props
  let { name } = props
  let path = serializedPath ? serializedPath : []
  path = path.slice(0)

  if (serializedIndex != null) {
    path.push(serializedIndex)
  }

  path.push(name)
  return path
}

// Join our path into an HTML array foo[bar][baz]
/**
 * serializeName
 * Join our path and return a string
 * @param  {Array} path : [["foo"], ["bar"], ["baz"]]
 * @return {String} name : "foo[bar][baz]"
 */

function serializeName (path) {
  return path.map((s, i) => {
    return i === 0 ? s : '[' + s + ']'
  }).join('')
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
  const path = assemblePath(props)
  return React.createElement(
    'div',
    null,
    React.Children.map(props.children, child => {
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
  const path = assemblePath(props)
  const { children } = props
  return React.createElement(
    'div',
    null,
    children.map(function renderSet (children, setIndex) {
      if (Immutable.List.isList(children)) {
        return children.map(function renderChild (child, index) {
          return React.cloneElement(child, {
            serializedPath: path,
            serializedIndex: index
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
  const path = assemblePath(props)
  const { value } = props
  const serializedName = serializeName(path)

  return React.createElement(
    'input',
    {
      'type': 'hidden',
      'name': serializedName,
      'value': value
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
  return componentProps => {
    const props = extend({}, componentProps, additionalProps)
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

export default function serialize (options = {}) {
  const { prefix } = options
  const additionalProps = {
    serializedPath: prefix ? [prefix] : []
  }
  return {
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
}
