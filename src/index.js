import React from 'react'
import { List } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'

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

  if (name != null) {
    path.push(name)
  }

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
    (children.count() > 0) ? children.map(function renderSet (children, setIndex) {
      if (List.isList(children)) {
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
    }) : React.createElement(input, {
      value: '',
      serializedPath: path
    })
  )
}

many.propTypes = {
  name: React.PropTypes.string.isRequired,
  serializedPath: React.PropTypes.array,
  children: ImmutablePropTypes.list.isRequired
}

/**
 * List
 *
 * @return {ReactComponent}
 */

function list (props) {
  const path = assemblePath(props)
  const { value } = props
  return React.createElement(
    'div',
    null,
    (value) ? value.map(function renderValue (value, index) {
      return React.createElement(input, {
        key: `${path}-${index}`,
        value,
        serializedPath: path,
        serializedIndex: ''
      })
    }) : React.createElement(input, {
      value: '',
      serializedPath: path
    })
  )
}

list.propTypes = {
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.any,
  serializedPath: React.PropTypes.array
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
  value: React.PropTypes.any,
  serializedPath: React.PropTypes.array,
  serializedIndex: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ])
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
    const props = Object.assign({}, componentProps, additionalProps)
    return React.createElement(
      component,
      props
    )
  }
}

/**
 * Map input/wrappers to the various formalist-schema
 * @param  {Object} options Options hash: { prefix: String, additionalFieldTypes: [] }
 * @return {Object} A object referencing the various React components above
 */

export default function serialize (options = {}) {
  const { prefix, additionalFieldTypes } = options
  const additionalProps = {
    serializedPath: prefix ? [prefix] : []
  }
  const definition = {
    fields: {
      checkBox: wrapComponent(input, additionalProps),
      dateField: wrapComponent(input, additionalProps),
      dateTimeField: wrapComponent(input, additionalProps),
      hiddenField: wrapComponent(input, additionalProps),
      multiSelectionField: wrapComponent(list, additionalProps),
      numberField: wrapComponent(input, additionalProps),
      radioButtons: wrapComponent(input, additionalProps),
      selectBox: wrapComponent(input, additionalProps),
      selectionField: wrapComponent(input, additionalProps),
      textArea: wrapComponent(input, additionalProps),
      textField: wrapComponent(input, additionalProps)
    },
    attr: wrapComponent(attr, additionalProps),
    many: wrapComponent(many, additionalProps),
    compoundField: passThrough,
    group: passThrough,
    section: passThrough
  }

  // Allow for serialization of any custom field types
  if (additionalFieldTypes) {
    additionalFieldTypes.forEach((type) => {
      definition.fields[type] = wrapComponent(input, additionalProps)
    })
  }

  return definition
}
